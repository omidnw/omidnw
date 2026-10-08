import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import ProfessionalArticle, {
	categoryLabel,
	type MetaItem,
} from "@/components/themes/professional/ProfessionalArticle";
import { formatDate } from "@/lib/dates";
import { loadLocalProjectById } from "@/lib/local-projects";
import type { ProjectData } from "@/lib/github-api";

/**
 * Professional-theme project detail (`/projects/:slug`).
 *
 * `ProfessionalArticle` owns the layout; this supplies the metadata row and the
 * outbound actions, which are the two parts that differ per record type.
 *
 * The project is read here for its metadata and actions, and again inside the
 * article shell for the body. Both reads come from the same eagerly-bundled
 * local MDX, so they always describe the same record.
 */

export default function ProfessionalProjectDetail() {
	const { slug = "" } = useParams<{ slug: string }>();
	const [project, setProject] = useState<ProjectData | null>(null);

	useEffect(() => {
		let active = true;
		setProject(null);
		loadLocalProjectById(slug).then((found) => {
			if (active) setProject(found);
		});
		return () => {
			active = false;
		};
	}, [slug]);

	const meta: MetaItem[] | undefined = project
		? [
				{ label: "Category", value: categoryLabel(project.category) },
				{ label: "Status", value: project.status },
				{ label: "Started", value: formatDate(project.startDate) },
				{
					label: "Links",
					// Every combination is named explicitly. A site with no public
					// repository must never be described as having one.
					value: project.demoUrl && project.githubUrl
						? "Live demo & source"
						: project.demoUrl
							? "Live site"
							: project.githubUrl
								? "Source only"
								: "Not published",
				},
			]
		: undefined;

	const actions = project ? (
		<>
			{project.demoUrl ? (
				<a
					href={project.demoUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="pf-focus inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
				>
					{/* A closed-source project with a live site is not a demo — say so
					    rather than implying a public codebase sits behind it. */}
					{project.githubUrl ? "Live Demo" : "Visit Site"}
					<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
				</a>
			) : null}
			{project.githubUrl ? (
				<a
					href={project.githubUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="pf-focus inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
				>
					<SiGithub className="h-4 w-4" aria-hidden="true" />
					Source
				</a>
			) : null}
		</>
	) : undefined;

	return (
		<ProfessionalArticle source="project" meta={meta} actions={actions} />
	);
}