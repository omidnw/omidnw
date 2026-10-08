import { Link } from "wouter";
import { ArrowRight, Briefcase, GraduationCap, Heart } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import ProfessionalPageHeader from "@/components/themes/professional/ProfessionalPageHeader";
import { pictureSource } from "@/lib/images";

/**
 * Professional-theme about page (`/about`).
 *
 * Expands the landing page's about band into the full page: profile, the
 * complete career timeline (all eight entries from the CyberPunk About page,
 * including the two the landing page's timeline omits), the declared tech
 * categories, and personal interests.
 *
 * Proficiency percentages from the CyberPunk page are deliberately not carried
 * over — they are self-assessed estimates, and a category card reads better
 * without a bar that implies false precision. The self-declared level that sits
 * in each skill string ("Playwright (Expert)") is preserved verbatim, because
 * that is the author's own claim rather than a computed number.
 */

const LOGO = pictureSource("/images/ork-logo.png");

interface TimelineEntry {
	period: string;
	role: string;
	employer: string;
	description: string;
	kind: "work" | "education" | "milestone";
}

const TIMELINE: TimelineEntry[] = [
	{
		period: "Present",
		role: "Automation Test Engineer",
		employer: "NotionWave Inc.",
		description:
			"This role is essentially software QA, but with a full stack developer and QA mindset to build automation code that tests different parts of a project more effectively.",
		kind: "work",
	},
	{
		period: "2025",
		role: "Software QA",
		employer: "Troweb Inc., Dubai, UAE",
		description: "Ensuring the quality and reliability of software products.",
		kind: "work",
	},
	{
		period: "2023",
		role: "BS in Computer Programming",
		employer: "Shamsipour Technical and Vocational College, Tehran, IR",
		description: "Completed Bachelor of Science in Computer Programming.",
		kind: "education",
	},
	{
		period: "2022",
		role: "Started at Troweb Inc.",
		employer: "Dubai, UAE",
		description: "Joined Troweb Inc. as a Software QA.",
		kind: "work",
	},
	{
		period: "2021",
		role: "Web Programming (Full Stack Developer — Freelancer)",
		employer: "Qatar German Pipe Company (QGPC), Doha, QA",
		description: "Developed web solutions for QGPC on a freelance basis.",
		kind: "work",
	},
	{
		period: "2021",
		role: "AD in Computer Programming",
		employer: "Shamsipour Technical and Vocational College, Tehran, IR",
		description: "Completed Associate Degree in Computer Programming.",
		kind: "education",
	},
	{
		period: "2021",
		role: "Software Engineer",
		employer: "Veresk Rail Cars, Tehran, IR",
		description:
			"Worked as a Software Engineer, focusing on system maintenance. (Mar 2019 – Mar 2021)",
		kind: "work",
	},
	{
		period: "2019",
		role: "Began Software Engineering Role",
		employer: "Veresk Rail Cars, Tehran, IR",
		description: "Started role as Software Engineer.",
		kind: "milestone",
	},
];

const KIND_ICON = {
	work: Briefcase,
	education: GraduationCap,
	milestone: Heart,
} as const;

interface TechCategory {
	name: string;
	skills: string[];
}

const TECH_CATEGORIES: TechCategory[] = [
	{
		name: "Imperative Programming",
		skills: [
			"C (Middle)",
			"C++ (Junior)",
			"TypeScript (Middle)",
			"React (Junior)",
			"Rust (Junior)",
			"Bash (Middle)",
			"Node.JS (Middle)",
			"JavaScript (Middle)",
		],
	},
	{
		name: "Declarative Programming",
		skills: ["HTML5", "YAML", "XML"],
	},
	{
		name: "Orchestration",
		skills: ["Docker (Junior)", "AWS (Junior)"],
	},
	{
		name: "SysAdmin",
		skills: ["Debian Base (Middle)", "Fedora (Middle)", "FreeBSD (Junior)"],
	},
	{
		name: "Frameworks & Testing",
		skills: [
			"Jest (Middle)",
			"Remix (Junior)",
			"Playwright (Expert)",
			"Selenium (Middle)",
		],
	},
	{
		name: "AI & Next-Gen Tools",
		skills: ["Vibe Coding (Cursor) (Expert)", "Prompt Engineering (Advanced)"],
	},
];

