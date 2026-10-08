import type { ProjectData } from "./github-api";

/**
 * Collapse YAML flow sequences that span several lines into a single line.
 *
 * Every project's `technologies` and `tags` are written as a block:
 *
 *     technologies:
 *       [
 *         "Tauri",
 *         "React",
 *       ]
 *
 * The line-based scanner below cannot read that shape: it reads `technologies:`
 * as an empty value and never returns to the bracket, so the whole list was
 * silently discarded and `technologies` came back empty on every project. The
 * regex is deliberately restricted to brackets that open on one line and close
 * on another, so bracketed text inside a single-line value is never touched.
 */
function collapseFlowArrays(frontmatterText: string): string {
	return frontmatterText.replace(
		/\[\s*\n([^\]]*?)\n\s*\]/g,
		(_, inner: string) => `[${inner.replace(/\s+/g, " ").trim()}]`,
	);
}

// Parse MDX frontmatter (reusing logic from github-api.ts)
function parseFrontmatter(content: string): {
	frontmatter: any;
	content: string;
} {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, content };
	}

	const [, rawFrontmatterText, bodyContent] = match;
	const frontmatterText = collapseFlowArrays(rawFrontmatterText);

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

			// The value may also sit on the line below the key — which is how every
			// project's `technologies` and `tags` are written. Only an unquoted
			// bracket or a quoted scalar is accepted, so the next `key: value` pair
			// can never be swallowed.
			if (value === "") {
				const next = (lines[i + 1] ?? "").trim();
				if (/^(\[|"|')/.test(next)) {
					value = next;
					i++;
				}
			}

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

// Import all MDX files from the projects directory
async function importProjectFiles(): Promise<Record<string, string>> {
	try {
		// Import all .mdx files from the projects directory
		// The path should be relative to the current file (lib/local-projects.ts)
		// which needs to go up one level to src, then into projects
		const modules = import.meta.glob("../projects/*.mdx", {
			import: "default",
			query: "?raw",
			eager: true,
		});

		const projectFiles: Record<string, string> = {};

		for (const [path, content] of Object.entries(modules)) {
			// Extract filename without extension as the project ID
			const filename = path
				.split("/")
				.pop()
				?.replace(/\.mdx?$/, "");
			if (filename && typeof content === "string") {
				projectFiles[filename] = content;
			}
		}

		return projectFiles;
	} catch (error) {
		console.error("Failed to import project files:", error);
		return {};
	}
}

// Convert MDX content to ProjectData
function mdxToProjectData(id: string, mdxContent: string): ProjectData {
	const { frontmatter, content } = parseFrontmatter(mdxContent);

	return {
		id,
		title: frontmatter.title || id,
		description: frontmatter.description || "",
		content,
		image: frontmatter.image || "/projects/default.jpg",
		imageAlt: frontmatter.imageAlt || undefined,
		cardImage: frontmatter.cardImage || undefined,
		demoUrl: frontmatter.demoUrl,
		githubUrl: frontmatter.githubUrl,
		technologies: frontmatter.technologies || [],
		status: frontmatter.status || "planned",
		featured: frontmatter.featured || false,
		startDate: frontmatter.startDate || new Date().toISOString().split("T")[0],
		endDate: frontmatter.endDate,
		category: frontmatter.category || "Other",
		tags: frontmatter.tags || [],
	};
}

// Load all local projects
export async function loadLocalProjects(): Promise<ProjectData[]> {
	try {
		console.log("📁 Loading projects from local files...");

		const projectFiles = await importProjectFiles();
		const projects: ProjectData[] = [];

		for (const [id, content] of Object.entries(projectFiles)) {
			try {
				const project = mdxToProjectData(id, content);
				projects.push(project);
			} catch (error) {
				console.warn(`⚠️ Failed to parse project ${id}:`, error);
			}
		}

		console.log(`📚 Loaded ${projects.length} projects from local files`);
		return projects;
	} catch (error) {
		console.error("❌ Failed to load local projects:", error);
		return [];
	}
}

// Load a specific project by ID
export async function loadLocalProjectById(
	id: string,
): Promise<ProjectData | null> {
	try {
		const projectFiles = await importProjectFiles();
		const content = projectFiles[id];

		if (!content) {
			console.warn(`⚠️ Project file not found: ${id}`);
			return null;
		}

		const project = mdxToProjectData(id, content);
		console.log(`✅ Loaded local project: ${project.title}`);
		return project;
	} catch (error) {
		console.error(`Failed to load project ${id}:`, error);
		return null;
	}
}
