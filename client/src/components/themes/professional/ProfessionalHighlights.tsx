import { Layers, Code2, Activity, Sparkles } from "lucide-react";

/**
 * Professional-theme highlights band.
 *
 * A capability summary, not a metrics dashboard: four items divided by short
 * hairline rules on wide screens, stacked as a 2×2 grid below them. Every icon
 * sits in the same tile so the row reads as one set.
 *
 * Below `lg` each cell is centred — in a narrow two-column grid, left-aligned
 * text reads as ragged against both the gutter and the neighbouring cell. From
 * `lg` the band becomes a single row of four, where left alignment is what makes
 * the headings scannable.
 *
 * Copy follows the landing-page spec. The only figure here is the 5+ years
 * figure, which matches the earliest dated role in About.tsx (2019) — the
 * design's own "10+ Projects" variant was not adopted because the repository
 * holds three projects and stating otherwise would be inaccurate.
 */

interface Highlight {
	icon: typeof Layers;
	heading: string;
	caption: string;
}

const HIGHLIGHTS: Highlight[] = [
	{
		icon: Layers,
		heading: "5+ Years",
		caption: "Software Engineering Experience",
	},
	{
		icon: Code2,
		heading: "Full-Stack Engineering",
		caption: "From Architecture to Production",
	},
	{
		icon: Activity,
		heading: "Quality Engineering",
		caption: "Automation, Reliability & Testing",
	},
	{
		icon: Sparkles,
		heading: "AI-Enhanced Development",
		caption: "Intelligent Tools & Workflows",
	},
];

export default function ProfessionalHighlights() {
	return (
		<section
			className="relative w-[100vw] left-1/2 -translate-x-1/2 border-y border-border bg-card/50"
			aria-label="Professional highlights"
		>
			<ul className="pf-shell grid grid-cols-2 gap-x-5 gap-y-7 py-6 lg:grid-cols-4 lg:gap-x-8 lg:py-7">
				{HIGHLIGHTS.map((item, index) => {
					const Icon = item.icon;
					return (
						<li
							key={item.heading}
							className="relative flex flex-col items-center gap-2.5 text-center lg:flex-row lg:items-center lg:gap-4 lg:text-left"
						>
							{/* Hairline between columns on wide screens only, where the row
							    reads as a single band. Below that the grid gap is enough. */}
							{index > 0 ? (
								<span
									aria-hidden="true"
									className="absolute -left-2.5 top-1/2 hidden h-9 w-px -translate-y-1/2 bg-border lg:block"
								/>
							) : null}

							<span
								className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"
								aria-hidden="true"
							>
								<Icon className="h-5 w-5" strokeWidth={1.75} />
							</span>

							<div className="min-w-0">
								<h2 className="font-heading text-[0.9375rem] font-semibold leading-snug text-foreground">
									{item.heading}
								</h2>
								<p className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground">
									{item.caption}
								</p>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}