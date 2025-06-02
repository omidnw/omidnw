import React, { useMemo } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	User,
	MapPin,
	Calendar,
	Code,
	Briefcase,
	GraduationCap,
	Heart,
	Coffee,
	Music,
	Gamepad2,
	BookOpen,
	Film,
	Github,
	Rss,
	Smartphone,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

// Define a type for interest items
interface InterestItem {
	name: string;
	icon: React.ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
	>;
	description: string;
	href?: string; // Optional property
	linkText?: string; // Optional property
}

const timeline = [
	{
		year: "Present",
		title: "Software QA",
		company: "Troweb Inc., Dubai, UAE",
		description: "Ensuring the quality and reliability of software products.",
		type: "work",
	},
	{
		year: "2023",
		title: "BS in Computer Programming",
		company: "Shamsipour Technical and Vocational College, Tehran, IR",
		description: "Completed Bachelor of Science in Computer Programming.",
		type: "education",
	},
	{
		year: "2022",
		title: "Started at Troweb Inc.",
		company: "Dubai, UAE",
		description: "Joined Troweb Inc. as a Software QA.",
		type: "work",
	},
	{
		year: "2021",
		title: "Web Programming (Full Stack Developer - Freelancer)",
		company: "Qatar German Pipe Company (QGPC), Doha, QA",
		description: "Developed web solutions for QGPC on a freelance basis.",
		type: "work",
	},
	{
		year: "2021",
		title: "AD in Computer Programming",
		company: "Shamsipour Technical and Vocational College, Tehran, IR",
		description: "Completed Associate Degree in Computer Programming.",
		type: "education",
	},
	{
		year: "2021",
		title: "Software Engineer",
		company: "Veresk Rail Cars, Tehran, IR",
		description:
			"Worked as a Software Engineer, focusing on system maintenance. (Mar 2019 – Mar 2021)",
		type: "work",
	},
	{
		year: "2019",
		title: "Began Software Engineering Role",
		company: "Veresk Rail Cars, Tehran, IR",
		description: "Started role as Software Engineer.",
		type: "milestone",
	},
] as const;

const techStack = [
	{
		category: "Imperative Programming",
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
		level: 80, // Estimated average
	},
	{
		category: "Declarative Programming",
		skills: ["HTML5", "YAML", "XML"],
		level: 85, // Estimated average
	},
	{
		category: "Orchestration",
		skills: ["Docker (Junior)", "AWS (Junior)"],
		level: 65, // Estimated average
	},
	{
		category: "SysAdmin",
		skills: ["Debian Base (Middle)", "Fedora (Middle)", "FreeBSD (Junior)"],
		level: 75, // Estimated average
	},
	{
		category: "Frameworks & Testing",
		skills: [
			"Jest (Middle)",
			"Remix (Junior)",
			"Playwright (Expert)",
			"Selenium (Middle)",
		],
		level: 70, // Estimated average
	},
	{
		category: "AI & Next-Gen Tools",
		skills: ["Vibe Coding (Cursor) (Expert)", "Prompt Engineering (Advanced)"],
		level: 95,
	},
] as const;

const interests: readonly InterestItem[] = [
	{
		name: "Anime & Manga",
		icon: Film,
		description:
			"Deeply immersed in captivating anime series and manga. This is my world! Explore my Anime-Planet profile.",
		href: "https://anime-planet.com/users/omidnw",
		linkText: "My Anime-Planet →",
	},
	{
		name: "Sci-Fi & Marvel",
		icon: Film,
		description: "Exploring futuristic narratives and superhero sagas",
	},
	{
		name: "Coding & Development",
		icon: Code,
		description: "Passionate about building software and new technologies",
	},
	{
		name: "Open Source",
		icon: Github,
		description: "Contributing to and creating open-source projects",
	},
	{
		name: "Tech News",
		icon: Rss,
		description: "Keeping up with the latest in the tech world via daily.dev",
	},
	{
		name: "iOS Development",
		icon: Smartphone,
		description: "Developing applications for the iOS ecosystem using Swift",
	},
] as const;

const ProfileCard = React.memo(() => {
	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, delay: 0.4 }}
		>
			<Card variant="cyberpunk" className="h-full">
				<CardHeader className="text-center pb-3 sm:pb-4">
					<div className="mx-auto mb-3 sm:mb-4 relative">
						<div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
							<div className="w-full h-full rounded-full bg-background flex items-center justify-center">
								<User
									className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary neon-glow"
									aria-hidden="true"
								/>
							</div>
						</div>
						<div
							className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 border-background animate-pulse"
							aria-label="Online status indicator"
							role="status"
						/>
					</div>
					<CardTitle className="text-xl sm:text-2xl md:text-3xl mb-2 font-heading text-primary neon-glow">
						OmidReza Keshtkar
					</CardTitle>
					<p className="text-accent font-mono text-sm sm:text-base md:text-lg">
						Software QA & Full Stack Developer
					</p>
				</CardHeader>
				<CardContent className="space-y-2 sm:space-y-3">
					<div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
						<MapPin
							className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-mono text-xs sm:text-sm">Dubai, UAE</span>
					</div>
					<div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
						<Calendar
							className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-mono text-xs sm:text-sm">
							Experienced Professional
						</span>
					</div>
					<div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
						<Code
							className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-mono text-xs sm:text-sm">
							25+ Projects Completed
						</span>
					</div>

					<div className="pt-2 sm:pt-3 border-t border-border">
						<p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed">
							Passionate about creating digital experiences that bridge the gap
							between humans and technology. I specialize in building scalable
							web applications with a focus on performance and user experience.
						</p>
					</div>
				</CardContent>
			</Card>
		</m.div>
	);
});
ProfileCard.displayName = "ProfileCard";

