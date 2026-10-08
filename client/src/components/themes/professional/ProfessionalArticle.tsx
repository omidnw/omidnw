import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowUpRight } from "lucide-react";
import ProfessionalPageHeader from "@/components/themes/professional/ProfessionalPageHeader";
import { pictureSource } from "@/lib/images";
import { processProfessionalMarkdown } from "@/lib/professional-markdown";
import { loadLocalProjectById } from "@/lib/local-projects";
import { loadBlogPostById } from "@/lib/blogs";

/**
 * Shared article shell for the Professional theme.
 *
 * Both detail routes — `/projects/:slug` and `/blog/:slug` — render the same
 * shape: a page header carrying its actions, a metadata row, the cover image
 * where one exists, and the rendered body. Only the data source differs, so the
 * two pages cannot drift apart.
 *
 * The caller owns the metadata row and the actions, because those come from
 * different record types; everything structural lives here.
 */

export interface MetaItem {
	label: string;
	value: string;
}

/** Short platform labels, matching the cards on the work index. */
const CATEGORY_LABELS: Record<string, string> = {
	"Desktop Application": "Desktop App",
	"Web Application": "Web Platform",
};

export const categoryLabel = (category: string) =>
	CATEGORY_LABELS[category] ?? category;

interface LoadedRecord {
	title: string;
	image: string | null;
	/** Overrides the generated alt when the image is not a UI screenshot. */
	imageAlt?: string;
}

interface ProfessionalArticleProps {
	/** Which local loader to read from. */
	source: "project" | "post";
	/** Computed by the caller from the loaded record. */
	meta?: MetaItem[];
	/** Outbound actions, computed by the caller. */
	actions?: React.ReactNode;
}

export default function ProfessionalArticle({
	source,
	meta,
	actions,
}: ProfessionalArticleProps) {
	const { slug = "" } = useParams<{ slug: string }>();

	const [attempt, setAttempt] = useState(0);
	const [record, setRecord] = useState<LoadedRecord | null>(null);
	const [body, setBody] = useState("");
	const [contents, setContents] = useState<{ id: string; title: string }[]>([]);
	const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
		"loading",
	);

	// Reset on every route change so the previous article's title is never shown
	// under the new URL while the new body renders.
	useEffect(() => {
		let active = true;
		setStatus("loading");
		setRecord(null);
		setBody("");
		setContents([]);

		(async () => {
			const loaded =
				source === "project"
					? await loadLocalProjectById(slug)
					: await loadBlogPostById(slug);

			if (!active) return;
			if (!loaded) {
				setStatus("missing");
				return;
			}

			const html = await processProfessionalMarkdown(loaded.content ?? "");
			if (!active) return;

			setRecord({
				title: loaded.title,
				image: "image" in loaded ? (loaded.image ?? null) : null,
				imageAlt:
					"imageAlt" in loaded && typeof loaded.imageAlt === "string"
						? loaded.imageAlt
						: undefined,
			});
			const document = new DOMParser().parseFromString(html, "text/html");
			const sections = Array.from(document.querySelectorAll("h2")).map((heading, index) => {
				const id = `article-section-${index + 1}`;
				heading.id = id;
				return { id, title: heading.textContent ?? "" };
			});
			setContents(sections);
			setBody(document.body.innerHTML);
			setStatus("ready");
		})().catch(() => {
			if (active) setStatus("error");
		});

		return () => {
			active = false;
		};
	}, [slug, source, attempt]);

	const backTo = source === "project" ? "/projects" : "/blog";
	const backLabel = source === "project" ? "All Projects" : "All Articles";
	const notFoundLabel = source === "project" ? "Project" : "Article";

	const picture = record?.image ? pictureSource(record.image) : null;

	return (
		<div className="pf-inner-page pb-[var(--pf-section-y)]">
			{status === "loading" ? (
				<div
					className="pf-shell pt-[calc(var(--pf-section-y)*0.62)]"
					aria-busy="true"
					aria-label="Loading"
				>
					<div className="h-3 w-32 animate-pulse rounded bg-card" />
					<div className="mt-5 h-10 w-3/4 animate-pulse rounded bg-card" />
					<div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-card" />
				</div>
			) : status === "error" ? (
				<div className="pf-shell pt-[calc(var(--pf-section-y)*0.62)]" role="alert">
					<p className="text-sm text-muted-foreground">This {notFoundLabel.toLowerCase()} could not be loaded. Please try again.</p>
					<button type="button" onClick={() => setAttempt((value) => value + 1)} className="pf-focus mt-3 inline-flex min-h-11 items-center text-sm text-primary">Try again</button>
				</div>
			) : status === "missing" || !record ? (
				<div className="pf-shell pt-[calc(var(--pf-section-y)*0.62)]">
					<ProfessionalPageHeader
						label={notFoundLabel}
						title="Not Found"
						lede="That record is not in this repository. It may have been renamed or removed."
						regionLabel="Not found"
					/>
					<Link
						href={backTo}
						className="pf-focus inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
					>
						{backLabel}
					</Link>
				</div>
			) : (
				<article>
					<ProfessionalPageHeader
						label={source === "project" ? "Project" : "Article"}
						title={record.title}
						regionLabel={record.title}
						backTo={backTo}
						backLabel={backLabel}
						actions={actions}
					/>

					{meta && meta.length > 0 ? (
						<dl className="pf-shell pf-article-meta mt-8 flex flex-wrap gap-x-10 gap-y-4">
							{meta.map((item) => (
								<div key={item.label}>
									<dt className="pf-label text-[0.625rem]">{item.label}</dt>
									<dd className="mt-1.5 font-mono text-sm text-foreground">
										{item.value}
									</dd>
								</div>
							))}
						</dl>
					) : null}

					{picture ? (
						<div className="pf-shell mt-8">
							<div className="pf-article-cover overflow-hidden rounded-xl border border-border bg-muted">
								<picture>
									<source
										type="image/webp"
										srcSet={picture.srcSet}
										sizes="(min-width: 640px) 62rem, 92vw"
									/>
									<img
										{...picture}
										sizes="(min-width: 640px) 62rem, 92vw"
										alt={record.imageAlt ?? `${record.title} interface`}
										decoding="async"
										className="aspect-[16/9] w-full object-cover object-top"
									/>
								</picture>
							</div>
						</div>
					) : null}

					<div className="pf-shell pf-article-layout mt-12">
						{/* Body is this repository's own MDX — the same source the
						    CyberPunk detail pages already render. */}
						<div
							className="pf-prose pf-article-body"
							dangerouslySetInnerHTML={{ __html: body }}
						/>
						{contents.length > 1 ? (
							<aside className="pf-article-contents">
								<nav aria-labelledby="article-contents-heading">
									<h2 id="article-contents-heading" className="pf-label">On this page</h2>
									<ol>{contents.map((section) => (
										<li key={section.id}><a href={`#${section.id}`} className="pf-focus">{section.title}</a></li>
									))}</ol>
								</nav>
							</aside>
						) : null}
					</div>

					<footer className="pf-shell mt-14 border-t border-border pt-8">
						<Link
							href={backTo}
							className="pf-focus group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
						>
							{backLabel}
							<ArrowUpRight
								className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</Link>
					</footer>
				</article>
			)}
		</div>
	);
}