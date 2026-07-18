import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import {
	users,
	adminUsers,
	adminSessions,
	posts,
	projects,
	mediaFiles,
	githubSyncStatus,
	rateLimits,
	githubSettings,
	type User,
	type InsertUser,
	type AdminUser,
	type InsertAdminUser,
	type Post,
	type InsertPost,
	type Project,
	type InsertProject,
	type MediaFile,
	type InsertMediaFile,
	type AdminSession,
	type GithubSyncStatus,
} from "@shared/schema";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";

// Database connection
const sqlite = new Database(process.env.DATABASE_URL || "data/portfolio.db");
const db = drizzle(sqlite);

// Encryption key for GitHub token (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = Buffer.from(
	process.env.ENCRYPTION_KEY || "01234567890123456789012345678901", // Fallback for dev only
	"utf-8",
);
const IV_LENGTH = 16; // For AES, this is always 16 bytes

// Encryption utilities
function encrypt(text: string): string {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
	const textParts = text.split(":");
	const iv = Buffer.from(textParts.shift()!, "hex");
	const encryptedText = Buffer.from(textParts.join(":"), "hex");
	const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

// Storage interface with admin functionality
export interface IStorage {
	// Legacy user methods
	getUser(id: number): Promise<User | undefined>;
	getUserByUsername(username: string): Promise<User | undefined>;
	createUser(user: InsertUser): Promise<User>;

	// Admin user methods
	createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
	getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
	getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
	getAdminUserById(id: number): Promise<AdminUser | undefined>;
	updateAdminUserLastLogin(id: number): Promise<void>;

	// Session management
	createAdminSession(
		userId: number,
		refreshToken: string,
		expiresAt: Date,
	): Promise<AdminSession>;
	getAdminSession(refreshToken: string): Promise<AdminSession | undefined>;
	revokeAdminSession(refreshToken: string): Promise<void>;
	revokeAllAdminSessions(userId: number): Promise<void>;

	// Post management
	createPost(post: InsertPost & { authorId: number }): Promise<Post>;
	getPost(id: number): Promise<Post | undefined>;
	getPostBySlug(slug: string): Promise<Post | undefined>;
	getAllPosts(published?: boolean): Promise<Post[]>;
	updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
	deletePost(id: number): Promise<void>;

	// Project management
	createProject(
		project: InsertProject & { authorId: number },
	): Promise<Project>;
	getProject(id: number): Promise<Project | undefined>;
	getProjectBySlug(slug: string): Promise<Project | undefined>;
	getAllProjects(published?: boolean): Promise<Project[]>;
	updateProject(
		id: number,
		project: Partial<InsertProject>,
	): Promise<Project | undefined>;
	deleteProject(id: number): Promise<void>;

	// Media management
	createMediaFile(
		media: InsertMediaFile & { uploadedBy: number },
	): Promise<MediaFile>;
	getMediaFile(id: number): Promise<MediaFile | undefined>;
	getAllMediaFiles(): Promise<MediaFile[]>;
	deleteMediaFile(id: number): Promise<void>;

	// GitHub sync
	updateGithubSyncStatus(
		entityType: string,
		entityId: number,
		githubPath: string,
		syncStatus: string,
		errorMessage?: string,
	): Promise<void>;
	getGithubSyncStatus(
		entityType: string,
		entityId: number,
	): Promise<GithubSyncStatus | undefined>;

	// Rate limiting
	getRateLimit(
		identifier: string,
		endpoint: string,
	): Promise<{ attempts: number; resetTime: Date } | undefined>;
	updateRateLimit(
		identifier: string,
		endpoint: string,
		attempts: number,
		resetTime: Date,
	): Promise<void>;

	// GitHub settings
	getGitHubToken(): Promise<string | null>;
	saveGitHubToken(token: string): Promise<void>;

	// Utility methods
	initializeDatabase(): Promise<void>;
	createDefaultAdmin(): Promise<void>;
}

export class SqliteStorage implements IStorage {
	async initializeDatabase(): Promise<void> {
		// Create data directory if it doesn't exist
		const fs = await import("fs");
		const path = await import("path");

		const dataDir = path.dirname(
			process.env.DATABASE_URL || "data/portfolio.db",
		);
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}

		// Run migrations would go here in production
		console.log("Database initialized");
	}

	async createDefaultAdmin(): Promise<void> {
		const existingAdmin = await this.getAdminUserByUsername("admin");
		if (!existingAdmin) {
			const hashedPassword = await bcrypt.hash("admin123", 12);
			await this.createAdminUser({
				username: "admin",
				email: "admin@portfolio.com",
				passwordHash: hashedPassword,
			});
			console.log("✅ Default admin user created!");
			console.log("👤 Admin Credentials:");
			console.log("   Username: admin");
			console.log("   Email: admin@portfolio.com");
			console.log("   Password: admin123");
		}
	}

	// Legacy user methods
	async getUser(id: number): Promise<User | undefined> {
		const result = await db.select().from(users).where(eq(users.id, id));
		return result[0];
	}

	async getUserByUsername(username: string): Promise<User | undefined> {
		const result = await db
			.select()
			.from(users)
			.where(eq(users.username, username));
		return result[0];
	}

	async createUser(insertUser: InsertUser): Promise<User> {
		const result = await db.insert(users).values(insertUser).returning();
		return result[0];
	}

	// Admin user methods
	async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
		const result = await db
			.insert(adminUsers)
			.values({
				...user,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		return result[0];
	}

	async getAdminUserByUsername(
		username: string,
	): Promise<AdminUser | undefined> {
		const result = await db
			.select()
			.from(adminUsers)
			.where(eq(adminUsers.username, username));
		return result[0];
	}

	async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
		const result = await db
			.select()
			.from(adminUsers)
			.where(eq(adminUsers.email, email));
		return result[0];
	}

	async getAdminUserById(id: number): Promise<AdminUser | undefined> {
		const result = await db
			.select()
			.from(adminUsers)
			.where(eq(adminUsers.id, id));
		return result[0];
	}

	async updateAdminUserLastLogin(id: number): Promise<void> {
		await db
			.update(adminUsers)
			.set({ lastLoginAt: new Date() })
			.where(eq(adminUsers.id, id));
	}

	// Session management
	async createAdminSession(
		userId: number,
		refreshToken: string,
		expiresAt: Date,
	): Promise<AdminSession> {
		const result = await db
			.insert(adminSessions)
			.values({
				userId,
				refreshToken,
				expiresAt,
				createdAt: new Date(),
			})
			.returning();
		return result[0];
	}

	async getAdminSession(
		refreshToken: string,
	): Promise<AdminSession | undefined> {
		const result = await db
			.select()
			.from(adminSessions)
			.where(
				and(
					eq(adminSessions.refreshToken, refreshToken),
					eq(adminSessions.isRevoked, false),
				),
			);
		return result[0];
	}

	async revokeAdminSession(refreshToken: string): Promise<void> {
		await db
			.update(adminSessions)
			.set({ isRevoked: true })
			.where(eq(adminSessions.refreshToken, refreshToken));
	}

	async revokeAllAdminSessions(userId: number): Promise<void> {
		await db
			.update(adminSessions)
			.set({ isRevoked: true })
			.where(eq(adminSessions.userId, userId));
	}

	// Post management
	async createPost(post: InsertPost & { authorId: number }): Promise<Post> {
		const result = await db
			.insert(posts)
			.values({
				...post,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		return result[0];
	}

	async getPost(id: number): Promise<Post | undefined> {
		const result = await db.select().from(posts).where(eq(posts.id, id));
		return result[0];
	}

	async getPostBySlug(slug: string): Promise<Post | undefined> {
		const result = await db.select().from(posts).where(eq(posts.slug, slug));
		return result[0];
	}

	async getAllPosts(published?: boolean): Promise<Post[]> {
		if (published !== undefined) {
			return await db
				.select()
				.from(posts)
				.where(eq(posts.isPublished, published));
		}
		return await db.select().from(posts);
	}

	async updatePost(
		id: number,
		post: Partial<InsertPost>,
	): Promise<Post | undefined> {
		const result = await db
			.update(posts)
			.set({ ...post, updatedAt: new Date() })
			.where(eq(posts.id, id))
			.returning();
		return result[0];
	}

	async deletePost(id: number): Promise<void> {
		await db.delete(posts).where(eq(posts.id, id));
	}

	// Project management
	async createProject(
		project: InsertProject & { authorId: number },
	): Promise<Project> {
		const result = await db
			.insert(projects)
			.values({
				...project,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		return result[0];
	}

	async getProject(id: number): Promise<Project | undefined> {
		const result = await db.select().from(projects).where(eq(projects.id, id));
		return result[0];
	}

	async getProjectBySlug(slug: string): Promise<Project | undefined> {
		const result = await db
			.select()
			.from(projects)
			.where(eq(projects.slug, slug));
		return result[0];
	}

	async getAllProjects(published?: boolean): Promise<Project[]> {
		if (published !== undefined) {
			return await db
				.select()
				.from(projects)
				.where(eq(projects.isPublished, published));
		}
		return await db.select().from(projects);
	}

	async updateProject(
		id: number,
		project: Partial<InsertProject>,
	): Promise<Project | undefined> {
		const result = await db
			.update(projects)
			.set({ ...project, updatedAt: new Date() })
			.where(eq(projects.id, id))
			.returning();
		return result[0];
	}

	async deleteProject(id: number): Promise<void> {
		await db.delete(projects).where(eq(projects.id, id));
	}

	// Media management
	async createMediaFile(
		media: InsertMediaFile & { uploadedBy: number },
	): Promise<MediaFile> {
		const result = await db
			.insert(mediaFiles)
			.values({
				...media,
				uploadedAt: new Date(),
			})
			.returning();
		return result[0];
	}

	async getMediaFile(id: number): Promise<MediaFile | undefined> {
		const result = await db
			.select()
			.from(mediaFiles)
			.where(eq(mediaFiles.id, id));
		return result[0];
	}

	async getAllMediaFiles(): Promise<MediaFile[]> {
		return await db.select().from(mediaFiles);
	}

	async deleteMediaFile(id: number): Promise<void> {
		await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
	}

	// GitHub sync
	async updateGithubSyncStatus(
		entityType: string,
		entityId: number,
		githubPath: string,
		syncStatus: string,
		errorMessage?: string,
	): Promise<void> {
		const existing = await db
			.select()
			.from(githubSyncStatus)
			.where(
				and(
					eq(githubSyncStatus.entityType, entityType),
					eq(githubSyncStatus.entityId, entityId),
				),
			);

		if (existing.length > 0) {
			await db
				.update(githubSyncStatus)
				.set({
					syncStatus,
					errorMessage,
					lastSyncAt: new Date(),
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(githubSyncStatus.entityType, entityType),
						eq(githubSyncStatus.entityId, entityId),
					),
				);
		} else {
			await db.insert(githubSyncStatus).values({
				entityType,
				entityId,
				githubPath,
				syncStatus,
				errorMessage,
				lastSyncAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
	}

	async getGithubSyncStatus(
		entityType: string,
		entityId: number,
	): Promise<GithubSyncStatus | undefined> {
		const result = await db
			.select()
			.from(githubSyncStatus)
			.where(
				and(
					eq(githubSyncStatus.entityType, entityType),
					eq(githubSyncStatus.entityId, entityId),
				),
			);
		return result[0];
	}

	// Rate limiting
	async getRateLimit(
		identifier: string,
		endpoint: string,
	): Promise<{ attempts: number; resetTime: Date } | undefined> {
		const result = await db
			.select()
			.from(rateLimits)
			.where(
				and(
					eq(rateLimits.identifier, identifier),
					eq(rateLimits.endpoint, endpoint),
				),
			);

		if (result.length > 0) {
			return {
				attempts: result[0].attempts || 0,
				resetTime: result[0].resetTime || new Date(),
			};
		}
		return undefined;
	}

	async updateRateLimit(
		identifier: string,
		endpoint: string,
		attempts: number,
		resetTime: Date,
	): Promise<void> {
		const existing = await db
			.select()
			.from(rateLimits)
			.where(
				and(
					eq(rateLimits.identifier, identifier),
					eq(rateLimits.endpoint, endpoint),
				),
			);

		if (existing.length > 0) {
			await db
				.update(rateLimits)
				.set({ attempts, resetTime })
				.where(
					and(
						eq(rateLimits.identifier, identifier),
						eq(rateLimits.endpoint, endpoint),
					),
				);
		} else {
			await db.insert(rateLimits).values({
				identifier,
				endpoint,
				attempts,
				resetTime,
				createdAt: new Date(),
			});
		}
	}

	// GitHub settings methods
	async getGitHubToken(): Promise<string | null> {
		const result = await db.select().from(githubSettings).limit(1);
		if (result.length === 0) return null;
		return decrypt(result[0].encryptedToken);
	}

	async saveGitHubToken(token: string): Promise<void> {
		const encryptedToken = encrypt(token);
		const existing = await db.select().from(githubSettings).limit(1);

		if (existing.length > 0) {
			await db
				.update(githubSettings)
				.set({
					encryptedToken,
					updatedAt: new Date(),
				})
				.where(eq(githubSettings.id, existing[0].id));
		} else {
			await db.insert(githubSettings).values({ encryptedToken });
		}
	}
}

export const storage = new SqliteStorage();

// Initialize database on startup
(async () => {
	try {
		await storage.initializeDatabase();
		await storage.createDefaultAdmin();
	} catch (error) {
		console.error("Failed to initialize database:", error);
	}
})();
