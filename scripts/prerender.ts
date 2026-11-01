import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getStaticPages, renderPageHtml } from "./static-pages";
import { BASE_SEO, SEO_CONFIGS } from "../client/src/lib/seo";

const root = path.resolve(import.meta.dir, "..");
const output = path.join(root, "dist/public");
const template = readFileSync(path.join(output, "index.html"), "utf8");
const pages = await getStaticPages(root);
for (const page of pages) {
	const directory = path.join(output, page.pathname);
	mkdirSync(directory, { recursive: true });
	writeFileSync(path.join(directory, "index.html"), renderPageHtml(template, page));
}
// GitHub Pages serves this with HTTP 404 for unknown paths; valid routes have
// their own index.html and must never depend on the error document.
writeFileSync(path.join(output, "404.html"), renderPageHtml(template, {
	pathname: "/404.html", seo: SEO_CONFIGS.notFound,
	body: '<h1>Page Not Found</h1><p><a href="/">Return to the portfolio</a></p>',
}));
writeFileSync(path.join(output, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.map((page) => `<url><loc>${new URL(page.pathname.endsWith("/") ? page.pathname : `${page.pathname}/`, BASE_SEO.siteUrl).href}</loc></url>`).join("") + '</urlset>\n');
console.log(`Generated ${pages.length} public HTML pages, sitemap.xml and 404.html`);
