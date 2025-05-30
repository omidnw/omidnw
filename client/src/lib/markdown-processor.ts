import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";

// Cyberpunk-themed markdown processor
export async function processMarkdown(content: string): Promise<string> {
	try {
		const processedContent = await remark()
			.use(remarkGfm) // GitHub Flavored Markdown support
			.use(remarkHtml, {
				sanitize: false,
				allowDangerousHtml: true,
			}) // Convert to HTML
			.process(content);

		let html = processedContent.toString();

		// Apply syntax highlighting to code blocks
		html = applySyntaxHighlighting(html);

		// Apply cyberpunk theme classes (only for non-code elements)
		html = applyCyberpunkStyling(html);

		return html;
	} catch (error) {
		console.error("Error processing markdown:", error);
		// Fallback to simple processing
		return processMarkdownFallback(content);
	}
}

// Apply syntax highlighting to code blocks
function applySyntaxHighlighting(html: string): string {
	return html.replace(
		/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
		(match, language, code) => {
			try {
				// Decode HTML entities in the code
				const decodedCode = code
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&amp;/g, "&")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'");

				// Apply syntax highlighting
				const highlighted = hljs.highlight(decodedCode, {
					language,
					ignoreIllegals: true,
				});

				return `<pre><code class="hljs language-${language}">${highlighted.value}</code></pre>`;
			} catch (error) {
				// If highlighting fails, return the original code
				return `<pre><code class="hljs language-${language}">${code}</code></pre>`;
			}
		}
	);
}

