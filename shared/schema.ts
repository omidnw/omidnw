import {
	sqliteTable,
	text,
	integer,
	blob,
	unique,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin Users Table
export const adminUsers = sqliteTable("admin_users", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	isActive: integer("is_active", { mode: "boolean" }).default(true),
	lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

// Sessions Table for JWT refresh tokens
export const adminSessions = sqliteTable("admin_sessions", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	userId: integer("user_id").references(() => adminUsers.id, {
		onDelete: "cascade",
	}),
	refreshToken: text("refresh_token").notNull().unique(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	isRevoked: integer("is_revoked", { mode: "boolean" }).default(false),
});

// Posts Table for blog management
export const posts = sqliteTable("posts", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content").notNull(),
	excerpt: text("excerpt"),
	featuredImage: text("featured_image"),
	tags: text("tags"), // JSON array as string
	isPublished: integer("is_published", { mode: "boolean" }).default(false),
	publishedAt: integer("published_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	authorId: integer("author_id").references(() => adminUsers.id),
	githubPath: text("github_path"), // Path to file in GitHub repo
	githubSha: text("github_sha"), // Git commit SHA for sync tracking
});

// Projects Table for portfolio projects
export const projects = sqliteTable("projects", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull(),
	content: text("content"),
	images: text("images"), // JSON array as string
	technologies: text("technologies"), // JSON array as string
	githubUrl: text("github_url"),
	liveUrl: text("live_url"),
	featured: integer("featured", { mode: "boolean" }).default(false),
	sortOrder: integer("sort_order").default(0),
	isPublished: integer("is_published", { mode: "boolean" }).default(false),
	publishedAt: integer("published_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	authorId: integer("author_id").references(() => adminUsers.id),
	githubPath: text("github_path"), // Path to file in GitHub repo
	githubSha: text("github_sha"), // Git commit SHA for sync tracking
});

// GitHub Sync Status Table
export const githubSyncStatus = sqliteTable("github_sync_status", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	entityType: text("entity_type").notNull(), // "post" or "project"
	entityId: integer("entity_id").notNull(),
	githubPath: text("github_path").notNull(),
	lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
	syncStatus: text("sync_status").notNull(), // "synced", "pending", "error"
	errorMessage: text("error_message"),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

// Media Files Table
export const mediaFiles = sqliteTable("media_files", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	filename: text("filename").notNull(),
	originalName: text("original_name").notNull(),
	mimeType: text("mime_type").notNull(),
	fileSize: integer("file_size").notNull(),
	githubPath: text("github_path"), // Path in GitHub repo
	githubUrl: text("github_url"), // Direct GitHub URL
	uploadedAt: integer("uploaded_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	uploadedBy: integer("uploaded_by").references(() => adminUsers.id),
});

// GitHub Settings Table
export const githubSettings = sqliteTable("github_settings", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	encryptedToken: text("encrypted_token").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

// Rate Limiting Table
export const rateLimits = sqliteTable(
	"rate_limits",
	{
		id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
		identifier: text("identifier").notNull(), // IP address or user ID
		endpoint: text("endpoint").notNull(),
		attempts: integer("attempts").default(1),
		resetTime: integer("reset_time", { mode: "timestamp" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
	},
	(table) => ({
		uniqueRateLimit: unique().on(table.identifier, table.endpoint),
	}),
);

// Legacy users table for backward compatibility
export const users = sqliteTable("users", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	password: text("password").notNull(),
});

// Zod Schemas for validation
export const insertAdminUserSchema = createInsertSchema(adminUsers, {
	email: z.string().email(),
	username: z.string().min(3).max(50),
	passwordHash: z.string().min(8),
}).pick({
	username: true,
	email: true,
	passwordHash: true,
});

export const insertPostSchema = createInsertSchema(posts, {
	title: z.string().min(1).max(200),
	slug: z.string().min(1).max(200),
	content: z.string().min(1),
	excerpt: z.string().optional(),
	tags: z.string().optional(),
}).pick({
	title: true,
	slug: true,
	content: true,
	excerpt: true,
	featuredImage: true,
	tags: true,
	isPublished: true,
	githubPath: true,
	githubSha: true,
});

export const insertProjectSchema = createInsertSchema(projects, {
	title: z.string().min(1).max(200),
	slug: z.string().min(1).max(200),
	description: z.string().min(1).max(500),
	content: z.string().optional(),
	images: z.string().optional(),
	technologies: z.string().optional(),
	githubUrl: z.string().url().optional(),
	liveUrl: z.string().url().optional(),
}).pick({
	title: true,
	slug: true,
	description: true,
	content: true,
	images: true,
	technologies: true,
	githubUrl: true,
	liveUrl: true,
	featured: true,
	isPublished: true,
	githubPath: true,
	githubSha: true,
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).pick({
	filename: true,
	originalName: true,
	mimeType: true,
	fileSize: true,
	githubPath: true,
	githubUrl: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type GithubSyncStatus = typeof githubSyncStatus.$inferSelect;

// Legacy schema for backward compatibility
export const insertUserSchema = createInsertSchema(users).pick({
	username: true,
	password: true,
});
