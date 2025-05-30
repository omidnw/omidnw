import React, { useMemo } from "react";
import { motion } from "framer-motion";
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
			"Playwright (Junior)",
			"Selenium (Middle)",
		],
		level: 70, // Estimated average
	},
] as const;

const interests = [
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
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, delay: 0.4 }}
		>
			<Card variant="cyberpunk" className="h-full">
				<CardHeader className="text-center pb-4">
					<div className="mx-auto mb-4 relative">
						<div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
							<div className="w-full h-full rounded-full bg-background flex items-center justify-center">
								<User
									className="w-12 h-12 md:w-16 md:h-16 text-primary neon-glow"
									aria-hidden="true"
								/>
							</div>
						</div>
						<div
							className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 border-background animate-pulse"
							aria-label="Online status indicator"
							role="status"
						/>
					</div>
					<CardTitle className="text-2xl md:text-3xl mb-2 font-heading text-primary neon-glow">
						OmidReza Keshtkar
					</CardTitle>
					<p className="text-accent font-mono text-base md:text-lg">
						Software QA & Full Stack Developer
					</p>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-3 text-muted-foreground">
						<MapPin
							className="w-4 h-4 text-primary flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-mono text-sm">Dubai, UAE</span>
					</div>
					<div className="flex items-center gap-3 text-muted-foreground">
						<Calendar
							className="w-4 h-4 text-primary flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-mono text-sm">Experienced Professional</span>
					</div>
					<div className="flex items-center gap-3 text-muted-foreground">
						<Code
							className="w-4 h-4 text-primary flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-mono text-sm">25+ Projects Completed</span>
					</div>

					<div className="pt-3 border-t border-border">
						<p className="text-sm text-muted-foreground font-mono leading-relaxed">
							Passionate about creating digital experiences that bridge the gap
							between humans and technology. I specialize in building scalable
							web applications with a focus on performance and user experience.
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
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
		<section className="space-y-6" aria-label="Professional timeline">
			<motion.h2
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="text-2xl md:text-3xl font-heading font-bold text-primary neon-glow mb-6"
			>
				NEURAL_PATHWAY.timeline()
			</motion.h2>

			<div className="relative">
				<div
					className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"
					aria-hidden="true"
				/>

				{timeline.map((item, index) => {
					const IconComponent = timelineIcons[item.type];
					return (
						<article
							key={`${item.year}-${index}`}
							className="relative pl-12 pb-6 last:pb-0"
						>
							<div
								className="absolute left-0 top-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center"
								aria-label={`Timeline marker for ${item.type}`}
							>
								<IconComponent
									className="w-4 h-4 text-primary"
									aria-hidden="true"
								/>
							</div>

							<Card variant="hologram" className="ml-4">
								<CardHeader className="pb-3">
									<div className="flex justify-between items-start gap-4">
										<div className="flex-1">
											<CardTitle className="text-primary font-heading mb-1 text-lg">
												{item.title}
											</CardTitle>
											<p className="text-secondary font-mono text-sm">
												{item.company}
											</p>
										</div>
										<Badge
											variant="outline"
											className="font-mono neon-border text-xs"
										>
											{item.year}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="text-muted-foreground font-mono text-sm leading-relaxed">
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
		<section className="space-y-6" aria-label="Technical skills and expertise">
			<motion.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className="text-2xl md:text-3xl font-heading font-bold text-primary neon-glow mb-6"
			>
				TECH_STACK.analyze()
			</motion.h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
				{techStack.map((category, index) => (
					<div key={category.category}>
						<Card variant="cyberpunk" className="h-full">
							<CardHeader className="pb-3">
								<CardTitle className="text-accent font-heading mb-3 text-lg">
									{category.category}
								</CardTitle>
								<div className="space-y-2">
									<div className="flex justify-between text-sm font-mono">
										<span>Proficiency</span>
										<span aria-label={`${category.level} percent`}>
											{category.level}%
										</span>
									</div>
									<Progress
										value={category.level}
										className="h-2 neon-border"
										aria-label={`${category.category} proficiency: ${category.level}%`}
									/>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex flex-wrap gap-1.5">
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
		<section className="space-y-6" aria-label="Personal interests and hobbies">
			<motion.h2
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className="text-2xl md:text-3xl font-heading font-bold text-primary neon-glow mb-6"
			>
				PERSONAL_INTERESTS.load()
			</motion.h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
				{interests.map((interest, index) => {
					const Icon = interest.icon;
					return (
						<div key={interest.name}>
							<Card
								variant="hologram"
								className="h-full cursor-pointer transition-transform hover:scale-105 duration-200"
							>
								<CardContent className="p-4 text-center">
									<Icon
										className="w-10 h-10 mx-auto mb-3 text-accent neon-glow"
										aria-hidden="true"
									/>
									<h3 className="font-heading text-base text-primary mb-2">
										{interest.name}
									</h3>
									<p className="text-sm text-muted-foreground font-mono leading-relaxed">
										{interest.description}
									</p>
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
		<div className="min-h-screen">
			{/* Hero Section */}
			<header className="text-center py-12 mb-8">
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-4xl md:text-6xl lg:text-7xl font-heading font-black mb-4 neon-glow text-primary"
				>
					ABOUT_ME.exe
				</motion.h1>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto"
				>
					Diving deep into the neural pathways of a cybernetic developer
				</motion.p>
			</header>

			{/* Main Content */}
			<div className="space-y-12">
				{/* Profile and Timeline Section */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
	);
}