// Apply cyberpunk-themed CSS classes to HTML elements
function applyCyberpunkStyling(html: string): string {
	return (
		html
			// Headers with neon glow effects
			.replace(
				/<h1([^>]*)>/g,
				'<h1$1 class="text-3xl md:text-4xl font-heading font-black text-primary neon-glow mb-8 mt-12 first:mt-0">'
			)
			.replace(
				/<h2([^>]*)>/g,
				'<h2$1 class="text-2xl md:text-3xl font-heading font-bold text-secondary mb-6 mt-10 border-b border-primary/30 pb-3">'
			)
			.replace(
				/<h3([^>]*)>/g,
				'<h3$1 class="text-xl md:text-2xl font-heading font-bold text-accent mb-4 mt-8">'
			)
			.replace(
				/<h4([^>]*)>/g,
				'<h4$1 class="text-lg md:text-xl font-heading font-semibold text-primary mb-3 mt-6">'
			)
			.replace(
				/<h5([^>]*)>/g,
				'<h5$1 class="text-base md:text-lg font-heading font-semibold text-secondary mb-2 mt-4">'
			)
			.replace(
				/<h6([^>]*)>/g,
				'<h6$1 class="text-sm md:text-base font-heading font-semibold text-accent mb-2 mt-4">'
			)

			// Paragraphs with cyberpunk styling (but not inside code blocks)
			.replace(
				/<p>/g,
				'<p class="font-mono text-muted-foreground leading-relaxed mb-6">'
			)

			// Style pre/code blocks with cyberpunk theme
			.replace(
				/<pre><code class="hljs language-(\w+)"([^>]*)>/g,
				'<pre class="cyberpunk-code-block bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg p-0 mb-6 overflow-hidden relative group"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-60"></div><div class="absolute top-2 right-3 text-xs font-mono text-primary/60 uppercase tracking-wide">$1</div><code class="hljs language-$1 block p-6 pt-8 overflow-x-auto font-mono text-sm leading-relaxed"$2>'
			)
			.replace(
				/<pre><code class="hljs"([^>]*)>/g,
				'<pre class="cyberpunk-code-block bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg p-0 mb-6 overflow-hidden relative group"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-60"></div><code class="hljs block p-6 pt-4 overflow-x-auto font-mono text-sm leading-relaxed text-green-400"$1>'
			)

			// Inline code with neon styling (but not inside pre blocks)
			.replace(
				/<code(?![^>]*class="[^"]*hljs)([^>]*)>/g,
				'<code$1 class="bg-primary/10 border border-primary/30 text-primary px-2 py-1 rounded font-mono text-sm">'
			)

			// Lists with cyberpunk bullets
			.replace(
				/<ul>/g,
				'<ul class="font-mono text-muted-foreground mb-6 space-y-2 pl-6">'
			)
			.replace(
				/<ol>/g,
				'<ol class="font-mono text-muted-foreground mb-6 space-y-2 pl-6 list-decimal">'
			)
			.replace(
				/<li>/g,
				"<li class=\"relative pl-2 before:content-['▶'] before:text-primary before:absolute before:left-[-1rem] before:text-xs\">"
			)

			// Blockquotes with terminal-style design
			.replace(
				/<blockquote>/g,
				'<blockquote class="border-l-4 border-primary bg-primary/5 pl-6 py-4 mb-6 relative"><div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-80"></div><div class="font-mono text-muted-foreground italic">'
			)
			.replace(/<\/blockquote>/g, "</div></blockquote>")

			// Tables with cyberpunk grid styling
			.replace(
				/<table>/g,
				'<div class="overflow-x-auto mb-6"><table class="w-full border border-primary/30 rounded-lg overflow-hidden">'
			)
			.replace(/<\/table>/g, "</table></div>")
			.replace(/<thead>/g, '<thead class="bg-primary/10">')
			.replace(
				/<th>/g,
				'<th class="px-4 py-3 text-left font-heading font-bold text-primary border-b border-primary/30">'
			)
			.replace(
				/<td>/g,
				'<td class="px-4 py-3 font-mono text-muted-foreground border-b border-primary/10 last:border-b-0">'
			)
			.replace(/<tr>/g, '<tr class="hover:bg-primary/5 transition-colors">')

			// Links with cyberpunk hover effects
			.replace(
				/<a href="([^"]*)"([^>]*)>/g,
				'<a href="$1"$2 class="text-secondary hover:text-primary transition-colors underline decoration-secondary/50 hover:decoration-primary font-mono" target="_blank" rel="noopener noreferrer">'
			)

			// Strong/bold text with primary color
			.replace(/<strong>/g, '<strong class="text-primary font-bold">')

			// Emphasis/italic text with accent color
			.replace(/<em>/g, '<em class="text-accent italic">')

			// Horizontal rules with gradient
			.replace(
				/<hr>/g,
				'<hr class="border-none h-px bg-gradient-to-r from-transparent via-primary to-transparent my-8">'
			)

			// Images with cyberpunk styling - MODIFIED FOR MODAL
			.replace(/<img([^>]*)>/g, (match, attributes) => {
				const srcMatch = /src="([^"]*)"/.exec(attributes);
				const altMatch = /alt="([^"]*)"/.exec(attributes);
				const src = srcMatch ? srcMatch[1] : "";
				const alt = altMatch ? altMatch[1] : "";

				if (!src) return match; // If no src, return original image tag

				return `<div class="image-modal-trigger cursor-pointer group relative mb-6 inline-block" data-src="${src}" data-alt="${
					alt || ""
				}" role="button" tabindex="0" aria-label="View image: ${
					alt || "Image"
				}">
									<div class="relative">
										<img src="${src}" alt="${
					alt || ""
				}" class="cyberpunk-image-thumbnail rounded-md border border-primary/20 group-hover:border-primary/50 transition-all duration-300 max-w-md group-hover:shadow-lg group-hover:shadow-primary/20 block" loading="lazy">
										<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
											<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-white lucide lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="17.65" y1="21" y2="17.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
										</div>
									</div>
								</div>`;
			})
	);
}

