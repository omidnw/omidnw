// GitHub Repository Configuration
export interface GitHubConfig {
	owner: string;
	repo: string;
	projectsPath: string;
	blogsPath: string; // Added for blog posts
	branch?: string;
	enableLocalFallback?: boolean; // Manual control for local fallback
}

// Configure your GitHub repository here
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "omidnw", // Your GitHub username
	repo: "omidnw", // Your repository name (public repo)
	projectsPath: "client/src/projects", // Path to projects folder
	blogsPath: "client/src/blogs", // Path to blogs folder
	branch: "master", // Branch to read from
	enableLocalFallback: true, // Fallback to local files if GitHub fails
};

// File-based reading is the primary method - no database storage
export const USE_FILES_ONLY = true; // Always read from files, never store in database
export const USE_GITHUB_INTEGRATION = true; // Read from public GitHub repository (no token needed for public repos)

// GitHub API configuration
export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

// Rate limiting and caching
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const REQUEST_TIMEOUT = 10000; // 10 seconds