const Timeline = React.memo(() => {
	const timelineIcons = useMemo(
		() => ({
			work: Briefcase,
			education: GraduationCap,
			milestone: Heart,
		}),
		[]
	);

	return (
		<section
			className="space-y-4 sm:space-y-6"
			aria-label="Professional timeline"
		>
			<m.h2
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-primary neon-glow mb-4 sm:mb-6"
			>
				NEURAL_PATHWAY.timeline()
			</m.h2>

			<div className="relative">
				<div
					className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"
					aria-hidden="true"
				/>

				{timeline.map((item, index) => {
					const IconComponent = timelineIcons[item.type];
					return (
						<article
							key={`${item.year}-${index}`}
							className="relative pl-10 sm:pl-12 pb-4 sm:pb-6 last:pb-0"
						>
							<div
								className="absolute left-0 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center"
								aria-label={`Timeline marker for ${item.type}`}
							>
								<IconComponent
									className="w-3 h-3 sm:w-4 sm:h-4 text-primary"
									aria-hidden="true"
								/>
							</div>

							<Card variant="hologram" className="ml-2 sm:ml-4">
								<CardHeader className="pb-2 sm:pb-3">
									<div className="flex justify-between items-start gap-2 sm:gap-4">
										<div className="flex-1 min-w-0">
											<CardTitle className="text-primary font-heading mb-1 text-base sm:text-lg">
												{item.title}
											</CardTitle>
											<p className="text-secondary font-mono text-xs sm:text-sm break-words">
												{item.company}
											</p>
										</div>
										<Badge
											variant="outline"
											className="font-mono neon-border text-xs flex-shrink-0"
										>
											{item.year}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="text-muted-foreground font-mono text-xs sm:text-sm leading-relaxed">
										{item.description}
									</p>
								</CardContent>
							</Card>
						</article>
					);
				})}
			</div>
		</section>
	);
});
Timeline.displayName = "Timeline";

const TechStack = React.memo(() => {
	return (
		<section
			className="space-y-4 sm:space-y-6"
			aria-label="Technical skills and expertise"
		>
			<m.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-primary neon-glow mb-4 sm:mb-6"
			>
				TECH_STACK.analyze()
			</m.h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
				{techStack.map((category, index) => (
					<div key={category.category}>
						<Card variant="cyberpunk" className="h-full">
							<CardHeader className="pb-2 sm:pb-3">
								<CardTitle className="text-accent font-heading mb-2 sm:mb-3 text-base sm:text-lg">
									{category.category}
								</CardTitle>
								<div className="space-y-1.5 sm:space-y-2">
									<div className="flex justify-between text-xs sm:text-sm font-mono">
										<span>Proficiency</span>
										<span aria-label={`${category.level} percent`}>
											{category.level}%
										</span>
									</div>
									<Progress
										value={category.level}
										className="h-1.5 sm:h-2 neon-border"
										aria-label={`${category.category} proficiency: ${category.level}%`}
									/>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex flex-wrap gap-1 sm:gap-1.5">
									{category.skills.map((skill) => (
										<Badge
											key={skill}
											variant="secondary"
											className="text-xs font-mono neon-glow"
										>
											{skill}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				))}
			</div>
		</section>
	);
});
TechStack.displayName = "TechStack";

const Interests = React.memo(() => {
	return (
		<section
			className="space-y-4 sm:space-y-6"
			aria-label="Personal interests and hobbies"
		>
			<m.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-primary neon-glow mb-4 sm:mb-6"
			>
				PERSONAL_INTERESTS.load()
			</m.h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
				{interests.map((interest, index) => {
					const Icon = interest.icon;
					return (
						<div key={interest.name}>
							<Card
								variant="hologram"
								className="h-full cursor-pointer transition-transform hover:scale-105 duration-200 touch-manipulation"
							>
								<CardContent className="p-3 sm:p-4 text-center">
									<Icon
										className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-accent neon-glow"
										aria-hidden="true"
									/>
									<h3 className="font-heading text-sm sm:text-base text-primary mb-2">
										{interest.name}
									</h3>
									<p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed">
										{interest.description}
									</p>
									{interest.href && interest.linkText && (
										<div className="mt-2 sm:mt-3">
											<a
												href={interest.href}
												target="_blank"
												rel="noopener noreferrer"
												className="block w-full text-xs font-mono text-primary hover:text-secondary transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-primary/10 hover:bg-secondary/10 text-center touch-manipulation min-h-[44px] flex items-center justify-center"
												aria-label={`Visit ${interest.name} profile`}
											>
												{interest.linkText}
											</a>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					);
				})}
			</div>
		</section>
	);
});
Interests.displayName = "Interests";

export default function About() {
	return (
		<LazyMotion features={domMax}>
			<div className="min-h-screen">
				{/* Hero Section */}
				<header className="text-center py-8 sm:py-12 mb-6 sm:mb-8">
					<m.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-black mb-3 sm:mb-4 neon-glow text-primary"
					>
						ABOUT_ME.sh
					</m.h1>
					<m.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-base sm:text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto px-4"
					>
						Diving deep into the neural pathways of a cybernetic developer
					</m.p>
				</header>

				{/* Main Content */}
				<div className="space-y-8 sm:space-y-12">
					{/* Profile and Timeline Section */}
					<section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
						<div className="lg:col-span-1">
							<ProfileCard />
						</div>
						<div className="lg:col-span-2">
							<Timeline />
						</div>
					</section>

					{/* Tech Stack Section */}
					<TechStack />

					{/* Interests Section */}
					<Interests />
				</div>
			</div>
		</LazyMotion>
	);
}
