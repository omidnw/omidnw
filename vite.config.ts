import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "vite-plugin-sitemap";
import { readdirSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const blogSlugs = readdirSync(path.resolve(__dirname, "client/src/blogs"))
	.filter((f) => f.endsWith(".mdx"))
	.map((f) => f.replace(/\.mdx$/, ""));

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