// Fallback markdown processor for when remark fails
function processMarkdownFallback(content: string): string {
	// First, protect code blocks from being processed
	const codeBlocks: string[] = [];
	let protectedContent = content;

	// Extract and protect code blocks
	protectedContent = protectedContent.replace(
		/```(\w+)?\n([\s\S]*?)\n```/g,
		(match, lang, code) => {
			const index = codeBlocks.length;
			const langDisplay = lang || "";
			codeBlocks.push(
				`<pre class="cyberpunk-code-block bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg p-0 mb-6 overflow-hidden relative group"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-60"></div>${
					langDisplay
						? `<div class="absolute top-2 right-3 text-xs font-mono text-primary/60 uppercase tracking-wide">${langDisplay}</div>`
						: ""
				}<code class="hljs language-${langDisplay} block p-6 ${
					langDisplay ? "pt-8" : "pt-4"
				} overflow-x-auto font-mono text-sm leading-relaxed">${code.trim()}</code></pre>`
			);
			return `__CODE_BLOCK_${index}__`;
		}
	);

	// Process the rest of the content
	const processedContent = protectedContent
		// Headers
		.replace(
			/^# (.*$)/gm,
			'<h1 class="text-3xl md:text-4xl font-heading font-black text-primary neon-glow mb-8 mt-12 first:mt-0">$1</h1>'
		)
		.replace(
			/^## (.*$)/gm,
			'<h2 class="text-2xl md:text-3xl font-heading font-bold text-secondary mb-6 mt-10 border-b border-primary/30 pb-3">$1</h2>'
		)
		.replace(
			/^### (.*$)/gm,
			'<h3 class="text-xl md:text-2xl font-heading font-bold text-accent mb-4 mt-8">$1</h3>'
		)
		.replace(
			/^#### (.*$)/gm,
			'<h4 class="text-lg md:text-xl font-heading font-semibold text-primary mb-3 mt-6">$1</h4>'
		)

		// Inline code (protect from being processed as paragraphs)
		.replace(
			/`([^`]+)`/g,
			'<code class="bg-primary/10 border border-primary/30 text-primary px-2 py-1 rounded font-mono text-sm">$1</code>'
		)

		// Bold and italic
		.replace(
			/\*\*(.*?)\*\*/g,
			'<strong class="text-primary font-bold">$1</strong>'
		)
		.replace(/\*(.*?)\*/g, '<em class="text-accent italic">$1</em>')

		// Lists
		.replace(
			/^- (.*$)/gm,
			"<li class=\"relative pl-2 before:content-['▶'] before:text-primary before:absolute before:left-[-1rem] before:text-xs font-mono text-muted-foreground\">$1</li>"
		)

		// Links
		.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" class="text-secondary hover:text-primary transition-colors underline decoration-secondary/50 hover:decoration-primary font-mono" target="_blank" rel="noopener noreferrer">$1</a>'
		)

		// Images - ADDED FOR MODAL
		.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
			return `<div class="image-modal-trigger cursor-pointer group relative mb-6 inline-block" data-src="${src}" data-alt="${
				alt || ""
			}" role="button" tabindex="0" aria-label="View image: ${alt || "Image"}">
								<div class="relative">
									<img src="${src}" alt="${
				alt || ""
			}" class="cyberpunk-image-thumbnail rounded-md border border-primary/20 group-hover:border-primary/50 transition-all duration-300 max-w-md group-hover:shadow-lg group-hover:shadow-primary/20 block" loading="lazy">
									<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-white lucide lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="17.65" y1="21" y2="17.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
									</div>
								</div>
							</div>`;
		})

		// Paragraphs (convert double line breaks to paragraph breaks)
		.replace(/\n\n+/g, "\n\n__PARAGRAPH_BREAK__\n\n")
		.split("\n\n__PARAGRAPH_BREAK__\n\n")
		.map((paragraph) => {
			paragraph = paragraph.trim();
			if (!paragraph) return "";

			// Don't wrap headers, lists, or code blocks in paragraph tags
			if (
				paragraph.startsWith("<h") ||
				paragraph.startsWith("<li") ||
				paragraph.startsWith("__CODE_BLOCK_") ||
				paragraph.includes("<pre") ||
				paragraph.includes("<ul") ||
				paragraph.includes("<ol")
			) {
				return paragraph;
			}

			return `<p class="font-mono text-muted-foreground leading-relaxed mb-6">${paragraph}</p>`;
		})
		.join("\n\n");

	// Wrap consecutive list items
	const withLists = processedContent.replace(
		/(<li[^>]*>.*?<\/li>\s*)+/g,
		'<ul class="font-mono text-muted-foreground mb-6 space-y-2 pl-6">$&</ul>'
	);

	// Restore code blocks
	return codeBlocks.reduce(
		(content, codeBlock, index) =>
			content.replace(`__CODE_BLOCK_${index}__`, codeBlock),
		withLists
	);
}

// Enhanced markdown processor with cyberpunk animations
export function addCyberpunkAnimations(html: string): string {
	// Add data attributes for potential animations
	return html
		.replace(/<h([1-6])([^>]*)>/g, '<h$1$2 data-animate="fade-in-up">')
		.replace(/<pre([^>]*)>/g, '<pre$1 data-animate="fade-in" data-delay="100">')
		.replace(
			/<blockquote([^>]*)>/g,
			'<blockquote$1 data-animate="slide-in-left">'
		);
}
