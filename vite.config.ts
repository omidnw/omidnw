import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "vite-plugin-sitemap";
import { readdirSync, readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const blogSlugs = readdirSync(path.resolve(__dirname, "client/src/blogs"))
	.filter((f) => /\.mdx?$/.test(f) && f.toLowerCase() !== "readme.md")
	.filter((f) => {
		const raw = readFileSync(path.resolve(__dirname, "client/src/blogs", f), "utf8");
		const frontmatter = /^---\s*\n([\s\S]*?)\n---/.exec(raw)?.[1] ?? "";
		return !/^\s*(?:draft:\s*["']?true["']?|published:\s*["']?false["']?)\s*$/m.test(frontmatter);
	})
	.map((f) => f.replace(/\.mdx?$/, ""));

const projectSlugs = readdirSync(path.resolve(__dirname, "client/src/projects"))
	.filter((f) => f.endsWith(".mdx"))
	.map((f) => f.replace(/\.mdx$/, ""));

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		sitemap({
			hostname: "https://omidrezakeshtkar.dev",
			outDir: "dist/public",
			dynamicRoutes: [
				"/about",
				"/blog",
				"/projects",
				"/contact",
				...blogSlugs.map((s) => `/blog/${s}`),
				...projectSlugs.map((s) => `/projects/${s}`),
			],
			exclude: ["/terminal", "/404.html"],
			removeUnusedRoutes: false,
			generaterobotsTxt: false,
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "client", "src"),
		},
	},
	root: path.resolve(__dirname, "client"),
	build: {
		outDir: path.resolve(__dirname, "dist/public"),
		emptyOutDir: true,
	},
});
