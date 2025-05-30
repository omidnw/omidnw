import {
	GITHUB_CONFIG,
	GITHUB_API_BASE,
	GITHUB_RAW_BASE,
	CACHE_DURATION,
	REQUEST_TIMEOUT,
	USE_GITHUB_INTEGRATION,
} from "./github-config";

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();

// Project data interface
export interface ProjectData {
	id: string;
	title: string;
	description: string;
	content: string;
	image: string;
	demoUrl?: string;
	githubUrl?: string;
	technologies: string[];
	status: "completed" | "in-progress" | "planned";
	featured?: boolean;
	startDate: string;
	endDate?: string;
	category: string;
	tags: string[];
}

// Blog post data interface
export interface BlogPostData {
	id: string;
	title: string;
	excerpt: string;
	content: string; // Raw MDX content
	author: string;
	date: string; // YYYY-MM-DD format
	readTime: string; // e.g., "8 min"
	tags: string[];
	featured?: boolean;
	// Add any other relevant fields like coverImage, category, etc.
	// For example:
	// coverImage?: string;
	// category?: string;
}

// GitHub API response types
interface GitHubFile {
	name: string;
	path: string;
	sha: string;
	size: number;
	url: string;
	html_url: string;
	git_url: string;
	download_url: string;
	type: string;
}

interface GitHubTreeResponse {
	sha: string;
	url: string;
	tree: GitHubFile[];
	truncated: boolean;
}

// Fetch with timeout
async function fetchWithTimeout(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

// Parse MDX frontmatter
function parseFrontmatter(content: string): {
	frontmatter: any;
	content: string;
} {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, content };
	}

	const [, frontmatterText, bodyContent] = match;

	try {
		// Simple YAML-like parser for frontmatter
		const frontmatter: any = {};
		const lines = frontmatterText.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line || line.startsWith("#")) continue;

			const colonIndex = line.indexOf(":");
			if (colonIndex === -1) continue;

			const key = line.substring(0, colonIndex).trim();
			let value = line.substring(colonIndex + 1).trim();

			// Handle quoted strings
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}

			// Handle arrays
			if (value.startsWith("[") && value.endsWith("]")) {
				try {
					// Simple array parsing - handle strings in arrays
					const arrayContent = value.slice(1, -1);
					const items = arrayContent
						.split(",")
						.map((item) => {
							item = item.trim();
							if (
								(item.startsWith('"') && item.endsWith('"')) ||
								(item.startsWith("'") && item.endsWith("'"))
							) {
								return item.slice(1, -1);
							}
							return item;
						})
						.filter((item) => item.length > 0);
					frontmatter[key] = items;
				} catch {
					frontmatter[key] = value;
				}
			} else if (value === "true") {
				frontmatter[key] = true;
			} else if (value === "false") {
				frontmatter[key] = false;
			} else if (!isNaN(Number(value)) && value !== "") {
				frontmatter[key] = Number(value);
			} else {
				frontmatter[key] = value;
			}
		}

		return { frontmatter, content: bodyContent };
	} catch (error) {
		console.warn("Failed to parse frontmatter:", error);
		return { frontmatter: {}, content };
	}
}

// Check if cache is valid
function isCacheValid(cacheKey: string): boolean {
	const cached = cache.get(cacheKey);
	if (!cached) return false;
	return Date.now() - cached.timestamp < CACHE_DURATION;
}

// Get from cache
function getFromCache<T>(cacheKey: string): T | null {
	const cached = cache.get(cacheKey);
	if (!cached || !isCacheValid(cacheKey)) {
		cache.delete(cacheKey);
		return null;
	}
	return cached.data;
}

// Set cache
function setCache<T>(cacheKey: string, data: T): void {
	cache.set(cacheKey, { data, timestamp: Date.now() });
}

