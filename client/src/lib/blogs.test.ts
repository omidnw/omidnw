import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { GITHUB_CONFIG } from "./github-config";
import { fetchAllBlogPosts, isGitHubConfigured, type BlogPostData } from "./github-api";
import { loadLocalBlogPosts } from "./local-blogs";
import { loadBlogPosts, loadBlogPostById } from "./blogs";

vi.mock("./github-api", () => ({ fetchAllBlogPosts: vi.fn(), isGitHubConfigured: vi.fn() }));
vi.mock("./local-blogs", () => ({ loadLocalBlogPosts: vi.fn() }));
const originalFallback = GITHUB_CONFIG.enableLocalFallback;
const post: BlogPostData = { id: "published", title: "Published article", excerpt: "Summary", content: "Body", author: "Author", date: "2026-10-08", readTime: "5 min", tags: [] };

beforeEach(() => {
	vi.resetAllMocks();
	GITHUB_CONFIG.enableLocalFallback = true;
	vi.mocked(isGitHubConfigured).mockReturnValue(true);
	vi.mocked(loadLocalBlogPosts).mockResolvedValue([post]);
});
afterEach(() => { GITHUB_CONFIG.enableLocalFallback = originalFallback; });

describe("blog data source", () => {
	it("shares an in-flight GitHub request between metadata and body", async () => {
		vi.mocked(fetchAllBlogPosts).mockResolvedValue({ published: post });
		const [metadata, body] = await Promise.all([loadBlogPostById("published"), loadBlogPostById("published")]);
		expect(metadata).toEqual(post);
		expect(body).toEqual(post);
		expect(fetchAllBlogPosts).toHaveBeenCalledTimes(1);
	});
	it("loads a GitHub article for the archive and detail route", async () => {
		vi.mocked(fetchAllBlogPosts).mockResolvedValue({ published: post });
		expect(await loadBlogPosts()).toEqual([post]);
		expect(await loadBlogPostById("published")).toEqual(post);
		expect(loadLocalBlogPosts).not.toHaveBeenCalled();
	});
	it("does not resurrect local articles after GitHub returns an empty archive", async () => {
		vi.mocked(fetchAllBlogPosts).mockResolvedValue({});
		expect(await loadBlogPosts()).toEqual([]);
		expect(await loadBlogPostById("published")).toBeNull();
		expect(loadLocalBlogPosts).not.toHaveBeenCalled();
	});
	it("keeps a missing GitHub slug missing even when the local snapshot has it", async () => {
		vi.mocked(fetchAllBlogPosts).mockResolvedValue({ other: { ...post, id: "other" } });
		expect(await loadBlogPostById("published")).toBeNull();
		expect(loadLocalBlogPosts).not.toHaveBeenCalled();
	});
	it("uses the local snapshot when GitHub fails and fallback is enabled", async () => {
		vi.mocked(fetchAllBlogPosts).mockRejectedValue(new Error("offline"));
		expect(await loadBlogPosts()).toEqual([post]);
	});
	it("reports GitHub failure when fallback is disabled", async () => {
		GITHUB_CONFIG.enableLocalFallback = false;
		vi.mocked(fetchAllBlogPosts).mockRejectedValue(new Error("offline"));
		await expect(loadBlogPosts()).rejects.toThrow("offline");
		expect(loadLocalBlogPosts).not.toHaveBeenCalled();
	});
});
