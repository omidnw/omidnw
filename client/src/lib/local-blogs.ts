import type { BlogPostData } from "./github-api";

// Parse MDX frontmatter (reusing logic from github-api.ts or a shared utility)
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
		const frontmatter: any = {};
		const lines = frontmatterText.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line || line.startsWith("#")) continue;

			const colonIndex = line.indexOf(":");
			if (colonIndex === -1) continue;

			const key = line.substring(0, colonIndex).trim();
			let value = line.substring(colonIndex + 1).trim();

			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}

			if (value.startsWith("[") && value.endsWith("]")) {
				try {
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

async function importBlogFiles(): Promise<Record<string, string>> {
	try {
		// Path relative to this file (lib/local-blogs.ts) -> ../blogs/*.mdx
		const modules = import.meta.glob("../blogs/*.mdx", {
			as: "raw",
			eager: true,
		});

		const blogFiles: Record<string, string> = {};

		for (const [path, content] of Object.entries(modules)) {
			const filename = path
				.split("/")
				.pop()
				?.replace(/\.mdx?$/, "");
			if (filename && typeof content === "string") {
				blogFiles[filename] = content;
			}
		}
		return blogFiles;
	} catch (error) {
		console.error("Failed to import blog files:", error);
		return {};
	}
}

function mdxToBlogPostData(id: string, mdxContent: string): BlogPostData {
	const { frontmatter, content } = parseFrontmatter(mdxContent);

	return {
		id,
		title: frontmatter.title || id,
		excerpt: frontmatter.excerpt || "",
		content,
		author: frontmatter.author || "Anonymous",
		date: frontmatter.date || new Date().toISOString().split("T")[0],
		readTime: frontmatter.readTime || "5 min",
		tags: frontmatter.tags || [],
		featured: frontmatter.featured || false,
		// coverImage: frontmatter.coverImage,
		// category: frontmatter.category || "General",
	};
}

export async function loadLocalBlogPosts(): Promise<BlogPostData[]> {
	try {
		console.log("📄 Loading blog posts from local files...");

		const blogFiles = await importBlogFiles();
		const posts: BlogPostData[] = [];

		for (const [id, content] of Object.entries(blogFiles)) {
			try {
				const post = mdxToBlogPostData(id, content);
				posts.push(post);
			} catch (error) {
				console.warn(`⚠️ Failed to parse blog post ${id}:`, error);
			}
		}

		console.log(`📚 Loaded ${posts.length} blog posts from local files`);
		return posts;
	} catch (error) {
		console.error("❌ Failed to load local blog posts:", error);
		return [];
	}
}

export async function loadLocalBlogPostById(
	id: string
): Promise<BlogPostData | null> {
	try {
		const blogFiles = await importBlogFiles();
		const content = blogFiles[id];

		if (!content) {
			console.warn(`⚠️ Blog post file not found: ${id}.mdx`);
			return null;
		}

		const post = mdxToBlogPostData(id, content);
		console.log(`✅ Loaded local blog post: ${post.title}`);
		return post;
	} catch (error) {
		console.error(`Failed to load blog post ${id}:`, error);
		return null;
	}
}
