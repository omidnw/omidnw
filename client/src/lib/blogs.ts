import {
	fetchAllBlogPosts,
	isGitHubConfigured,
	type BlogPostData,
} from "./github-api";
import { GITHUB_CONFIG } from "./github-config";
import { loadLocalBlogPosts } from "./local-blogs";

// A successful empty GitHub archive is authoritative. Fallback is for failures.
async function readBlogPosts(): Promise<BlogPostData[]> {
	if (!isGitHubConfigured()) {
		return GITHUB_CONFIG.enableLocalFallback ? loadLocalBlogPosts() : [];
	}
	try {
		return Object.values(await fetchAllBlogPosts());
	} catch (error) {
		if (!GITHUB_CONFIG.enableLocalFallback) throw error;
		return loadLocalBlogPosts();
	}
}

// Metadata and article body request the same archive concurrently.
let pendingLoad: Promise<BlogPostData[]> | null = null;

export function loadBlogPosts(): Promise<BlogPostData[]> {
	pendingLoad ??= readBlogPosts().finally(() => { pendingLoad = null; });
	return pendingLoad;
}

export async function loadBlogPostById(id: string): Promise<BlogPostData | null> {
	const posts = await loadBlogPosts();
	return posts.find((post) => post.id === id) ?? null;
}
