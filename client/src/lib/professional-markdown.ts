import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";

/**
 * Professional-theme markdown renderer.
 *
 * The shared `markdown-processor.ts` bakes CyberPunk classes into its output
 * (`neon-glow`, `font-mono` on every paragraph, gradient rules). This is a
 * sibling that produces the same semantic HTML in the Professional voice:
 * Geist for prose, Geist Mono for technical metadata, the mint accent used only
 * for structural markers, and no neon anywhere.
 *
 * Syntax highlighting is still applied — the highlight.js token colours come
 * from the site's stylesheet, so they follow the theme tokens.
 */

export async function processProfessionalMarkdown(
	content: string,
): Promise<string> {
	try {
		const processed = await remark()
			.use(remarkGfm)
			.use(remarkHtml, { sanitize: false, allowDangerousHtml: true })
			.process(content);

		return applyProfessionalStyling(
			applySyntaxHighlighting(demoteLeadingTitle(processed.toString())),
		);
	} catch (error) {
		console.error("Error processing markdown:", error);
		return applyProfessionalStyling(applySyntaxHighlighting(content));
	}
}

/**
 * Demote a leading `h1` to `h2`.
 *
 * Every MDX body in this repository opens with an `h1` standing in for the
 * record title, and the page header has already rendered that title as the
 * document's `h1`. A second `h1` breaks the heading outline.
 *
 * Only the first element is considered. An `h1` further down a long article is a
 * deliberate section break and is left as the author wrote it.
 */
function demoteLeadingTitle(html: string): string {
	const openTag = /^\s*<h1([^>]*)>([\s\S]*?)<\/h1>/i.exec(html);
	if (!openTag) return html;
	return `<h2${openTag[1]}>${openTag[2]}</h2>` + html.slice(openTag[0].length);
}

function applySyntaxHighlighting(html: string): string {
	return html.replace(
		/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
		(match, language, code) => {
			try {
				const decoded = code
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&amp;/g, "&")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'");

				return `<pre class="pf-md-code" data-lang="${language}"><code class="hljs language-${language}">${hljs.highlight(decoded, { language, ignoreIllegals: true }).value}</code></pre>`;
			} catch {
				return `<pre class="pf-md-code" data-lang="${language}"><code class="hljs language-${language}">${code}</code></pre>`;
			}
		},
	);
}

const C = {
	h1: 'class="pf-md-h1"',
	h2: 'class="pf-md-h2"',
	h3: 'class="pf-md-h3"',
	h4: 'class="pf-md-h4"',
	p: 'class="pf-md-p"',
	ul: 'class="pf-md-ul"',
	ol: 'class="pf-md-ol"',
	li: 'class="pf-md-li"',
	a: 'class="pf-md-a"',
	code: 'class="pf-md-code-inline"',
	strong: 'class="pf-md-strong"',
	em: 'class="pf-md-em"',
	blockquote: 'class="pf-md-quote"',
	hr: 'class="pf-md-hr"',
	th: 'class="pf-md-th"',
	td: 'class="pf-md-td"',
} as const;

function applyProfessionalStyling(html: string): string {
	return (
		html
			.replace(/<h1([^>]*)>/g, `<h1$1 ${C.h1}>`)
			.replace(/<h2([^>]*)>/g, `<h2$1 ${C.h2}>`)
			.replace(/<h3([^>]*)>/g, `<h3$1 ${C.h3}>`)
			.replace(/<h4([^>]*)>/g, `<h4$1 ${C.h4}>`)
			.replace(/<h5([^>]*)>/g, `<h5$1 ${C.h4}>`)
			.replace(/<h6([^>]*)>/g, `<h6$1 ${C.h4}>`)
			.replace(/<p>/g, `<p ${C.p}>`)
			.replace(/<ul>/g, `<ul ${C.ul}>`)
			.replace(/<ol>/g, `<ol ${C.ol}>`)
			.replace(/<li>/g, `<li ${C.li}>`)
			.replace(/<blockquote>/g, `<blockquote ${C.blockquote}>`)
			.replace(/<hr\s*\/?>/g, `<hr ${C.hr}>`)
			.replace(/<th>/g, `<th ${C.th}>`)
			.replace(/<td>/g, `<td ${C.td}>`)
			.replace(/<strong>/g, `<strong ${C.strong}>`)
			.replace(/<em>/g, `<em ${C.em}>`)
			// Inline code only: the fenced-block <code> already carries `hljs`.
			.replace(
				/<code(?![^>]*class="[^"]*hljs)([^>]*)>/g,
				`<code$1 ${C.code}>`,
			)
			// Links keep their own attributes; the class is appended last so it
			// wins over anything remark emitted.
			.replace(
				/<a href="([^"]*)"([^>]*)>/g,
				`<a href="$1"$2 ${C.a}>`,
			)
			// Tables get a scroll container so a wide table cannot push the page
			// sideways on a phone.
			.replace(
				/<table>/g,
				'<div class="pf-md-table-wrap"><table>',
			)
			.replace(/<\/table>/g, "</table></div>")
			.replace(
				/<img([^>]*)>/g,
				'<img$1 class="pf-md-img" loading="lazy" decoding="async">',
			)
	);
}