import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import adminRoutes from "./admin-routes";
import { initializeAdminUrls, getAdminUrls } from "./admin-urls";

export async function registerRoutes(app: Express): Promise<Server> {
	// Initialize random admin URLs on server startup
	const adminUrls = initializeAdminUrls();

	// Endpoint for frontend to discover admin URLs
	// IMPORTANT: This must be defined BEFORE the admin routes middleware
	// This endpoint is intentionally public but returns minimal info
	// The actual admin routes still require authentication
	app.get("/api/admin/urls", async (req, res) => {
		try {
			const urls = getAdminUrls();
			res.json({
				success: true,
				urls: {
					login: urls.loginPath,
					dashboard: urls.dashboardPath,
				},
			});
		} catch (error) {
			console.error("Get admin URLs error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	// Admin routes - secured with authentication and using dynamic paths
	app.use("/api/admin", adminRoutes);

	// Public API routes for the portfolio website
	// Note: Posts are read directly from MDX files, not from database
	app.get("/api/posts", async (req, res) => {
		try {
			// Return empty array - frontend will read from local files
			res.json({
				success: true,
				posts: [],
				message: "Posts are read directly from MDX files on the frontend",
			});
		} catch (error) {
			console.error("Get posts error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	app.get("/api/posts/:slug", async (req, res) => {
		try {
			// Posts are read directly from MDX files on the frontend
			res.json({
				success: true,
				message: "Posts are read directly from MDX files on the frontend",
			});
		} catch (error) {
			console.error("Get post error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	app.get("/api/projects", async (req, res) => {
		try {
			// Projects are read directly from MDX files on the frontend
			res.json({
				success: true,
				projects: [],
				message: "Projects are read directly from MDX files on the frontend",
			});
		} catch (error) {
			console.error("Get projects error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	app.get("/api/projects/:slug", async (req, res) => {
		try {
			// Projects are read directly from MDX files on the frontend
			res.json({
				success: true,
				message: "Projects are read directly from MDX files on the frontend",
			});
		} catch (error) {
			console.error("Get project error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	// Health check endpoint
	app.get("/api/health", (req, res) => {
		res.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		});
	});

	const httpServer = createServer(app);
	return httpServer;
}
