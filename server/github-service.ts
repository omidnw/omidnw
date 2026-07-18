import { storage } from "./storage";
import { Post, Project, InsertPost, InsertProject } from "@shared/schema";

// GitHub API configuration
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_OWNER = "omidnw";
const GITHUB_REPO = "omidnw";

// Content paths in the repository
const CONTENT_PATHS = {
	POSTS: "client/src/blogs",
	PROJECTS: "client/src/projects",
	IMAGES: "client/public/images",
} as const;

export interface GitHubFile {
	name: string;
	path: string;
	sha: string;
	size: number;
	url: string;
	html_url: string;
	download_url: string;
	type: "file" | "dir";
}

export interface GitHubContent {
	path: string;
	sha: string;
	content: string;
	encoding: "base64" | "utf-8";
}

export interface ParsedMDXContent {
	metadata: {
		title: string;
		description?: string;
		tags?: string[];
		publishedAt?: string;
		featured?: boolean;
		images?: string[];
		technologies?: string[];
		githubUrl?: string;
		liveUrl?: string;
	};
	content: string;
	slug: string;
}

export class GitHubService {
	private static async makeRequest(
		endpoint: string,
		githubToken: string,
		options: RequestInit = {}
	): Promise<any> {
		if (!githubToken) {
			throw new Error("GitHub token is required");
		}

		const headers = {
			Authorization: `token ${githubToken}`,
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "Portfolio-Admin/1.0",
			...options.headers,
		};

		const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(
				`GitHub API error: ${response.status} ${response.statusText} - ${error}`
			);
		}

