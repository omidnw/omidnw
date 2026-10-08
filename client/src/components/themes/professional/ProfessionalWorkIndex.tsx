import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ProfessionalPageHeader from "@/components/themes/professional/ProfessionalPageHeader";
import ProfessionalProjectCard from "@/components/themes/professional/ProfessionalProjectCard";
import { loadLocalProjects } from "@/lib/local-projects";
import type { ProjectData } from "@/lib/github-api";

/**
 * Professional-theme work index (`/projects`).
 *
 * The full project list with the two filters that are actually useful here —
 * a text query and a status filter — plus a derived technology filter bar.
 * Filtering is client-side over the same local MDX the landing page reads, so
 * the two pages can never disagree about what exists.
 *
 * Search matches title, description and technology, which is what a visitor
 * actually types when they arrive looking for something specific.
 */

const STATUS_LABELS: Record<string, string> = {
	completed: "Completed",
	"in-progress": "In Progress",
	planned: "Planned",
};

/** Frontmatter writes "In progress"; the filter key normalises the space. */
const statusKey = (status: string) => status.toLowerCase().replace(/\s+/g, "-");

const byNewestFirst = (a: ProjectData, b: ProjectData) =>
	b.startDate.localeCompare(a.startDate);

export default function ProfessionalWorkIndex() {
	const [projects, setProjects] = useState<ProjectData[] | null>(null);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		loadLocalProjects()
			.then((all) => {
				if (active) setProjects([...all].sort(byNewestFirst));
			})
			.catch(() => {
				if (active) setProjects([]);
			});
		return () => {
			active = false;
		};
	}, []);

	const all = projects ?? [];

	/** Only statuses actually present, so the bar never offers an empty filter. */
	const statuses = useMemo(() => {
		const keys = new Map<string, string>();
		for (const project of all) {
			const key = statusKey(project.status);
			keys.set(key, STATUS_LABELS[key] ?? project.status);
		}
		return [...keys.entries()];
	}, [all]);

	const technologies = useMemo(() => {
		const seen = new Set<string>();
		for (const project of all) {
			for (const tech of project.technologies) seen.add(tech);
		}
		return [...seen].sort();
	}, [all]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return all.filter((project) => {
			const matchesQuery =
				!q ||
				project.title.toLowerCase().includes(q) ||
				project.description.toLowerCase().includes(q) ||
				project.technologies.some((tech) => tech.toLowerCase().includes(q));
			const matchesStatus = !status || statusKey(project.status) === status;
			const matchesTag =
				!tagFilter ||
				project.technologies.some(
					(tech) => tech.toLowerCase() === tagFilter.toLowerCase(),
				);
			return matchesQuery && matchesStatus && matchesTag;
		});
	}, [all, query, status, tagFilter]);

	const hasFilters = Boolean(query.trim()) || Boolean(status) || Boolean(tagFilter);
	const clear = () => {
		setQuery("");
		setStatus(null);
		setTagFilter(null);
	};

	return (
		<div className="pb-[var(--pf-section-y)]">
			<ProfessionalPageHeader
				label="Work"
				title="Selected Work"
				lede="Production-minded applications built with TypeScript, React and Node — spanning desktop, web and automation."
				regionLabel="Work"
			/>

			{/* Filters */}
			<div className="pf-shell mt-10 flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2">
					<label
						htmlFor="work-search"
						className="pf-label shrink-0 pr-1 text-[0.625rem]"
					>
						Filter
					</label>

					<div className="pf-focus-within relative flex min-w-0 flex-1 items-center sm:max-w-xs">
						<Search
							className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
							aria-hidden="true"
						/>
						<input
							id="work-search"
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Title, description or technology"
							className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						/>
						{query ? (
							<button
								type="button"
								onClick={() => setQuery("")}
								aria-label="Clear search"
								className="pf-focus absolute right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							>
								<X className="h-4 w-4" aria-hidden="true" />
							</button>
						) : null}
					</div>

					<ul className="flex flex-wrap items-center gap-1.5">
						{statuses.map(([key, label]) => {
							const selected = status === key;
							return (
								<li key={key}>
									<button
										type="button"
										onClick={() => setStatus(selected ? null : key)}
										aria-pressed={selected}
										className={`pf-focus inline-flex h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors duration-200 ${
											selected
												? "border-primary/50 bg-primary/10 text-primary"
												: "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
										}`}
									>
										{label}
									</button>
								</li>
							);
						})}
					</ul>

					{hasFilters ? (
						<button
							type="button"
							onClick={clear}
							className="pf-focus inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
						>
							<X className="h-3.5 w-3.5" aria-hidden="true" />
							Clear
						</button>
					) : null}
				</div>

				{/* Result count, announced so the filter result is not silent. */}
				<p className="font-mono text-[0.6875rem] text-muted-foreground" aria-live="polite">
					{projects === null
						? "Loading projects…"
						: `${filtered.length} ${filtered.length === 1 ? "project" : "projects"}`}
					{status ? ` · ${STATUS_LABELS[status] ?? status}` : ""}
					{tagFilter ? ` · ${tagFilter}` : ""}
				</p>
			</div>

			{/* Grid */}
			<section className="pf-shell mt-8" aria-label="Projects">
				{projects === null ? (
					<ul className="grid gap-6 sm:grid-cols-2">
						{[0, 1].map((i) => (
							<li
								key={i}
								className="h-[26rem] animate-pulse rounded-xl border border-border bg-card/40"
							/>
						))}
					</ul>
				) : filtered.length === 0 ? (
					<div className="rounded-xl border border-border bg-card/40 px-6 py-14 text-center">
						<p className="text-sm font-medium text-foreground">
							No projects match those filters.
						</p>
						<button
							type="button"
							onClick={clear}
							className="pf-focus mt-3 inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline"
						>
							Clear filters
						</button>
					</div>
				) : (
					<ul className="grid gap-6 sm:grid-cols-2 sm:gap-7">
						{filtered.map((project) => (
							<li key={project.id}>
								<ProfessionalProjectCard project={project} headingLevel="h2" />
							</li>
						))}
					</ul>
				)}
			</section>

			{/* Technology index — every technology in the portfolio, and a way in: each
			    item is a filter toggle, so the list is a control rather than a
			    caption. */}
			{technologies.length > 0 ? (
				<section
					className="pf-shell mt-16 border-t border-border pt-10"
					aria-labelledby="work-tech-heading"
				>
					<div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
						<div>
							<p className="pf-label">Technologies Used</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Select a technology to filter the list.
							</p>
						</div>
						{tagFilter ? (
							<button
								type="button"
								onClick={() => setTagFilter(null)}
								className="pf-focus inline-flex min-h-11 items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
							>
								<X className="h-3.5 w-3.5" aria-hidden="true" />
								Show all
							</button>
						) : null}
					</div>

					<ul className="mt-6 flex flex-wrap gap-2">
						{technologies.map((tech) => {
							const selected = tagFilter === tech;
							return (
								<li key={tech}>
									<button
										type="button"
										onClick={() => setTagFilter(selected ? null : tech)}
										aria-pressed={selected}
										className={`pf-focus inline-flex h-11 items-center rounded-lg border px-3 font-mono text-xs transition-colors duration-200 ${
											selected
												? "border-primary/50 bg-primary/10 text-primary"
												: "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
										}`}
									>
										{tech}
									</button>
								</li>
							);
						})}
					</ul>
				</section>
			) : null}
		</div>
	);
}