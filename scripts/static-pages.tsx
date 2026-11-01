import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import { JSDOM } from "jsdom";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { BASE_SEO, SEO_CONFIGS, type SEOData } from "../client/src/lib/seo";
import { navigationItems } from "../client/src/lib/navigation";
import ProfessionalAboutPage from "../client/src/components/themes/professional/ProfessionalAboutPage";
import ProfessionalAbout from "../client/src/components/themes/professional/ProfessionalAbout";
import { pictureSource } from "../client/src/lib/images";
import { EMAIL, socialLinks } from "../client/src/lib/social";

export interface StaticPage {
	pathname: string;
	seo: SEOData;
	body: string;
}

// Only top-level, published files are public, matching the client loaders.
export async function readArticles(directory: string, prefix: string): Promise<StaticPage[]> {
	const pages: StaticPage[] = [];
	for (const filename of readdirSync(directory).sort()) {
		if (!/\.mdx?$/.test(filename) || /^readme\.md$/i.test(filename)) continue;
		const raw = readFileSync(path.join(directory, filename), "utf8");
		const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw);
		const frontmatter = match?.[1] ?? "";
		const field = (name: string) => {
			const value = new RegExp(`^${name}:\\s*(.+)$`, "m").exec(frontmatter)?.[1]?.trim() ?? "";
			return value.replace(/^(["'])(.*)\1$/, "$2");
		};
		if (field("draft") === "true" || field("published") === "false") continue;
		const slug = filename.replace(/\.mdx?$/, "");
		const title = field("title") || slug;
		const description = field("description") || field("excerpt") || title;
		const body = String(await remark().use(remarkGfm).use(remarkHtml).process(raw.slice(match?.[0].length ?? 0)))
			.replace(/^\s*<h1>([\s\S]*?)<\/h1>/, "<h2>$1</h2>");
		pages.push({
			pathname: `/${prefix}/${slug}`,
			seo: { title: `${title} | ${BASE_SEO.author}`, description, keywords: [], type: prefix === "blog" ? "article" : "website" },
			body: renderToStaticMarkup(<article><h1>{title}</h1><p>{description}</p><div dangerouslySetInnerHTML={{ __html: body }} /></article>),
		});
	}
	return pages;
}

export async function getStaticPages(root: string): Promise<StaticPage[]> {
	const projects = await readArticles(path.join(root, "client/src/projects"), "projects");
	const blogs = await readArticles(path.join(root, "client/src/blogs"), "blog");
	const list = (pages: StaticPage[]) => <ul>{pages.map((page) => <li key={page.pathname}><a href={page.pathname}>{page.seo.title.split(" | ")[0]}</a><p>{page.seo.description}</p></li>)}</ul>;
	return [
		{ pathname: "/", seo: SEO_CONFIGS.home, body: renderToStaticMarkup(<><h1>{BASE_SEO.author}</h1><p>{SEO_CONFIGS.home.description}</p><Router ssrPath="/"><ProfessionalAbout /></Router><h2>Selected Work</h2>{list(projects)}</>) },
		{ pathname: "/about", seo: SEO_CONFIGS.about, body: renderToStaticMarkup(<Router ssrPath="/about"><ProfessionalAboutPage /></Router>) },
		{ pathname: "/projects", seo: SEO_CONFIGS.projects, body: renderToStaticMarkup(<><h1>Selected Work</h1><p>{SEO_CONFIGS.projects.description}</p>{list(projects)}</>) },
		{ pathname: "/blog", seo: SEO_CONFIGS.blog, body: renderToStaticMarkup(<><h1>Blog</h1><p>{SEO_CONFIGS.blog.description}</p>{blogs.length ? list(blogs) : <p>No articles published yet.</p>}</>) },
		{ pathname: "/contact", seo: SEO_CONFIGS.contact, body: renderToStaticMarkup(<><h1>Contact {BASE_SEO.author}</h1><p>{SEO_CONFIGS.contact.description}</p><a href={`mailto:${EMAIL}`}>{EMAIL}</a><ul>{socialLinks.map((link) => <li key={link.url}><a href={link.url}>{link.name}</a></li>)}</ul></>) },
		...projects, ...blogs,
	];
}

export function renderPageHtml(template: string, page: StaticPage): string {
	const dom = new JSDOM(template);
	const document = dom.window.document;
	const url = new URL(page.pathname.endsWith("/") || page.pathname.endsWith(".html") ? page.pathname : `${page.pathname}/`, BASE_SEO.siteUrl).href;
	const meta = (attribute: "name" | "property", key: string, value: string) => {
		let element = document.querySelector(`meta[${attribute}="${key}"]`);
		if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.append(element); }
		element.setAttribute("content", value);
	};
	if (page.pathname === "/") {
		const globe = pictureSource("/images/futuristic-earth.png");
		const preload = document.createElement("link");
		preload.setAttribute("rel", "preload");
		preload.setAttribute("as", "image");
		preload.setAttribute("href", globe.src);
		preload.setAttribute("imagesrcset", globe.srcSet);
		preload.setAttribute("imagesizes", "(min-width: 1024px) 40rem, (min-width: 640px) 30rem, 26rem");
		preload.setAttribute("fetchpriority", "high");
		document.head.append(preload);
	}
	document.title = page.seo.title;
	meta("name", "title", page.seo.title);
	meta("name", "description", page.seo.description);
	meta("name", "keywords", page.seo.keywords.join(", "));
	meta("name", "robots", page.seo.robots ?? "index, follow");
	document.querySelector('link[rel="canonical"]')!.setAttribute("href", url);
	for (const [key, value] of Object.entries({ title: page.seo.title, description: page.seo.description, url, type: page.seo.type ?? "website" })) meta("property", `og:${key}`, value);
	for (const [key, value] of Object.entries({ title: page.seo.title, description: page.seo.description, url })) meta("name", `twitter:${key}`, value);
	document.querySelectorAll('script[type="application/ld+json"]').forEach((element) => element.remove());
	if (page.seo.structuredData) {
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.textContent = JSON.stringify(page.seo.structuredData).replace(/</g, "\\u003c");
		document.head.append(script);
	}
	const nav = renderToStaticMarkup(<nav aria-label="Main navigation">{navigationItems.map((item) => <a className="inline-block p-3 underline" key={item.path} href={item.path}>{item.name}</a>)}</nav>);
	document.documentElement.dataset.theme = "professional";
	document.documentElement.classList.add("dark");
	document.getElementById("root")!.innerHTML = `${nav}<main class="pf-shell pf-inner-page pb-12">${page.body}</main>`;
	document.querySelectorAll("main h1").forEach((heading) => heading.classList.add("pf-heading"));
	const html = dom.serialize();
	dom.window.close();
	return html;
}
