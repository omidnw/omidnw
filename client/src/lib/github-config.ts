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
	owner: "omidnw", // Replace with your GitHub username
	repo: "omidnw", // Replace with your projects repository name
	projectsPath: "client/src/projects", // Path to projects folder in your repo (e.g., "projects" or "src/projects")
	blogsPath: "client/src/blogs", // Path to blogs folder in your repo
	branch: "master", // Branch to read from (default: main)
	enableLocalFallback: true, // Set to false to disable local fallback completely
};

// For now, let's disable GitHub to avoid rate limiting and use local files
export const USE_GITHUB_INTEGRATION = false; // Set to true when you want to enable GitHub integration

// GitHub API configuration
export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

// Rate limiting and caching
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const REQUEST_TIMEOUT = 10000; // 10 seconds
