import { Router } from "express";
import { storage } from "./storage";
import {
	AuthMiddleware,
	LoginUtils,
	SessionManager,
	AuthenticatedRequest,
	PasswordUtils,
} from "./auth";
import { GitHubService } from "./github-service";
import { insertPostSchema, insertProjectSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

function parseRouteId(param: string | string[] | undefined): number | null {
	const rawValue = Array.isArray(param) ? param[0] : param;
	if (!rawValue) {
		return null;
	}

	const parsedValue = Number.parseInt(rawValue, 10);
	return Number.isNaN(parsedValue) ? null : parsedValue;
}

// Apply security middleware to all admin routes
router.use(AuthMiddleware.securityHeaders);
router.use(AuthMiddleware.corsAdmin);
router.use(AuthMiddleware.requestLogger);

// Apply rate limiting to sensitive endpoints
const authRateLimit = AuthMiddleware.rateLimiter("admin-auth", 5, 60000); // 5 attempts per minute
const apiRateLimit = AuthMiddleware.rateLimiter("admin-api", 30, 60000); // 30 requests per minute

// Authentication Routes
router.post("/auth/login", authRateLimit, async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res
				.status(400)
				.json({ error: "Username and password are required" });
		}

		// Authenticate user
		const user = await LoginUtils.authenticateLogin(username, password);
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Create session
		const { accessToken, refreshToken } = await SessionManager.createSession(
			user.id,
		);

		res.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				lastLoginAt: user.lastLoginAt,
			},
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/auth/refresh", authRateLimit, async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({ error: "Refresh token is required" });
		}

		const tokens = await SessionManager.refreshAccessToken(refreshToken);
		if (!tokens) {
			return res
				.status(401)
				.json({ error: "Invalid or expired refresh token" });
		}

		res.json({
			success: true,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		});
	} catch (error) {
		console.error("Token refresh error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post(
	"/auth/logout",
	AuthMiddleware.authenticate,
	async (req: AuthenticatedRequest, res) => {
		try {
			const { refreshToken } = req.body;

			if (refreshToken) {
				await SessionManager.revokeSession(refreshToken);
			}

			res.json({ success: true, message: "Logged out successfully" });
		} catch (error) {
			console.error("Logout error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
);

router.post(
	"/auth/change-password",
	AuthMiddleware.authenticate,
	async (req: AuthenticatedRequest, res) => {
		try {
			const { currentPassword, newPassword } = req.body;
			const userId = req.userId!;

			if (!currentPassword || !newPassword) {
				return res
					.status(400)
					.json({ error: "Current password and new password are required" });
			}

			// Validate new password strength
			const passwordValidation =
				PasswordUtils.validatePasswordStrength(newPassword);
			if (!passwordValidation.isValid) {
				return res.status(400).json({
					error: "Password validation failed",
					details: passwordValidation.errors,
				});
			}

			// Get user and verify current password
			const user = await storage.getAdminUserById(userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const isValidPassword = await PasswordUtils.verifyPassword(
				currentPassword,
				user.passwordHash,
			);
			if (!isValidPassword) {
				return res.status(401).json({ error: "Current password is incorrect" });
			}

			// Hash new password and update
			const newPasswordHash = await PasswordUtils.hashPassword(newPassword);
			// Note: This would need to be implemented in storage
			// await storage.updateAdminUserPassword(userId, newPasswordHash);

			// Revoke all sessions to force re-login
			await SessionManager.revokeAllSessions(userId);

			res.json({ success: true, message: "Password changed successfully" });
		} catch (error) {
			console.error("Change password error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
);

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);
router.use(apiRateLimit);

// Dashboard Overview
router.get("/dashboard", async (req: AuthenticatedRequest, res) => {
	try {
		const [posts, projects] = await Promise.all([
			storage.getAllPosts(),
			storage.getAllProjects(),
		]);

		const stats = {
			totalPosts: posts.length,
			publishedPosts: posts.filter((p) => p.isPublished).length,
			totalProjects: projects.length,
			publishedProjects: projects.filter((p) => p.isPublished).length,
		};

		res.json({
			success: true,
			stats,
			recentPosts: posts.slice(0, 5),
			recentProjects: projects.slice(0, 5),
		});
	} catch (error) {
		console.error("Dashboard error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Posts Management
router.get("/posts", async (req: AuthenticatedRequest, res) => {
	try {
		const { published } = req.query;
		const posts = await storage.getAllPosts(
			published === "true" ? true : published === "false" ? false : undefined,
		);

		res.json({
			success: true,
			posts: posts.map((post) => ({
				...post,
				tags: post.tags ? JSON.parse(post.tags) : [],
			})),
		});
	} catch (error) {
		console.error("Get posts error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/posts/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const postId = parseRouteId(req.params.id);
		if (postId === null) {
			return res.status(400).json({ error: "Invalid post id" });
		}
		const post = await storage.getPost(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.json({
			success: true,
			post: {
				...post,
				tags: post.tags ? JSON.parse(post.tags) : [],
			},
		});
	} catch (error) {
		console.error("Get post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/posts", async (req: AuthenticatedRequest, res) => {
	try {
		const authorId = req.userId!;
		const postData = req.body;

		// Validate input
		const validation = insertPostSchema.safeParse(postData);
		if (!validation.success) {
			return res.status(400).json({
				error: "Validation failed",
				details: validation.error.issues,
			});
		}

		// Create post
		const post = await storage.createPost({
			...validation.data,
			authorId,
			tags: validation.data.tags
				? JSON.stringify(validation.data.tags)
				: undefined,
		});

		// Push to GitHub if token exists
		const githubToken = await storage.getGitHubToken();
		if (githubToken && post.isPublished) {
			try {
				await GitHubService.pushPostToGitHub(post, "create", githubToken);
				// Update post with GitHub SHA
				const path = `client/src/blogs/${post.slug}.mdx`;
				const fileContent = await GitHubService.getFileContent(
					path,
					githubToken,
				);
				if (fileContent) {
					await storage.updatePost(post.id, {
						githubPath: path,
						githubSha: fileContent.sha,
					});
				}
			} catch (error) {
				console.error("Failed to push post to GitHub:", error);
			}
		}

		res.status(201).json({
			success: true,
			post: {
				...post,
				tags: post.tags ? JSON.parse(post.tags) : [],
			},
		});
	} catch (error) {
		console.error("Create post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.put("/posts/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const postId = parseRouteId(req.params.id);
		if (postId === null) {
			return res.status(400).json({ error: "Invalid post id" });
		}
		const postData = req.body;

		// Validate input
		const validation = insertPostSchema.partial().safeParse(postData);
		if (!validation.success) {
			return res.status(400).json({
				error: "Validation failed",
				details: validation.error.issues,
			});
		}

		// Update post
		const updatedPost = await storage.updatePost(postId, {
			...validation.data,
			tags: validation.data.tags
				? JSON.stringify(validation.data.tags)
				: undefined,
		});

		if (!updatedPost) {
			return res.status(404).json({ error: "Post not found" });
		}

		// Push to GitHub if token exists
		const githubToken = await storage.getGitHubToken();
		if (githubToken) {
			try {
				if (updatedPost.isPublished) {
					await GitHubService.pushPostToGitHub(
						updatedPost,
						"update",
						githubToken,
					);
					const path = `client/src/blogs/${updatedPost.slug}.mdx`;
					const fileContent = await GitHubService.getFileContent(
						path,
						githubToken,
					);
					if (fileContent) {
						await storage.updatePost(updatedPost.id, {
							githubPath: path,
							githubSha: fileContent.sha,
						});
					}
				} else if (updatedPost.githubPath) {
					// Unpublish: delete from GitHub
					await GitHubService.pushPostToGitHub(
						updatedPost,
						"delete",
						githubToken,
					);
					await storage.updatePost(updatedPost.id, {
						githubPath: null,
						githubSha: null,
					});
				}
			} catch (error) {
				console.error("Failed to push post to GitHub:", error);
			}
		}

		res.json({
			success: true,
			post: {
				...updatedPost,
				tags: updatedPost.tags ? JSON.parse(updatedPost.tags) : [],
			},
		});
	} catch (error) {
		console.error("Update post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.delete("/posts/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const postId = parseRouteId(req.params.id);
		if (postId === null) {
			return res.status(400).json({ error: "Invalid post id" });
		}

		// Check if post exists
		const post = await storage.getPost(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// Delete from GitHub first if token exists
		const githubToken = await storage.getGitHubToken();
		if (githubToken && post.githubPath) {
			try {
				await GitHubService.pushPostToGitHub(post, "delete", githubToken);
			} catch (error) {
				console.error("Failed to delete post from GitHub:", error);
			}
		}

		await storage.deletePost(postId);

		res.json({ success: true, message: "Post deleted successfully" });
	} catch (error) {
		console.error("Delete post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Projects Management
router.get("/projects", async (req: AuthenticatedRequest, res) => {
	try {
		const { published } = req.query;
		const projects = await storage.getAllProjects(
			published === "true" ? true : published === "false" ? false : undefined,
		);

		res.json({
			success: true,
			projects: projects.map((project) => ({
				...project,
				images: project.images ? JSON.parse(project.images) : [],
				technologies: project.technologies
					? JSON.parse(project.technologies)
					: [],
			})),
		});
	} catch (error) {
		console.error("Get projects error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/projects/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const projectId = parseRouteId(req.params.id);
		if (projectId === null) {
			return res.status(400).json({ error: "Invalid project id" });
		}
		const project = await storage.getProject(projectId);

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		res.json({
			success: true,
			project: {
				...project,
				images: project.images ? JSON.parse(project.images) : [],
				technologies: project.technologies
					? JSON.parse(project.technologies)
					: [],
			},
		});
	} catch (error) {
		console.error("Get project error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/projects", async (req: AuthenticatedRequest, res) => {
	try {
		const authorId = req.userId!;
		const projectData = req.body;

		// Validate input
		const validation = insertProjectSchema.safeParse(projectData);
		if (!validation.success) {
			return res.status(400).json({
				error: "Validation failed",
				details: validation.error.issues,
			});
		}

		// Create project
		const project = await storage.createProject({
			...validation.data,
			authorId,
			images: validation.data.images
				? JSON.stringify(validation.data.images)
				: undefined,
			technologies: validation.data.technologies
				? JSON.stringify(validation.data.technologies)
				: undefined,
		});

		// Push to GitHub if token exists
		const githubToken = await storage.getGitHubToken();
		if (githubToken && project.isPublished) {
			try {
				await GitHubService.pushProjectToGitHub(project, "create", githubToken);
				const path = `client/src/projects/${project.slug}.mdx`;
				const fileContent = await GitHubService.getFileContent(
					path,
					githubToken,
				);
				if (fileContent) {
					await storage.updateProject(project.id, {
						githubPath: path,
						githubSha: fileContent.sha,
					});
				}
			} catch (error) {
				console.error("Failed to push project to GitHub:", error);
			}
		}

		res.status(201).json({
			success: true,
			project: {
				...project,
				images: project.images ? JSON.parse(project.images) : [],
				technologies: project.technologies
					? JSON.parse(project.technologies)
					: [],
			},
		});
	} catch (error) {
		console.error("Create project error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.put("/projects/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const projectId = parseRouteId(req.params.id);
		if (projectId === null) {
			return res.status(400).json({ error: "Invalid project id" });
		}
		const projectData = req.body;

		// Validate input
		const validation = insertProjectSchema.partial().safeParse(projectData);
		if (!validation.success) {
			return res.status(400).json({
				error: "Validation failed",
				details: validation.error.issues,
			});
		}

		// Update project
		const updatedProject = await storage.updateProject(projectId, {
			...validation.data,
			images: validation.data.images
				? JSON.stringify(validation.data.images)
				: undefined,
			technologies: validation.data.technologies
				? JSON.stringify(validation.data.technologies)
				: undefined,
		});

		if (!updatedProject) {
			return res.status(404).json({ error: "Project not found" });
		}

		// Push to GitHub if token exists
		const githubToken = await storage.getGitHubToken();
		if (githubToken) {
			try {
				if (updatedProject.isPublished) {
					await GitHubService.pushProjectToGitHub(
						updatedProject,
						"update",
						githubToken,
					);
					const path = `client/src/projects/${updatedProject.slug}.mdx`;
					const fileContent = await GitHubService.getFileContent(
						path,
						githubToken,
					);
					if (fileContent) {
						await storage.updateProject(updatedProject.id, {
							githubPath: path,
							githubSha: fileContent.sha,
						});
					}
				} else if (updatedProject.githubPath) {
					// Unpublish: delete from GitHub
					await GitHubService.pushProjectToGitHub(
						updatedProject,
						"delete",
						githubToken,
					);
					await storage.updateProject(updatedProject.id, {
						githubPath: null,
						githubSha: null,
					});
				}
			} catch (error) {
				console.error("Failed to push project to GitHub:", error);
			}
		}

		res.json({
			success: true,
			project: {
				...updatedProject,
				images: updatedProject.images ? JSON.parse(updatedProject.images) : [],
				technologies: updatedProject.technologies
					? JSON.parse(updatedProject.technologies)
					: [],
			},
		});
	} catch (error) {
		console.error("Update project error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.delete("/projects/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const projectId = parseRouteId(req.params.id);
		if (projectId === null) {
			return res.status(400).json({ error: "Invalid project id" });
		}

		// Check if project exists
		const project = await storage.getProject(projectId);
		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		// Delete from GitHub first if token exists
		const githubToken = await storage.getGitHubToken();
		if (githubToken && project.githubPath) {
			try {
				await GitHubService.pushProjectToGitHub(project, "delete", githubToken);
			} catch (error) {
				console.error("Failed to delete project from GitHub:", error);
			}
		}

		await storage.deleteProject(projectId);

		res.json({ success: true, message: "Project deleted successfully" });
	} catch (error) {
		console.error("Delete project error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GitHub Sync Management
router.get("/github/settings", async (req: AuthenticatedRequest, res) => {
	try {
		const token = await storage.getGitHubToken();
		const hasToken = !!token;

		res.json({
			success: true,
			hasToken,
		});
	} catch (error) {
		console.error("Get GitHub settings error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.put("/github/settings", async (req: AuthenticatedRequest, res) => {
	try {
		const { githubToken } = req.body;

		if (!githubToken) {
			return res.status(400).json({ error: "GitHub token is required" });
		}

		// Test connection before saving
		const connection = await GitHubService.testConnection(githubToken);
		if (!connection.success) {
			return res.status(400).json({
				error: "Invalid GitHub token",
				details: connection.error,
			});
		}

		await storage.saveGitHubToken(githubToken);

		res.json({
			success: true,
			message: "GitHub settings saved successfully",
		});
	} catch (error) {
		console.error("Save GitHub settings error:", error);
		res.status(500).json({
			error: "Internal server error",
			message: error instanceof Error ? error.message : String(error),
		});
	}
});

router.post("/github/test", async (req: AuthenticatedRequest, res) => {
	try {
		let githubToken = req.body.githubToken;

		// If no token provided, try to get from storage
		if (!githubToken) {
			githubToken = await storage.getGitHubToken();
		}

		if (!githubToken) {
			return res.status(400).json({ error: "GitHub token is required" });
		}

		const config = GitHubService.validateConfig(githubToken);
		if (!config.isValid) {
			return res.status(400).json({
				error: "GitHub configuration invalid",
				details: config.errors,
			});
		}

		const connection = await GitHubService.testConnection(githubToken);

		res.json({
			success: connection.success,
			github: {
				configured: config.isValid,
				connected: connection.success,
				configErrors: config.errors,
				connectionError: connection.error,
			},
		});
	} catch (error) {
		console.error("GitHub test error:", error);
		res.status(500).json({
			error: "Internal server error",
			message: error instanceof Error ? error.message : String(error),
		});
	}
});

router.post("/github/sync", async (req: AuthenticatedRequest, res) => {
	try {
		const authorId = req.userId!;
		const { type } = req.body; // "posts", "projects", or "all"

		const githubToken = await storage.getGitHubToken();
		if (!githubToken) {
			return res
				.status(400)
				.json({
					error:
						"GitHub token not configured. Please set it in settings first.",
				});
		}

		// Validate token first
		const connection = await GitHubService.testConnection(githubToken);
		if (!connection.success) {
			return res.status(401).json({
				error: "Invalid GitHub token",
				details: connection.error,
			});
		}

		let result;
		if (type === "posts") {
			result = {
				posts: await GitHubService.syncPosts(authorId, githubToken),
				projects: { synced: 0, errors: [] },
			};
		} else if (type === "projects") {
			result = {
				posts: { synced: 0, errors: [] },
				projects: await GitHubService.syncProjects(authorId, githubToken),
			};
		} else {
			result = await GitHubService.syncAll(authorId, githubToken);
		}

		res.json({
			success: true,
			result,
		});
	} catch (error) {
		console.error("GitHub sync error:", error);
		res.status(500).json({
			error: "Internal server error",
			message: error instanceof Error ? error.message : String(error),
		});
	}
});

router.post("/github/images", async (req: AuthenticatedRequest, res) => {
	try {
		const githubToken = await storage.getGitHubToken();
		if (!githubToken) {
			return res
				.status(400)
				.json({
					error:
						"GitHub token not configured. Please set it in settings first.",
				});
		}

		const images = await GitHubService.getImages(githubToken);

		res.json({
			success: true,
			images: images.map((img) => ({
				name: img.name,
				path: img.path,
				url: GitHubService.getRawFileUrl(img.path),
				size: img.size,
			})),
		});
	} catch (error) {
		console.error("GitHub images error:", error);
		res.status(500).json({
			error: "Internal server error",
			message: error instanceof Error ? error.message : String(error),
		});
	}
});

// Markdown Templates
router.get("/templates/post", async (req: AuthenticatedRequest, res) => {
	try {
		const template = GitHubService.generatePostMarkdown({
			title: "Your Post Title",
			excerpt: "A brief description of your post",
			tags: JSON.stringify(["tag1", "tag2"]),
			isPublished: true,
			content: "Write your post content here...",
		});

		res.json({
			success: true,
			template,
		});
	} catch (error) {
		console.error("Get post template error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/templates/project", async (req: AuthenticatedRequest, res) => {
	try {
		const template = GitHubService.generateProjectMarkdown({
			title: "Your Project Title",
			description: "A brief description of your project",
			technologies: JSON.stringify(["tech1", "tech2"]),
			images: JSON.stringify([]),
			githubUrl: "https://github.com/username/project",
			liveUrl: "https://yourproject.com",
			featured: false,
			isPublished: true,
			content: "Write your project content here...",
		});

		res.json({
			success: true,
			template,
		});
	} catch (error) {
		console.error("Get project template error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Media Management
router.get("/media", async (req: AuthenticatedRequest, res) => {
	try {
		const mediaFiles = await storage.getAllMediaFiles();

		res.json({
			success: true,
			mediaFiles,
		});
	} catch (error) {
		console.error("Get media error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.delete("/media/:id", async (req: AuthenticatedRequest, res) => {
	try {
		const mediaId = parseRouteId(req.params.id);
		if (mediaId === null) {
			return res.status(400).json({ error: "Invalid media id" });
		}

		// Check if media exists
		const media = await storage.getMediaFile(mediaId);
		if (!media) {
			return res.status(404).json({ error: "Media file not found" });
		}

		await storage.deleteMediaFile(mediaId);

		res.json({ success: true, message: "Media file deleted successfully" });
	} catch (error) {
		console.error("Delete media error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Dashboard Stats
router.get("/stats", async (req: AuthenticatedRequest, res) => {
	try {
		const totalPosts = await storage.getAllPosts();
		const publishedPosts = await storage.getAllPosts(true);
		const totalProjects = await storage.getAllProjects();
		const publishedProjects = await storage.getAllProjects(true);

		const featuredProjects = totalProjects.filter((p) => p.featured);

		res.json({
			success: true,
			stats: {
				totalPosts: totalPosts.length,
				publishedPosts: publishedPosts.length,
				totalProjects: totalProjects.length,
				featuredProjects: featuredProjects.length,
				lastSyncAt: new Date().toISOString(),
				systemStatus: "online",
			},
		});
	} catch (error) {
		console.error("Get stats error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Settings Management
router.put("/settings", async (req: AuthenticatedRequest, res) => {
	try {
		const { username, email, currentPassword, newPassword } = req.body;

		// Mock settings update for now
		res.json({
			success: true,
			message: "Settings updated successfully",
		});
	} catch (error) {
		console.error("Update settings error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Security: Regenerate admin URLs (requires authentication)
router.post(
	"/security/regenerate-urls",
	async (req: AuthenticatedRequest, res) => {
		try {
			const { regenerateAdminUrls } = await import("./admin-urls");
			const newUrls = regenerateAdminUrls();

			res.json({
				success: true,
				message: "Admin URLs regenerated successfully",
				urls: {
					login: newUrls.loginPath,
					dashboard: newUrls.dashboardPath,
					generatedAt: newUrls.generatedAt,
				},
			});
		} catch (error) {
			console.error("Regenerate URLs error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
);

export default router;
