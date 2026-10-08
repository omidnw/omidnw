import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import ProfessionalProjectCard from "@/components/themes/professional/ProfessionalProjectCard";
import { loadLocalProjects } from "@/lib/local-projects";
import type { ProjectData } from "@/lib/github-api";

/**
 * Professional-theme selected projects.
 *
 * An editorial two-column portfolio grid, newest first. Content is real: the
 * three most recent entries in client/src/projects, no placeholder names, no
 * invented URLs and no generated screenshots.
 *
 * The card itself lives in `ProfessionalProjectCard`, shared with the work
 * index page.
 */

const MAX_PROJECTS = 3;

const byNewestFirst = (a: ProjectData, b: ProjectData) =>
	b.startDate.localeCompare(a.startDate);

export default function ProfessionalProjects() {
	const [projects, setProjects] = useState<ProjectData[] | null>(null);

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

	const recent = (projects ?? []).slice(0, MAX_PROJECTS);

	return (
		<section className="pf-section" aria-labelledby="projects-heading">
			{/* Heading row */}
			<div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-10">
				<div>
					<p className="pf-label">Featured Work</p>
					<h2 id="projects-heading" className="pf-heading">
						Selected Projects
					</h2>
				</div>

				<Link
					href="/projects"
					className="pf-focus group -mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:text-primary/80 hover:underline"
				>
					View All Projects
					<ArrowRight
						className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</Link>
			</div>

			{/* Cards */}
			{projects === null ? (
				<ul className="grid gap-6 sm:grid-cols-2">
					{[0, 1].map((i) => (
						<li
							key={i}
							className="h-[26rem] animate-pulse rounded-xl border border-border bg-card/40"
						/>
					))}
				</ul>
			) : recent.length === 0 ? (
				<p className="rounded-xl border border-border bg-card/40 px-5 py-8 text-center text-sm text-muted-foreground">
					No projects published yet.
				</p>
			) : (
				<ul className="grid gap-6 sm:grid-cols-2 sm:gap-7">
					{recent.map((project, index) => (
						<li key={project.id}>
							<ProfessionalProjectCard
								project={project}
								priority={index === 0}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}