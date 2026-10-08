import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

/**
 * Professional-theme journey band.
 *
 * A structured career timeline: the date range holds its own column on the left
 * and the entry fills the rest, joined by a hairline rail with a mint marker per
 * role. Below `md` it collapses to a single column with the date above the role,
 * which is the only order that reads on a narrow screen.
 *
 * Every entry below is transcribed from the real `timeline` array in
 * client/src/pages/About.tsx — same roles, employers, dates and descriptions.
 * Nothing is fabricated. Geographic suffixes present in the source (Dubai,
 * Tehran, Doha) are dropped here because the landing page carries no location
 * information; the full entries remain on the About page.
 */

interface Entry {
	period: string;
	role: string;
	employer: string;
	summary: string;
	kind: "work" | "education" | "milestone";
}

/** Employer names with the trailing location stripped. */
const employerOf = (company: string) =>
	company
		.split(",")
		.map((part) => part.trim())
		.filter((part) => part && !/dubai|tehran|doha|\buae\b|\bir\b|\bqa\b/i.test(part))
		.join(", ");

const ENTRIES: Entry[] = [
	{
		period: "Present",
		role: "Automation Test Engineer",
		employer: "NotionWave Inc.",
		summary:
			"Software QA with a full-stack developer mindset, building automation code that tests different parts of a project more effectively.",
		kind: "work",
	},
	{
		period: "2025",
		role: "Software QA",
		employer: "Troweb Inc.",
		summary:
			"Ensuring the quality and reliability of software products.",
		kind: "work",
	},
	{
		period: "2023",
		role: "BS in Computer Programming",
		employer: "Shamsipour Technical and Vocational College",
		summary: "Completed Bachelor of Science in Computer Programming.",
		kind: "education",
	},
	{
		period: "2022",
		role: "Software QA",
		employer: "Troweb Inc.",
		summary: "Joined Troweb Inc. as a Software QA.",
		kind: "work",
	},
	{
		period: "2021",
		role: "Full Stack Developer (Freelancer)",
		employer: "Qatar German Pipe Company (QGPC)",
		summary: "Developed web solutions for QGPC on a freelance basis.",
		kind: "work",
	},
	{
		period: "2019 – 2021",
		role: "Software Engineer",
		employer: "Veresk Rail Cars",
		summary:
			"Worked as a Software Engineer, focusing on system maintenance. (Mar 2019 – Mar 2021)",
		kind: "work",
	},
];

/** Guard: the stripper must never empty an employer field. */
const cleanEmployer = (company: string) => employerOf(company) || company;

export default function ProfessionalJourney() {
	return (
		<section className="pf-section" aria-labelledby="journey-heading">
			<div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-12">
				<div>
					<p className="pf-label">Experience</p>
					<h2 id="journey-heading" className="pf-heading">
						Professional Journey
					</h2>
					<p className="pf-lede">
						A career across software development, quality engineering,
						automation, and modern engineering practices.
					</p>
				</div>

				<Link
					href="/about#experience"
					className="pf-focus group -mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:text-primary/80 hover:underline"
				>
					View Full Experience
					<ArrowRight
						className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</Link>
			</div>

			<ol className="relative">
				{ENTRIES.map((entry, index) => (
					<li
						key={`${entry.period}-${entry.role}`}
						className="pf-journey-entry relative grid gap-x-[var(--pf-journey-gap)] gap-y-1 pb-8 last:pb-0 md:grid-cols-[var(--pf-journey-date)_minmax(0,1fr)] md:pb-9"
					>
						{/* Rail. Starts at the first marker and stops at the last, so it
						    never dangles past the final entry. */}
						{index < ENTRIES.length - 1 ? (
							<span aria-hidden="true" className="pf-journey-rail" />
						) : null}

						<span
							aria-hidden="true"
							className={`pf-journey-marker ${
								entry.kind === "education" ? "bg-muted-foreground" : "bg-primary"
							}`}
						/>

						{/* Date column. Mono and right-aligned on wide screens so the
						    ranges form a scannable edge; left-aligned below `md`. */}
						<p className="pf-journey-date font-mono text-xs tracking-wide text-primary">
							{entry.period}
						</p>

						<div className="pf-journey-body">
							<h3 className="font-heading text-base font-semibold leading-snug text-foreground">
								{entry.role}
							</h3>
							<p className="mt-0.5 text-sm text-muted-foreground">
								{cleanEmployer(entry.employer)}
							</p>
							<p className="mt-1.5 max-w-[var(--pf-measure)] text-sm leading-relaxed text-muted-foreground">
								{entry.summary}
							</p>
						</div>
					</li>
				))}
			</ol>
		</section>
	);
}