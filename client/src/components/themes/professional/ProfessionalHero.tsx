import { m } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { pictureSource } from "@/lib/images";
import { RESUME_FILENAME } from "@/lib/social";

/**
 * Professional-theme hero.
 *
 * Left: a technical kicker, the name as the dominant element, the professional
 * title, one short paragraph, the two primary actions and a wrapping list of
 * technology indicators. Right: the existing interactive globe, sized to support
 * the copy rather than compete with it.
 *
 * Deliberately free of the CyberPunk neon utilities and Orbitron — it resolves
 * Geist and the Professional palette through the theme tokens.
 *
 * The design's Dubai/UAE location callout over the globe is intentionally not
 * implemented here.
 */

const KICKER = "Software Engineering · Quality Automation";

const TITLE = ["Senior Software QA Engineer", "& Full-Stack Developer"];

const SUMMARY =
	"I build reliable software, scalable test automation, and intelligent engineering workflows — bridging quality engineering, full-stack development, and AI.";

const TECH = [
	"TypeScript",
	"React",
	"Node.js",
	"NestJS",
	"Playwright",
	"Docker",
	"AI / LLMs",
];

const GLOBE = pictureSource("/images/futuristic-earth.png");

const MOTTO = "Engineering · Reliability · Through Better Software";

export default function ProfessionalHero() {
	return (
		<section
			className="pf-section relative isolate w-[100vw] left-1/2 -translate-x-1/2 overflow-hidden pb-[clamp(1.5rem,4vw,2.5rem)] lg:pb-[var(--pf-section-y)]"
			aria-label="Introduction"
		>
			{/* Backdrop. The grid is masked towards the globe side and the copy
			    side is left almost bare, so no rule can ever strike through the
			    name, the title or the paragraph. */}
			<div className="pf-hero-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
			<div
				className="pointer-events-none absolute right-[-10%] top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full blur-3xl"
				aria-hidden="true"
				style={{
					background:
						"radial-gradient(circle, hsl(var(--primary) / 0.11) 0%, transparent 68%)",
				}}
			/>

			<div className="pf-shell grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
				{/* Copy column */}
				<div className="relative z-10 max-w-[34rem]">
					<p className="pf-label">{KICKER}</p>

					<h1 className="mt-5 font-heading text-[clamp(2.5rem,7.5vw,4.25rem)] font-bold leading-[0.94] tracking-[-0.03em]">
						<span className="block text-foreground">OMID REZA</span>
						<span className="block text-primary">KESHTKAR</span>
					</h1>

					<p className="mt-6 text-lg font-medium leading-snug text-foreground sm:text-xl">
						{TITLE[0]}
						<span className="block text-muted-foreground">{TITLE[1]}</span>
					</p>

					<p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
						{SUMMARY}
					</p>

					{/* Actions. The two primary buttons share one row; the résumé is a
					    text link so it never competes with them. */}
					<div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-4">
						<Link
							href="/projects"
							className="pf-focus inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:translate-y-px"
						>
							Explore My Work
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>

						<Link
							href="/contact"
							className="pf-focus inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
						>
							<Mail className="h-4 w-4" aria-hidden="true" />
							Get in Touch
						</Link>

						<a
							href={RESUME_FILENAME}
							download
							className="pf-focus group inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
						>
							Download Résumé
							<ArrowUpRight
								className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</a>
					</div>

					{/* Technology indicators. Supporting detail, not a focal point. */}
					<ul className="pf-tags mt-7">
						{TECH.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>

				{/* Globe column. Present but quiet: an edge-faded night render that
				    breathes very slowly, and yields its motion to the visitor's
				    reduced-motion preference (both the CSS animation below and the
				    MotionConfig in ProfessionalHome honour it).

				    Decorative: it carries no data the copy depends on and naming the
				    continents on it would read as a location claim, so it is hidden
				    from assistive technology rather than described. */}
				<div className="pf-globe relative -mx-6 flex flex-col items-center justify-center sm:-mx-2 lg:mx-0">
					<m.picture
						className="block w-full max-w-[26rem] sm:max-w-[30rem] lg:max-w-[40rem]"
						initial={{ opacity: 0, scale: 0.985 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					>
						{/* `<source>` must precede `<img>` inside `<picture>`. */}
						<source
							type="image/webp"
							srcSet={GLOBE.srcSet}
							sizes="(min-width: 1024px) 40rem, (min-width: 640px) 30rem, 26rem"
						/>
						<img
							{...GLOBE}
							sizes="(min-width: 1024px) 40rem, (min-width: 640px) 30rem, 26rem"
							alt=""
							aria-hidden="true"
							draggable={false}
							className="pf-globe-img block w-full select-none"
						/>
					</m.picture>

					{/* Motto. One mono line beneath the globe rather than a stack beside it, so it
				    reads as a signature and never overlaps the artwork. */}
					<p
						className="mt-6 hidden text-center font-display text-[0.6875rem] uppercase leading-relaxed tracking-[0.24em] text-muted-foreground sm:block"
						aria-hidden="true"
					>
						{MOTTO}
					</p>
				</div>
			</div>
		</section>
	);
}