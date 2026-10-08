import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Clock } from "lucide-react";
import ProfessionalPageHeader from "@/components/themes/professional/ProfessionalPageHeader";
import { formatDate } from "@/lib/dates";
import { loadBlogPosts } from "@/lib/blogs";
import type { BlogPostData } from "@/lib/github-api";

/**
 * Professional-theme blog index (`/blog`).
 *
 * A plain editorial list: date and read time in mono, title, excerpt, tags. No
 * filter chrome — the archive is small, and adding controls that filter three
 * entries would be decoration rather than function.
 *
 * Reads published MDX from GitHub, with the configured local fallback.
 */

const byNewestFirst = (a: BlogPostData, b: BlogPostData) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

export default function ProfessionalBlogIndex() {
	const [posts, setPosts] = useState<BlogPostData[] | null>(null);
	const [failed, setFailed] = useState(false);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let active = true;
		setPosts(null);
		setFailed(false);
		loadBlogPosts()
			.then((all) => {
				if (active) setPosts([...all].sort(byNewestFirst));
			})
			.catch(() => {
				if (active) {
					setFailed(true);
					setPosts([]);
				}
			});
		return () => {
			active = false;
		};
	}, [attempt]);

	const all = posts ?? [];
	const totalReadTime = useMemo(
		() =>
			all.reduce((sum, post) => sum + (Number.parseInt(post.readTime, 10) || 0), 0),
		[all],
	);

	return (
		<div className="pf-inner-page pb-[var(--pf-section-y)]">
			<ProfessionalPageHeader
				label="Writing"
				title="Notes & Insights"
				lede="Writing on quality engineering, test automation, full-stack development and AI-assisted workflows."
				regionLabel="Blog"
			/>

			{failed ? (
				<div className="pf-shell mt-10" role="alert">
					<p className="text-sm text-muted-foreground">
						Articles could not be loaded. Please try again.
					</p>
					<button
						type="button"
						onClick={() => setAttempt((value) => value + 1)}
						className="pf-focus mt-3 inline-flex min-h-11 items-center text-sm text-primary"
					>
						Try again
					</button>
				</div>
			) : posts === null ? (
				<ul className="pf-shell pf-blog-grid mt-10">
					{[0, 1, 2].map((i) => (
						<li
							key={i}
							className="h-40 animate-pulse rounded-xl border border-border bg-card/40"
						/>
					))}
				</ul>
			) : all.length === 0 ? (
				<p className="pf-shell mt-10 rounded-xl border border-border bg-card/40 px-6 py-14 text-center text-sm text-muted-foreground">
					No articles published yet.
				</p>
			) : (
				<>
					<ul className="pf-shell pf-blog-grid mt-10">
						{all.map((post) => (
							<li key={post.id}>
								<article>
									<Link
										href={`/blog/${post.id}`}
										className="pf-blog-card pf-focus group block rounded-xl border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-(--pf-shadow-card-hover) focus-visible:border-primary/50 sm:p-7"
									>
										<div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] text-muted-foreground">
											<time dateTime={post.date}>{formatDate(post.date)}</time>
											<span aria-hidden="true">·</span>
											<span className="inline-flex items-center gap-1">
												<Clock className="h-3 w-3" aria-hidden="true" />
												{post.readTime}
											</span>
											{post.tags?.length ? (
												<>
													<span aria-hidden="true">·</span>
													<ul className="pf-tags pf-tag-chips">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
												</>
											) : null}
										</div>

										<h2 className="mt-3 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
											{post.title}
										</h2>

										{post.excerpt ? (
											<p className="mt-2 max-w-[var(--pf-measure)] text-sm leading-relaxed text-muted-foreground">
												{post.excerpt}
											</p>
										) : null}

										<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
											Read Article
											<ArrowUpRight
												className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
												aria-hidden="true"
											/>
										</span>
									</Link>
								</article>
							</li>
						))}
					</ul>

					<p className="pf-shell mt-10 font-mono text-[0.6875rem] text-muted-foreground">
						{all.length} {all.length === 1 ? "article" : "articles"}
						{totalReadTime > 0 ? ` · ${totalReadTime} min total` : ""}
					</p>
				</>
			)}
		</div>
	);
}