// Fetch project files from GitHub
export async function fetchProjectFiles(): Promise<GitHubFile[]> {
	const cacheKey = `projects-${GITHUB_CONFIG.owner}-${GITHUB_CONFIG.repo}`;

	// Check cache first
	const cached = getFromCache<GitHubFile[]>(cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const url = `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${
			GITHUB_CONFIG.repo
		}/contents/${GITHUB_CONFIG.projectsPath}?ref=${
			GITHUB_CONFIG.branch || "main"
		}`;

		const response = await fetchWithTimeout(url);

		if (!response.ok) {
			if (response.status === 404) {
				console.warn(
					`GitHub repository or path not found: ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.projectsPath}`
				);
				return [];
			}
			throw new Error(
				`GitHub API error: ${response.status} ${response.statusText}`
			);
		}

		const files: GitHubFile[] = await response.json();

		// Filter for MDX files
		const mdxFiles = files.filter(
			(file) =>
				file.type === "file" &&
				(file.name.endsWith(".mdx") || file.name.endsWith(".md"))
		);

		setCache(cacheKey, mdxFiles);
		return mdxFiles;
	} catch (error) {
		console.error("Error fetching project files from GitHub:", error);
		throw error;
	}
}

// Fetch and parse a single project file
export async function fetchProjectContent(
	file: GitHubFile
): Promise<ProjectData | null> {
	const cacheKey = `project-content-${file.sha}`;

	// Check cache first
	const cached = getFromCache<ProjectData>(cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const response = await fetchWithTimeout(file.download_url);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch project content: ${response.status} ${response.statusText}`
			);
		}

		const content = await response.text();
		const { frontmatter, content: bodyContent } = parseFrontmatter(content);

		// Extract project ID from filename
		const id = file.name.replace(/\.(mdx?|md)$/, "");

		// Create project data object
		const projectData: ProjectData = {
			id,
			title: frontmatter.title || id,
			description: frontmatter.description || "",
			content: bodyContent,
			image: frontmatter.image || "/projects/default.jpg",
			demoUrl: frontmatter.demoUrl,
			githubUrl: frontmatter.githubUrl,
			technologies: frontmatter.technologies || [],
			status: frontmatter.status || "planned",
			featured: frontmatter.featured || false,
			startDate:
				frontmatter.startDate || new Date().toISOString().split("T")[0],
			endDate: frontmatter.endDate,
			category: frontmatter.category || "Other",
			tags: frontmatter.tags || [],
		};

		setCache(cacheKey, projectData);
		return projectData;
	} catch (error) {
		console.error(`Error fetching project content for ${file.name}:`, error);
		return null;
	}
}

// Fetch all projects from GitHub
export async function fetchAllProjects(): Promise<Record<string, ProjectData>> {
	try {
		const files = await fetchProjectFiles();
		const projects: Record<string, ProjectData> = {};

		// Fetch content for each file in parallel
		const projectPromises = files.map(async (file) => {
			const project = await fetchProjectContent(file);
			if (project) {
				projects[project.id] = project;
			}
		});

		await Promise.all(projectPromises);
		return projects;
	} catch (error) {
		console.error("Error fetching all projects:", error);
		throw error;
	}
}

// Fetch a specific project by slug
export async function fetchProjectBySlug(
	slug: string
): Promise<ProjectData | null> {
	try {
		const allProjects = await fetchAllProjects();
		return allProjects[slug] || null;
	} catch (error) {
		console.error(`Error fetching project by slug ${slug}:`, error);
		return null;
	}
}

// Check if GitHub integration is configured and enabled
export function isGitHubConfigured(): boolean {
	// First check if GitHub integration is enabled
	if (!USE_GITHUB_INTEGRATION) {
		return false;
	}

	return !!(
		GITHUB_CONFIG.owner &&
		GITHUB_CONFIG.repo &&
		GITHUB_CONFIG.projectsPath
	);
}

// Clear cache (useful for development or manual refresh)
export function clearProjectsCache(): void {
	cache.clear();
}

// --- Blog Post Functions ---

// Fetch blog files from GitHub
export async function fetchBlogFiles(): Promise<GitHubFile[]> {
	const cacheKey = `blogs-${GITHUB_CONFIG.owner}-${GITHUB_CONFIG.repo}`;

	const cached = getFromCache<GitHubFile[]>(cacheKey);
	if (cached) return cached;

	try {
		const url = `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${
			GITHUB_CONFIG.repo
		}/contents/${GITHUB_CONFIG.blogsPath}?ref=${
			GITHUB_CONFIG.branch || "main"
		}`;
		const response = await fetchWithTimeout(url);

		if (!response.ok) {
			if (response.status === 404) {
				console.warn(
					`GitHub repository or path not found for blogs: ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.blogsPath}`
				);
				return [];
			}
			throw new Error(
				`GitHub API error (blogs): ${response.status} ${response.statusText}`
			);
		}

		const files: GitHubFile[] = await response.json();
		const mdxFiles = files.filter(
			(file) =>
				file.type === "file" &&
				(file.name.endsWith(".mdx") || file.name.endsWith(".md"))
		);

		setCache(cacheKey, mdxFiles);
		return mdxFiles;
	} catch (error) {
		console.error("Error fetching blog files from GitHub:", error);
		throw error;
	}
}

// Fetch and parse a single blog post file
export async function fetchBlogContent(
	file: GitHubFile
): Promise<BlogPostData | null> {
	const cacheKey = `blog-content-${file.sha}`;

	const cached = getFromCache<BlogPostData>(cacheKey);
	if (cached) return cached;

	try {
		const response = await fetchWithTimeout(file.download_url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch blog content: ${response.status} ${response.statusText}`
			);
		}

		const rawContent = await response.text();
		const { frontmatter, content: bodyContent } = parseFrontmatter(rawContent);

		const id = file.name.replace(/\.(mdx?|md)$/, "");

		const blogPostData: BlogPostData = {
			id,
			title: frontmatter.title || id,
			excerpt: frontmatter.excerpt || "",
			content: bodyContent,
			author: frontmatter.author || "Anonymous",
			date: frontmatter.date || new Date().toISOString().split("T")[0],
			readTime: frontmatter.readTime || "5 min",
			tags: frontmatter.tags || [],
			featured: frontmatter.featured || false,
			// coverImage: frontmatter.coverImage,
			// category: frontmatter.category || "General",
		};

		setCache(cacheKey, blogPostData);
		return blogPostData;
	} catch (error) {
		console.error(`Error fetching blog content for ${file.name}:`, error);
		return null;
	}
}

