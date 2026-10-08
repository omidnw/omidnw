import { Link } from "wouter";
import { ArrowRight, Code2, Monitor, Server, TestTube2, Container, Brain } from "lucide-react";

/**
 * Professional-theme technologies band.
 *
 * Six cards across a 2/3-column grid. Each is a link to the About page's tech
 * section and carries an icon tile, the category name, a short summary of what
 * it contains and a navigation indicator — so the card is readable on its own
 * and still leads somewhere useful.
 *
 * The lists come from the landing-page spec and are cross-checked against the
 * skills already declared in client/src/pages/About.tsx. No proficiency
 * percentages appear here — those live on the About page.
 */

interface TechCategory {
	icon: typeof Code2;
	name: string;
	items: string;
}

const CATEGORIES: TechCategory[] = [
	{
		icon: Code2,
		name: "Languages",
		items: "TypeScript, JavaScript, Bash, Rust",
	},
	{
		icon: Monitor,
		name: "Frontend",
		items: "React, Next.js, HTML, CSS, Tailwind",
	},
	{
		icon: Server,
		name: "Backend",
		items: "Node.js, NestJS, Fastify",
	},
	{
		icon: TestTube2,
		name: "Testing & QA",
		items: "Playwright, Selenium, Jest",
	},
	{
		icon: Container,
		name: "Infrastructure",
		items: "Docker, Linux, FreeBSD, AWS",
	},
	{
		icon: Brain,
		name: "AI & Tools",
		items: "LLM APIs, LangGraph, Ollama",
	},
];

export default function ProfessionalTech() {
	return (
		<section className="pf-section pf-landing-section pf-landing-tech" aria-labelledby="tech-heading">
			{/* Heading row */}
			<div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-6">
				<div>
					<p className="pf-label">Tech Stack</p>
					<h2 id="tech-heading" className="pf-heading">
						Technologies I Work With
					</h2>
				</div>

				<Link
					href="/about#tech-stack"
					className="pf-focus group -mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:text-primary/80 hover:underline"
				>
					View Full Stack
					<ArrowRight
						className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</Link>
			</div>

			{/* Cards */}
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
				{CATEGORIES.map((category) => {
					const Icon = category.icon;
					return (
						<li key={category.name}>
							<Link
								href="/about#tech-stack"
								className="pf-focus group flex h-full items-center gap-3.5 rounded-xl border border-border bg-card p-4 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80 sm:p-5"
							>
								<span
									className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden="true"
								>
									<Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} />
								</span>

								<span className="min-w-0 flex-1">
									<span className="block text-sm font-semibold leading-tight text-foreground">
										{category.name}
									</span>
									<span className="mt-1 block text-[0.8125rem] leading-snug text-muted-foreground">
										{category.items}
									</span>
								</span>

								<ArrowRight
									className="h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
									aria-hidden="true"
								/>
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}