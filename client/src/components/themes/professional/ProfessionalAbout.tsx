import { Link } from "wouter";
import { ArrowRight, Layers, Activity, Network, Sparkles } from "lucide-react";
import { pictureSource } from "@/lib/images";

/**
 * Professional-theme about band.
 *
 * No portrait exists in the repository, so the visual side is a restrained
 * monogram composition built from the approved ORK logo rather than a
 * fabricated photograph — and the logo is deliberately kept small, because this
 * section introduces a person rather than advertising a mark.
 *
 * The expertise list sits under that panel rather than under the prose: it
 * balances the two columns instead of leaving the visual side orphaned in empty
 * space.
 */

const LOGO = pictureSource("/images/ork-logo.png");

const EXPERTISE = [
	{ icon: Layers, label: "Software Engineering", note: "Problem Solver" },
	{ icon: Activity, label: "Quality & Automation", note: "Quality Driven" },
	{ icon: Network, label: "System Architecture", note: "End-to-End" },
	{ icon: Sparkles, label: "AI-Enhanced Workflows", note: "Future Focused" },
];

export default function ProfessionalAbout() {
	return (
		<section className="pf-section border-y border-border bg-card/40" aria-labelledby="about-heading">
			<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
				{/* Visual side — monogram composition, no fabricated portrait. */}
				<div className="order-2 lg:order-1">
					<div className="pf-panel relative overflow-hidden rounded-2xl border border-border bg-background px-7 py-9 sm:px-9 sm:py-11">
						<div className="pf-panel-grid pointer-events-none absolute inset-0" aria-hidden="true" />

						<div className="relative flex flex-col items-center gap-4 text-center">
							<picture>
								<source type="image/webp" srcSet={LOGO.srcSet} sizes="64px" />
								<img
									{...LOGO}
									sizes="64px"
									alt=""
									className="h-11 w-auto select-none"
									draggable={false}
								/>
							</picture>
							<p className="font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.26em] text-muted-foreground">
								Software Engineering
								<span className="text-primary/70"> · </span>
								Quality Engineering
							</p>
							<p className="font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground">
								Automation · AI-Assisted Workflows
							</p>
						</div>
					</div>

					<ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
						{EXPERTISE.map((item) => {
							const Icon = item.icon;
							return (
								<li key={item.label} className="flex items-center gap-3">
									<span
										className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"
										aria-hidden="true"
									>
										<Icon className="h-4 w-4" strokeWidth={1.75} />
									</span>
									<span className="min-w-0">
										<span className="block text-sm font-medium text-foreground">
											{item.label}
										</span>
										<span className="block text-[0.8125rem] text-muted-foreground">
											{item.note}
										</span>
									</span>
								</li>
							);
						})}
					</ul>
				</div>

				{/* Copy side */}
				<div className="order-1 lg:order-2">
					<p className="pf-label">About Me</p>
					<h2 id="about-heading" className="pf-heading">
						The Engineer Behind the Code
					</h2>

					<div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
						<p className="max-w-[var(--pf-measure)]">
							I&rsquo;m Omid Reza Keshtkar, a software engineer specializing in
							quality engineering, test automation, and full-stack development.
						</p>
						<p className="max-w-[var(--pf-measure)]">
							I enjoy understanding how systems work, identifying opportunities
							for improvement, and building solutions that are reliable,
							maintainable, and efficient.
						</p>
						<p className="max-w-[var(--pf-measure)]">
							My interests extend beyond traditional software engineering into
							artificial intelligence, developer tooling, system architecture,
							and emerging technologies.
						</p>
						<p className="max-w-[var(--pf-measure)]">
							I believe great software isn&rsquo;t just about writing code. It&rsquo;s
							about solving meaningful problems, making thoughtful engineering
							decisions, and continuously improving the systems we build.
						</p>
					</div>

					<Link
						href="/about"
						className="pf-focus mt-8 inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
					>
						More About Me
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</div>
			</div>
		</section>
	);
}