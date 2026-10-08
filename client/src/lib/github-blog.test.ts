import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearBlogCache, fetchBlogFiles, fetchBlogContent, fetchAllBlogPosts } from "./github-api";
import { loadLocalBlogPosts, loadLocalBlogPostById } from "./local-blogs";

const fetchMock = vi.fn();
const file = (name: string, type = "file") => ({ name, type, path: `client/src/blogs/${name}`, sha: name, size: 1, url: "", html_url: "", git_url: "", download_url: `https://raw.githubusercontent.com/fixture/${name}` });
const content = (flags: string) => `---\ntitle: "Fixture article"\nexcerpt: "Summary"\nauthor: "Author"\ndate: "2026-10-08"\nreadTime: "5 min"\ntags: ["Testing", "Engineering"]\n${flags}\n---\n\n## Article body\nActual content.`;

beforeEach(() => { clearBlogCache(); fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { vi.unstubAllGlobals(); clearBlogCache(); });

describe("published blog content", () => {
	it("reports a failed article download instead of treating it as unpublished", async () => {
		fetchMock.mockResolvedValue(new Response("Unavailable", { status: 503 }));
		await expect(fetchBlogContent(file("public.mdx"))).rejects.toThrow("Failed to fetch blog content");
	});
	it("does not restore deleted starter articles from an older GitHub snapshot", async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify([file("getting-started-with-react.mdx"), file("typescript-best-practices.mdx"), file("building-cyberpunk-ui.mdx")])));
		expect(await fetchAllBlogPosts()).toEqual({});
		expect(await fetchBlogContent(file("getting-started-with-react.mdx"))).toBeNull();
	});
	it("lists Markdown articles while excluding examples directory and README", async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify([file("public.mdx"), file("public.md"), file("README.md"), file("examples", "dir")])));
		expect((await fetchBlogFiles()).map((entry) => entry.name)).toEqual(["public.mdx", "public.md"]);
	});
	it.each(["draft: true", "published: false", 'draft: "true"'])("hides an unpublished article with %s", async (flag) => {
		fetchMock.mockResolvedValue(new Response(content(flag)));
		expect(await fetchBlogContent(file("draft.mdx"))).toBeNull();
	});
	it("parses a published remote article's metadata and body", async () => {
		fetchMock.mockResolvedValue(new Response(content("draft: false")));
		expect(await fetchBlogContent(file("public.mdx"))).toMatchObject({ id: "public", title: "Fixture article", tags: ["Testing", "Engineering"], content: "## Article body\nActual content." });
	});
	it("excludes drafts from the remote archive, including direct lookup results", async () => {
		fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([file("public.mdx"), file("draft.mdx")])));
		fetchMock.mockImplementation((url: string) => Promise.resolve(new Response(content(url.endsWith("draft.mdx") ? "draft: true" : "draft: false"))));
		expect(Object.keys(await fetchAllBlogPosts())).toEqual(["public"]);
	});
	it("never exposes the local writing guide as an article", async () => {
		expect((await loadLocalBlogPosts()).some((post) => post.id === "example" || post.id.toLowerCase() === "readme")).toBe(false);
		expect(await loadLocalBlogPostById("example")).toBeNull();
	});
});