// Fetch all blog posts from GitHub
export async function fetchAllBlogPosts(): Promise<
	Record<string, BlogPostData>
> {
	try {
		const files = await fetchBlogFiles();
		const posts: Record<string, BlogPostData> = {};

		const postPromises = files.map(async (file) => {
			const post = await fetchBlogContent(file);
			if (post) {
				posts[post.id] = post;
			}
		});

		await Promise.all(postPromises);
		return posts;
	} catch (error) {
		console.error("Error fetching all blog posts:", error);
		throw error;
	}
}

// Fetch a specific blog post by slug
export async function fetchBlogPostBySlug(
	slug: string
): Promise<BlogPostData | null> {
	try {
		const allPosts = await fetchAllBlogPosts();
		return allPosts[slug] || null;
	} catch (error) {
		console.error(`Error fetching blog post by slug ${slug}:`, error);
		return null;
	}
}

// Clear cache for blog posts (can be part of a more generic clearCache if needed)
export function clearBlogCache(): void {
	// Example: Clear all cache entries starting with "blog-"
	const keysToDelete = [];
	// Convert iterator to array before iterating
	for (const key of Array.from(cache.keys())) {
		if (key.startsWith("blog-") || key.startsWith("blogs-")) {
			keysToDelete.push(key);
		}
	}
	keysToDelete.forEach((key) => cache.delete(key));
	console.log("Blog cache cleared.");
}
