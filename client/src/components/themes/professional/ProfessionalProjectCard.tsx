import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { ArrowUpRight, Globe, Monitor } from "lucide-react";
import { pictureSource } from "@/lib/images";
import type { ProjectData } from "@/lib/github-api";

/**
 * The Professional project card.
 *
 * Extracted from the landing page's "Selected Projects" section so both pages
 * render the same card. A single link wraps the whole card, which keeps one
 * target per project instead of splitting it between the image, the title and a
 * separate "View Project" action.
 *
 * `headingLevel` lets the caller keep the document outline correct: `h3` inside
 * the landing page's "Selected Projects" section, `h2` on the work index where
 * the card is the primary unit and the section already owns an `h1`.
 */

const CATEGORY_LABELS: Record<string, string> = {
	"Desktop Application": "Desktop App",
	"Web Application": "Web Platform",
};

const categoryIcon = (category: string) =>
	category === "Desktop Application" ? Monitor : Globe;

const TECH_COUNT = 5;

interface ProfessionalProjectCardProps {
	project: ProjectData;
	headingLevel?: "h2" | "h3";
	/** Eager on the landing page's first card, lazy everywhere else. */
	priority?: boolean;
	/** Compact preview used only on the landing page. */
	compact?: boolean;
}

export default function ProfessionalProjectCard({
	project,
	headingLevel: Heading = "h3",
	priority = false,
	compact = false,
}: ProfessionalProjectCardProps) {
	const Icon = categoryIcon(project.category);
	// The compact slot is a narrow portrait; a wide screenshot centre-cuts into
	// clipped text there, so a project can supply a purpose-cropped card image.
	const image = pictureSource(
		compact && project.cardImage ? project.cardImage : project.image,
	);
	const sizes = compact
		? "(min-width: 768px) 10rem, 7rem"
		: "(min-width: 640px) 34rem, 92vw";

	return (
		<article className="h-full">
			<Link
				href={`/projects/${project.id}`}
				className={cn(
					compact && "pf-project-compact",
					"pf-focus group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-(--pf-shadow-card-hover) focus-visible:border-primary/50",
				)}
			>
				<div className="pf-project-image relative overflow-hidden border-b border-border bg-muted">
					<picture>
						<source
							type="image/webp"
							srcSet={image.srcSet}
							sizes={sizes}
						/>
						<img
							{...image}
							sizes={sizes}
							alt={project.imageAlt ?? `${project.title} interface`}
							loading={priority ? "eager" : "lazy"}
							decoding={priority ? "sync" : "async"}
							fetchPriority={priority ? "high" : "auto"}
							className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.035]"
						/>
					</picture>
				</div>

				<div className="pf-project-copy flex flex-1 flex-col p-5 sm:p-6">
					<p className="pf-project-category flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
						<Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
						<span className="truncate">
							{CATEGORY_LABELS[project.category] ?? project.category}
						</span>
					</p>

					<Heading className="pf-project-title mt-2 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground">
						{project.title}
					</Heading>

					<p className="pf-project-description mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
						{project.description}
					</p>

					{/* The tags carry the guaranteed gap above; the action's `mt-auto`
					    absorbs whatever slack is left, so the rule and the action sit
					    on the same baseline across a row of unequal cards. */}
					<ul className={cn("pf-tags mb-5 mt-4", compact && "pf-tags-boxed")}>
						{project.technologies
							.slice(0, compact ? 4 : TECH_COUNT)
							.map((tech) => (
								<li key={tech}>{tech}</li>
							))}
					</ul>

					<span className="pf-project-action mt-auto inline-flex items-center gap-1.5 self-stretch border-t border-border pt-4 text-sm font-medium text-primary">
						View Project
						<ArrowUpRight
							className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</span>
				</div>
			</Link>
		</article>
	);
}