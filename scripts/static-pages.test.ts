import { afterAll, describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { JSDOM } from "jsdom";
import { getStaticPages, readArticles, renderPageHtml } from "./static-pages";
import { SEO_CONFIGS } from "../client/src/lib/seo";

const root = path.resolve(import.meta.dir, "..");
const template = readFileSync(path.join(root, "client/index.html"), "utf8");
const fixture = mkdtempSync(path.join(os.tmpdir(), "portfolio-seo-"));
afterAll(() => rmSync(fixture, { recursive: true, force: true }));

describe("crawlable static pages", () => {
	it("gives each sitemap route its own real content and canonical before JavaScript runs", async () => {
		const pages = await getStaticPages(root);
		expect(pages.map((page) => page.pathname)).toContain("/projects/orbitalnc");
		const titles = new Set<string>();
		for (const page of pages) {
			const dom = new JSDOM(renderPageHtml(template, page));
			const document = dom.window.document;
			expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(`https://omidrezakeshtkar.dev${page.pathname === "/" ? "/" : `${page.pathname}/`}`);
			expect(document.querySelector("main h1")?.textContent?.length).toBeGreaterThan(2);
			expect(document.querySelector("main")?.textContent?.length).toBeGreaterThan(80);
			expect(document.querySelectorAll('nav[aria-label="Main navigation"] a[href]').length).toBe(5);
			expect(document.querySelectorAll('link[rel="preload"][as="image"]').length).toBe(page.pathname === "/" ? 2 : 1);
			expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(document.querySelector('link[rel="canonical"]')?.getAttribute("href"));
			if (page.pathname !== "/") expect(document.querySelector('script[type="application/ld+json"]')?.textContent ?? "").not.toContain('"@type":"Person","name":"OmidReza Keshtkar","alternateName"');
			titles.add(document.title);
			dom.window.close();
		}
		expect(titles.size).toBe(pages.length);
	});
	it("includes the actual home header and hero before client JavaScript runs", async () => {
		const [home] = await getStaticPages(root);
		const dom = new JSDOM(renderPageHtml(template, home));
		const document = dom.window.document;
		expect(document.querySelector('#root header img[alt="ORK"]')?.getAttribute("fetchpriority")).toBe("high");
		expect(document.querySelector(".pf-landing-hero h1")?.textContent).toContain("KESHTKAR");
		expect(document.querySelector(".pf-globe-3d picture img")).not.toBeNull();
		expect(document.querySelector(".pf-layout-content > div")?.getAttribute("style")).toContain("opacity:1");
		dom.window.close();
	});
	it("serves the existing font families locally with valid font binaries", () => {
		const css = readFileSync(path.join(root, "client/src/styles/fonts.css"), "utf8");
		expect(css).not.toContain("https://fonts.");
		for (const family of ["Geist", "Geist Mono", "Orbitron", "Share Tech Mono"]) {
			expect(css).toContain(`font-family: '${family}'`);
		}
		for (const [, url] of css.matchAll(/src: url\(([^)]+)\)/g)) {
			expect(url.startsWith("/fonts/")).toBe(true);
			expect(readFileSync(path.join(root, "client/public", url)).subarray(0, 4).toString()).toBe("wOF2");
		}
		const dom = new JSDOM(template);
		const preloads = dom.window.document.querySelectorAll('link[rel="preload"][as="font"]');
		expect(preloads.length).toBe(2);
		for (const preload of preloads) {
			expect(css).toContain(preload.getAttribute("href")!);
			expect(preload.hasAttribute("crossorigin")).toBe(true);
		}
		expect(template).not.toContain("fonts.googleapis.com");
		dom.window.close();
	});
	it("excludes drafts and README and escapes author-supplied metadata", async () => {
		writeFileSync(path.join(fixture, "README.md"), "Writing instructions");
		writeFileSync(path.join(fixture, "draft.mdx"), '---\ntitle: Hidden\ndraft: "true"\n---\nSecret');
		writeFileSync(path.join(fixture, "unpublished.md"), '---\ntitle: Hidden\npublished: false\n---\nSecret');
		writeFileSync(path.join(fixture, "published.md"), '---\ntitle: A & B\nexcerpt: \'Text "quoted" <safe>\'\n---\n## Real content\nA public article.');
		const pages = await readArticles(fixture, "blog");
		expect(pages).toHaveLength(1);
		const dom = new JSDOM(renderPageHtml(template, pages[0]));
		expect(dom.window.document.title).toBe("A & B | Omid Reza Keshtkar");
		expect(dom.window.document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe('Text "quoted" <safe>');
		expect(dom.window.document.querySelector("main")?.textContent).toContain("Real content");
		dom.window.close();
	});
	it("keeps the actual error document out of the index", () => {
		const dom = new JSDOM(renderPageHtml(template, { pathname: "/404.html", seo: SEO_CONFIGS.notFound, body: "<h1>Page Not Found</h1>" }));
		expect(dom.window.document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, follow");
		dom.window.close();
	});
});