		return await response.json();
	}

	/**
	 * Get contents of a directory in the repository
	 */
	static async getDirectoryContents(
		path: string,
		githubToken: string
	): Promise<GitHubFile[]> {
		try {
			const endpoint = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
			const contents = await this.makeRequest(endpoint, githubToken);

			if (!Array.isArray(contents)) {
				throw new Error("Expected directory contents to be an array");
			}

			return contents.filter((file: GitHubFile) => file.type === "file");
		} catch (error) {
			console.error(`Failed to get directory contents for ${path}:`, error);
			return [];
		}
	}

	/**
	 * Get a specific file content from the repository
	 */
	static async getFileContent(
		path: string,
		githubToken: string
	): Promise<GitHubContent | null> {
		try {
			const endpoint = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
			const content = await this.makeRequest(endpoint, githubToken);

			if (content.type !== "file") {
				throw new Error("Expected file content");
			}

			return {
				path: content.path,
				sha: content.sha,
				content:
					content.encoding === "base64"
						? Buffer.from(content.content, "base64").toString("utf-8")
						: content.content,
				encoding: content.encoding,
			};
		} catch (error) {
			console.error(`Failed to get file content for ${path}:`, error);
			return null;
		}
	}

	/**
	 * Parse MDX content to extract metadata and content
	 */
	static parseMDXContent(content: string, filename: string): ParsedMDXContent {
		const slug = filename.replace(/\.mdx?$/, "");

		// Extract frontmatter
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

		if (!frontmatterMatch) {
			return {
				metadata: { title: slug },
				content: content,
				slug,
			};
		}

		const frontmatter = frontmatterMatch[1];
		const bodyContent = frontmatterMatch[2];

		// Parse YAML frontmatter (simple implementation)
		const metadata: any = {};
		const lines = frontmatter.split("\n");

		for (const line of lines) {
			const match = line.match(/^(\w+):\s*(.*)$/);
			if (match) {
				const [, key, value] = match;

				// Handle different value types
				if (value.startsWith("[") && value.endsWith("]")) {
					// Array
					metadata[key] = value
						.slice(1, -1)
						.split(",")
						.map((v) => v.trim().replace(/["']/g, ""));
				} else if (
					value.toLowerCase() === "true" ||
					value.toLowerCase() === "false"
				) {
					// Boolean
					metadata[key] = value.toLowerCase() === "true";
				} else if (value.match(/^\d+$/)) {
					// Number
					metadata[key] = parseInt(value, 10);
				} else {
					// String
					metadata[key] = value.replace(/["']/g, "");
				}
			}
		}

		return {
			metadata,
			content: bodyContent.trim(),
			slug,
		};
	}

	/**
	 * Sync blog posts from GitHub
	 */
	static async syncPosts(
		authorId: number,
		githubToken: string
	): Promise<{ synced: number; errors: string[] }> {
		const errors: string[] = [];
		let synced = 0;

		try {
			console.log("Starting posts sync from GitHub...");

			const files = await this.getDirectoryContents(
				CONTENT_PATHS.POSTS,
				githubToken
			);
			const mdxFiles = files.filter(
				(file) => file.name.endsWith(".mdx") || file.name.endsWith(".md")
			);

			for (const file of mdxFiles) {
				try {
					const content = await this.getFileContent(file.path, githubToken);
					if (!content) {
						errors.push(`Failed to get content for ${file.name}`);
						continue;
					}

					const parsed = this.parseMDXContent(content.content, file.name);

					// Check if post already exists
					const existingPost = await storage.getPostBySlug(parsed.slug);

					if (existingPost) {
						// Update existing post if SHA has changed
						if (existingPost.githubSha !== content.sha) {
							const updatedPost = await storage.updatePost(existingPost.id, {
								title: parsed.metadata.title,
								content: parsed.content,
								excerpt: parsed.metadata.description || undefined,
								tags: parsed.metadata.tags
									? JSON.stringify(parsed.metadata.tags)
									: undefined,
								isPublished: parsed.metadata.publishedAt ? true : false,
							});

							if (updatedPost) {
								await storage.updateGithubSyncStatus(
									"post",
									existingPost.id,
									file.path,
									"synced"
								);
								synced++;
								console.log(`Updated post: ${parsed.metadata.title}`);
							}
						}
					} else {
						// Create new post
						const newPost = await storage.createPost({
							title: parsed.metadata.title,
							slug: parsed.slug,
							content: parsed.content,
							excerpt: parsed.metadata.description || undefined,
							tags: parsed.metadata.tags
								? JSON.stringify(parsed.metadata.tags)
								: undefined,
							isPublished: parsed.metadata.publishedAt ? true : false,
							authorId,
						} as any);

						await storage.updateGithubSyncStatus(
							"post",
							newPost.id,
							file.path,
							"synced"
						);
						synced++;
						console.log(`Created new post: ${parsed.metadata.title}`);
					}
				} catch (error) {
					const errorMsg = `Failed to sync post ${file.name}: ${
						error instanceof Error ? error.message : String(error)
					}`;
					errors.push(errorMsg);
					console.error(errorMsg);
				}
			}

			console.log(
				`Posts sync completed. Synced: ${synced}, Errors: ${errors.length}`
			);
			return { synced, errors };
		} catch (error) {
			const errorMsg = `Failed to sync posts: ${
				error instanceof Error ? error.message : String(error)
			}`;
			errors.push(errorMsg);
			console.error(errorMsg);
			return { synced: 0, errors };
		}
	}

	/**
	 * Sync projects from GitHub
	 */
	static async syncProjects(
		authorId: number,
		githubToken: string
	): Promise<{ synced: number; errors: string[] }> {
		const errors: string[] = [];
		let synced = 0;

		try {
			console.log("Starting projects sync from GitHub...");

			const files = await this.getDirectoryContents(
				CONTENT_PATHS.PROJECTS,
				githubToken
			);
			const mdxFiles = files.filter(
				(file) => file.name.endsWith(".mdx") || file.name.endsWith(".md")
			);

			for (const file of mdxFiles) {
				try {
					const content = await this.getFileContent(file.path, githubToken);
					if (!content) {
						errors.push(`Failed to get content for ${file.name}`);
						continue;
					}

					const parsed = this.parseMDXContent(content.content, file.name);

					// Check if project already exists
					const existingProject = await storage.getProjectBySlug(parsed.slug);

					if (existingProject) {
						// Update existing project if SHA has changed
						if (existingProject.githubSha !== content.sha) {
							const updatedProject = await storage.updateProject(
								existingProject.id,
								{
									title: parsed.metadata.title,
									description: parsed.metadata.description || "",
									content: parsed.content,
									images: parsed.metadata.images
										? JSON.stringify(parsed.metadata.images)
										: undefined,
									technologies: parsed.metadata.technologies
										? JSON.stringify(parsed.metadata.technologies)
										: undefined,
									githubUrl: parsed.metadata.githubUrl || undefined,
									liveUrl: parsed.metadata.liveUrl || undefined,
									featured: parsed.metadata.featured || false,
									isPublished: parsed.metadata.publishedAt ? true : false,
								} as any
							);

							if (updatedProject) {
								await storage.updateGithubSyncStatus(
									"project",
									existingProject.id,
									file.path,
									"synced"
								);
								synced++;
								console.log(`Updated project: ${parsed.metadata.title}`);
							}
						}
					} else {
						// Create new project
						const newProject = await storage.createProject({
							title: parsed.metadata.title,
							slug: parsed.slug,
							description: parsed.metadata.description || "",
							content: parsed.content,
							images: parsed.metadata.images
								? JSON.stringify(parsed.metadata.images)
								: undefined,
							technologies: parsed.metadata.technologies
								? JSON.stringify(parsed.metadata.technologies)
								: undefined,
							githubUrl: parsed.metadata.githubUrl || undefined,
							liveUrl: parsed.metadata.liveUrl || undefined,
							featured: parsed.metadata.featured || false,
							isPublished: parsed.metadata.publishedAt ? true : false,
							authorId,
						} as any);

						await storage.updateGithubSyncStatus(
							"project",
							newProject.id,
							file.path,
							"synced"
						);
						synced++;
						console.log(`Created new project: ${parsed.metadata.title}`);
					}
				} catch (error) {
					const errorMsg = `Failed to sync project ${file.name}: ${
						error instanceof Error ? error.message : String(error)
					}`;
					errors.push(errorMsg);
					console.error(errorMsg);
				}
			}

			console.log(
				`Projects sync completed. Synced: ${synced}, Errors: ${errors.length}`
			);
			return { synced, errors };
		} catch (error) {
			const errorMsg = `Failed to sync projects: ${
				error instanceof Error ? error.message : String(error)
			}`;
			errors.push(errorMsg);
			console.error(errorMsg);
			return { synced: 0, errors };
		}
	}

	/**
	 * Get images from GitHub repository
	 */
	static async getImages(githubToken: string): Promise<GitHubFile[]> {
		try {
			const files = await this.getDirectoryContents(
				CONTENT_PATHS.IMAGES,
				githubToken
			);
			return files.filter((file) =>
				file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
			);
		} catch (error) {
			console.error("Failed to get images:", error);
			return [];
		}
	}

	/**
	 * Get raw URL for a file in the repository
	 */
	static getRawFileUrl(path: string): string {
		return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`;
	}

	/**
	 * Sync all content from GitHub
	 */
	static async syncAll(
		authorId: number,
		githubToken: string
	): Promise<{
		posts: { synced: number; errors: string[] };
		projects: { synced: number; errors: string[] };
	}> {
		console.log("Starting full sync from GitHub...");

		const [posts, projects] = await Promise.all([
			this.syncPosts(authorId, githubToken),
			this.syncProjects(authorId, githubToken),
		]);

		console.log(
			`Full sync completed. Posts: ${posts.synced}, Projects: ${projects.synced}`
		);

		return { posts, projects };
	}

	/**
	 * Validate GitHub configuration
	 */
	static validateConfig(githubToken?: string): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (githubToken && !githubToken.trim()) {
			errors.push("GitHub token cannot be empty");
		}

		if (!GITHUB_OWNER) {
			errors.push("GitHub owner is not configured");
		}

		if (!GITHUB_REPO) {
			errors.push("GitHub repository is not configured");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Test GitHub API connection
	 */
	static async testConnection(
		githubToken: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const endpoint = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
			await this.makeRequest(endpoint, githubToken);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Generate Markdown content with frontmatter for a post
	 */
	static generatePostMarkdown(post: Partial<Post>): string {
		const frontmatter = {
			title: post.title || "Untitled",
			description: post.excerpt || "",
			tags: post.tags ? JSON.parse(post.tags) : [],
			publishedAt: post.isPublished ? new Date().toISOString() : undefined,
			featured: false,
		};

		let frontmatterStr = "---\n";
		for (const [key, value] of Object.entries(frontmatter)) {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					frontmatterStr += `${key}: [${value.map(v => `"${v}"`).join(", ")}]\n`;
				} else if (typeof value === "boolean") {
					frontmatterStr += `${key}: ${value}\n`;
				} else {
					frontmatterStr += `${key}: "${value}"\n`;
				}
			}
		}
		frontmatterStr += "---\n\n";
		return frontmatterStr + (post.content || "");
	}

	/**
	 * Generate Markdown content with frontmatter for a project
	 */
	static generateProjectMarkdown(project: Partial<Project>): string {
		const frontmatter = {
			title: project.title || "Untitled",
			description: project.description || "",
			tags: project.technologies ? JSON.parse(project.technologies) : [],
			images: project.images ? JSON.parse(project.images) : [],
			publishedAt: project.isPublished ? new Date().toISOString() : undefined,
			featured: project.featured || false,
			githubUrl: project.githubUrl || "",
			liveUrl: project.liveUrl || "",
		};

		let frontmatterStr = "---\n";
		for (const [key, value] of Object.entries(frontmatter)) {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					frontmatterStr += `${key}: [${value.map(v => `"${v}"`).join(", ")}]\n`;
				} else if (typeof value === "boolean") {
					frontmatterStr += `${key}: ${value}\n`;
				} else {
					frontmatterStr += `${key}: "${value}"\n`;
				}
			}
		}
		frontmatterStr += "---\n\n";
		return frontmatterStr + (project.content || "");
	}

	/**
	 * Create or update a file in the GitHub repo
	 */
	static async createOrUpdateFile(
		path: string,
		content: string,
		message: string,
		githubToken: string
	): Promise<{ sha: string }> {
		let sha: string | undefined;

		// First, try to get the existing file to get its SHA
		try {
			const existingFile = await this.getFileContent(path, githubToken);
			if (existingFile) {
				sha = existingFile.sha;
			}
		} catch (error) {
			// File doesn't exist yet, that's fine
		}

		const endpoint = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
		const body: any = {
			message,
			content: Buffer.from(content, "utf-8").toString("base64"),
		};

		if (sha) {
			body.sha = sha;
		}

		const result = await this.makeRequest(endpoint, githubToken, {
			method: "PUT",
			body: JSON.stringify(body),
		});

		return { sha: result.content.sha };
	}

	/**
	 * Delete a file from the GitHub repo
	 */
	static async deleteFile(
		path: string,
		message: string,
		githubToken: string
	): Promise<void> {
		// Get the current SHA of the file
		const existingFile = await this.getFileContent(path, githubToken);
		if (!existingFile) {
			throw new Error(`File not found: ${path}`);
		}

		const endpoint = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
		await this.makeRequest(endpoint, githubToken, {
			method: "DELETE",
			body: JSON.stringify({
				message,
				sha: existingFile.sha,
			}),
		});
	}

	/**
	 * Push a post to GitHub
	 */
	static async pushPostToGitHub(
		post: Post,
		action: "create" | "update" | "delete",
		githubToken: string
	): Promise<void> {
		const path = `${CONTENT_PATHS.POSTS}/${post.slug}.mdx`;
		let message: string;

		if (action === "delete") {
			message = `feat: remove post "${post.title}"`;
			await this.deleteFile(path, message, githubToken);
		} else {
			const content = this.generatePostMarkdown(post);
			message =
				action === "create"
					? `feat: add post "${post.title}"`
					: `fix: update post "${post.title}"`;
			await this.createOrUpdateFile(path, content, message, githubToken);
		}
	}

	/**
	 * Push a project to GitHub
	 */
	static async pushProjectToGitHub(
		project: Project,
		action: "create" | "update" | "delete",
		githubToken: string
	): Promise<void> {
		const path = `${CONTENT_PATHS.PROJECTS}/${project.slug}.mdx`;
		let message: string;

		if (action === "delete") {
			message = `feat: remove project "${project.title}"`;
			await this.deleteFile(path, message, githubToken);
		} else {
			const content = this.generateProjectMarkdown(project);
			message =
				action === "create"
					? `feat: add project "${project.title}"`
					: `fix: update project "${project.title}"`;
			await this.createOrUpdateFile(path, content, message, githubToken);
		}
	}
}

// Note: Auto-sync has been removed. All GitHub operations now require manual token input for security.