interface Interest {
	name: string;
	description: string;
	href?: string;
	linkText?: string;
	icon: typeof Heart | typeof SiGithub;
}

const INTERESTS: Interest[] = [
	{
		name: "Anime & Manga",
		icon: Heart,
		description:
			"Deeply immersed in captivating anime series and manga. Explore my Anime-Planet profile.",
		href: "https://anime-planet.com/users/omidnw",
		linkText: "My Anime-Planet",
	},
	{
		name: "Sci-Fi & Marvel",
		icon: Heart,
		description: "Exploring futuristic narratives and superhero sagas",
	},
	{
		name: "Coding & Development",
		icon: Briefcase,
		description: "Passionate about building software and new technologies",
	},
	{
		name: "Open Source",
		icon: SiGithub,
		description: "Contributing to and creating open-source projects",
	},
	{
		name: "Tech News",
		icon: Heart,
		description: "Keeping up with the latest in the tech world via daily.dev",
	},
	{
		name: "iOS Development",
		icon: GraduationCap,
		description: "Developing applications for the iOS ecosystem using Swift",
	},
];

export default function ProfessionalAboutPage() {
	return (
		<div className="pb-[var(--pf-section-y)]">
			<ProfessionalPageHeader
				label="About"
				title="The Engineer Behind the Code"
				lede="Quality engineering, test automation and full-stack development — with an interest in the tooling that makes all three better."
				regionLabel="About"
			/>

			{/* Profile + introduction */}
			<section
				className="pf-shell mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16"
				aria-label="Introduction"
			>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-7 sm:p-9">
					<div className="pf-panel-grid pointer-events-none absolute inset-0" aria-hidden="true" />
					<div className="relative flex flex-col items-center gap-4 text-center">
						<picture>
							<source type="image/webp" srcSet={LOGO.srcSet} sizes="64px" />
							<img
								{...LOGO}
								sizes="64px"
								alt=""
								className="h-12 w-auto select-none"
								draggable={false}
							/>
						</picture>
						<p className="font-heading text-base font-semibold text-foreground">
							Omid Reza Keshtkar
						</p>
						<p className="font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground">
							Software QA &amp; Full Stack Developer
						</p>
						<p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-primary">
							Dubai, UAE
						</p>
					</div>
				</div>

				<div className="space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
					<p className="max-w-[var(--pf-measure)]">
						I&rsquo;m Omid Reza Keshtkar, a software engineer specializing in
						quality engineering, test automation, and full-stack development.
					</p>
					<p className="max-w-[var(--pf-measure)]">
						I enjoy understanding how systems work, identifying opportunities for
						improvement, and building solutions that are reliable, maintainable,
						and efficient.
					</p>
					<p className="max-w-[var(--pf-measure)]">
						My interests extend beyond traditional software engineering into
						artificial intelligence, developer tooling, system architecture, and
						emerging technologies.
					</p>
					<p className="max-w-[var(--pf-measure)]">
						I believe great software isn&rsquo;t just about writing code. It&rsquo;s
						about solving meaningful problems, making thoughtful engineering
						decisions, and continuously improving the systems we build.
					</p>

					<div className="flex flex-wrap gap-3 pt-2">
						<Link
							href="/contact"
							className="pf-focus inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
						>
							Get in Touch
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
						<Link
							href="/projects"
							className="pf-focus inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
						>
							See My Work
						</Link>
					</div>
				</div>
			</section>

			{/* Career timeline */}
			<section
				id="experience"
				className="pf-shell mt-[calc(var(--pf-section-y)*1.1)] scroll-mt-28"
				aria-labelledby="about-experience-heading"
			>
				<p className="pf-label">Experience</p>
				<h2 id="about-experience-heading" className="pf-heading">
					Professional Journey
				</h2>

				<ol className="mt-10">
					{TIMELINE.map((entry, index) => {
						const Icon = KIND_ICON[entry.kind];
						return (
							<li
								key={`${entry.period}-${entry.role}`}
								className="pf-journey-entry relative grid gap-x-[var(--pf-journey-gap)] gap-y-2 pb-8 last:pb-0 md:grid-cols-[var(--pf-journey-date)_minmax(0,1fr)] md:pb-9"
							>
								{index < TIMELINE.length - 1 ? (
									<span aria-hidden="true" className="pf-journey-rail" />
								) : null}

								<span
									aria-hidden="true"
									className={`pf-journey-marker flex items-center justify-center ${
										entry.kind === "education"
											? "bg-muted-foreground"
											: "bg-primary"
									}`}
								>
									<Icon
										className="h-2.5 w-2.5 text-background"
										strokeWidth={3}
									/>
								</span>

								<p className="pf-journey-date font-mono text-xs tracking-wide text-primary">
									{entry.period}
								</p>

								<div className="pf-journey-body">
									<h3 className="font-heading text-base font-semibold leading-snug text-foreground">
										{entry.role}
									</h3>
									<p className="mt-0.5 text-sm text-muted-foreground">
										{entry.employer}
									</p>
									<p className="mt-1.5 max-w-[var(--pf-measure)] text-sm leading-relaxed text-muted-foreground">
										{entry.description}
									</p>
								</div>
							</li>
						);
					})}
				</ol>
			</section>

			{/* Tech categories */}
			<section
				id="tech-stack"
				className="pf-shell mt-[calc(var(--pf-section-y)*1.1)] scroll-mt-28"
				aria-labelledby="about-tech-heading"
			>
				<p className="pf-label">Tech Stack</p>
				<h2 id="about-tech-heading" className="pf-heading">
					Technologies &amp; Tools
				</h2>
				<p className="pf-lede">
					Self-declared working levels, as listed below.
				</p>

				<ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{TECH_CATEGORIES.map((category) => (
						<li
							key={category.name}
							className="rounded-xl border border-border bg-card p-5"
						>
							<h3 className="font-heading text-sm font-semibold text-foreground">
								{category.name}
							</h3>
							<ul className="pf-tags mt-3">
								{category.skills.map((skill) => (
									<li key={skill}>{skill}</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</section>

			{/* Interests */}
			<section
				className="pf-shell mt-[calc(var(--pf-section-y)*1.1)]"
				aria-labelledby="about-interests-heading"
			>
				<p className="pf-label">Beyond Work</p>
				<h2 id="about-interests-heading" className="pf-heading">
					Personal Interests
				</h2>

				<ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{INTERESTS.map((interest) => {
						const Icon = interest.icon;
						return (
							<li
								key={interest.name}
								className="flex flex-col rounded-xl border border-border bg-card p-5"
							>
								<span
									className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"
									aria-hidden="true"
								>
									<Icon className="h-4 w-4" strokeWidth={1.75} />
								</span>
								<h3 className="mt-3.5 font-heading text-sm font-semibold text-foreground">
									{interest.name}
								</h3>
								<p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
									{interest.description}
								</p>
								{interest.href && interest.linkText ? (
									<a
										href={interest.href}
										target="_blank"
										rel="noopener noreferrer"
										className="pf-focus mt-4 inline-flex min-h-11 items-center self-start text-sm text-primary underline-offset-4 transition-colors hover:underline"
									>
										{interest.linkText}
										<span aria-hidden="true"> ↗</span>
										<span className="sr-only">(opens in a new tab)</span>
									</a>
								) : null}
							</li>
						);
					})}
				</ul>
			</section>
		</div>
	);
}