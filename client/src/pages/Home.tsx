import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LazyMotion, m, domMax } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Download,
	Code,
	Zap,
	Cpu,
	Database,
	Globe,
	Terminal,
	ChevronDown,
	FileCode,
	Cog,
	Brain,
	Leaf,
	Anchor,
	Cloud,
	HardDrive,
	TestTube2,
	GitMerge,
	Rocket,
	Palette,
} from "lucide-react";

const getProficiencyWord = (level: number): string => {
	if (level >= 90) return "Expert";
	if (level >= 70) return "Advanced";
	if (level >= 40) return "Middle";
	return "Junior";
};

const categorizedSkills = [
	{
		categoryName: "Imperative Programming",
		skills: [
			{ name: "TypeScript", icon: Terminal, level: 90 },
			{ name: "JavaScript", icon: Leaf, level: 90 },
			{ name: "React", icon: Code, level: 50 },
			{ name: "Node.js", icon: Leaf, level: 65 },
			{ name: "Bash", icon: GitMerge, level: 60 },
			{ name: "Rust", icon: Cog, level: 20 },
			{ name: "C", icon: Cog, level: 40 },
			{ name: "C++", icon: Cog, level: 20 },
		].map((skill) => ({
			...skill,
			proficiencyWord: getProficiencyWord(skill.level),
		})),
	},
	{
		categoryName: "Declarative Programming",
		skills: [
			{ name: "HTML5", icon: FileCode, level: 100 },
			{ name: "CSS3", icon: Palette, level: 50 },
			{ name: "YAML", icon: FileCode, level: 90 },
			{ name: "XML", icon: FileCode, level: 50 },
		].map((skill) => ({
			...skill,
			proficiencyWord: getProficiencyWord(skill.level),
		})),
	},
	{
		categoryName: "Frameworks & Testing",
		skills: [
			{ name: "Playwright", icon: TestTube2, level: 100 },
			{ name: "Jest", icon: TestTube2, level: 60 },
			{ name: "Selenium", icon: TestTube2, level: 60 },
			{ name: "Remix", icon: Rocket, level: 30 },
		].map((skill) => ({
			...skill,
			proficiencyWord: getProficiencyWord(skill.level),
		})),
	},
	{
		categoryName: "Orchestration & Cloud",
		skills: [
			{ name: "Docker", icon: Anchor, level: 30 },
			{ name: "AWS", icon: Cloud, level: 25 },
		].map((skill) => ({
			...skill,
			proficiencyWord: getProficiencyWord(skill.level),
		})),
	},
	{
		categoryName: "System Administration",
		skills: [
			{ name: "Linux (Debian/Fedora)", icon: HardDrive, level: 75 },
			{ name: "FreeBSD", icon: HardDrive, level: 45 },
		].map((skill) => ({
			...skill,
			proficiencyWord: getProficiencyWord(skill.level),
		})),
	},
	{
		categoryName: "AI & Next-Gen Tools",
		skills: [
			{ name: "Vibe Coding (Cursor)", icon: Zap, level: 100 },
			{ name: "Prompt Engineering", icon: Brain, level: 90 },
		].map((skill) => ({
			...skill,
			proficiencyWord: getProficiencyWord(skill.level),
		})),
	},
];

const glitchText = [
	"DEVELOPER",
	"D3V3L0P3R",
	"CODER",
	"C0D3R",
	"SOFTWARE QA",
	"S0FTWARE Q4",
	"FULL STACK DEV",
	"FULL ST4CK D3V",
	"PROBLEM SOLVER",
	"PR0BL3M S0LV3R",
] as const;

const stats = [
	{ label: "PROJECTS", value: 5, suffix: "+" },
	{ label: "EXPERIENCE", value: 5, suffix: "+ Years" },
	{ label: "BLOGS", value: 1, suffix: "" },
] as const;

function GlitchText() {
	const [currentText, setCurrentText] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentText((prev) => (prev + 1) % glitchText.length);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<m.span
			key={currentText}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="text-accent font-bold glitch-text"
			aria-live="polite"
			aria-label={`Current role: ${glitchText[currentText]}`}
		>
			{glitchText[currentText]}
		</m.span>
	);
}

// Memoized MatrixRain component to prevent unnecessary re-renders
const MatrixRain = React.memo(() => {
	const rainDrops = useMemo(
		() =>
			Array.from({ length: 50 }, (_, i) => ({
				id: i,
				left: Math.random() * 100,
				duration: Math.random() * 10 + 5,
				delay: Math.random() * 5,
				characters: Array.from({ length: 20 }, () =>
					String.fromCharCode(0x30a0 + Math.random() * 96)
				),
			})),
		[]
	);

	return (
		<div
			className="fixed inset-0 z-0 opacity-10 pointer-events-none"
			aria-hidden="true"
			role="presentation"
		>
			{rainDrops.map((drop) => (
				<m.div
					key={drop.id}
					className="absolute text-primary font-mono text-sm"
					style={{ left: `${drop.left}%` }}
					animate={{ y: ["0vh", "100vh"] }}
					transition={{
						duration: drop.duration,
						repeat: Infinity,
						delay: drop.delay,
					}}
				>
					{drop.characters.map((char, j) => (
						<div key={j}>{char}</div>
					))}
				</m.div>
			))}
		</div>
	);
});
MatrixRain.displayName = "MatrixRain";

function Hero() {
	const handleDownloadResume = useCallback(() => {
		// Add actual resume download logic here
		console.log("Download resume clicked");
	}, []);

	const handleViewProjects = useCallback(() => {
		// Navigate to projects section
		window.location.href = "/projects";
	}, []);

	return (
		<section
			className="min-h-screen flex items-center justify-center relative px-4"
			aria-label="Hero section"
		>
			<MatrixRain />

			<div className="text-center z-10 max-w-4xl mx-auto">
				<m.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<m.h1
						className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black mb-4 sm:mb-6 neon-glow"
						animate={{
							textShadow: [
								"0 0 20px #ff00ff",
								"0 0 40px #ff00ff, 0 0 60px #ff00ff",
								"0 0 20px #ff00ff",
							],
						}}
						transition={{ duration: 2, repeat: Infinity }}
					>
						CYBER
						<br />
						<span className="text-secondary">PORTFOLIO</span>
					</m.h1>
				</m.div>

				<m.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.5 }}
					className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-mono mb-6 sm:mb-8"
				>
					<span className="text-foreground">I'M A </span>
					<GlitchText />
				</m.div>

				<m.p
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 1 }}
					className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto font-mono leading-relaxed px-4"
				>
					Welcome to my digital realm. I craft immersive web experiences using
					cutting-edge technologies in the cyberpunk era.
				</m.p>

				<m.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 1.5 }}
					className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
				>
					<Button
						variant="cyberpunk"
						size="lg"
						className="w-full sm:w-auto min-h-[48px] touch-manipulation"
						onClick={handleDownloadResume}
						aria-label="Download my resume (coming soon)"
						disabled={true}
					>
						<Download
							className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
							aria-hidden="true"
						/>
						Download Resume
					</Button>
					<Button
						variant="neon"
						size="lg"
						className="w-full sm:w-auto min-h-[48px] touch-manipulation"
						onClick={handleViewProjects}
						aria-label="View my projects"
					>
						<Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
						View Projects
					</Button>
				</m.div>

				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 2 }}
					className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
				>
					<m.button
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
						className="text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 touch-manipulation"
						onClick={() =>
							window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
						}
						aria-label="Scroll to next section"
					>
						<ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
					</m.button>
				</m.div>
			</div>
		</section>
	);
}

function SkillsGrid() {
	return (
		<section className="py-16 sm:py-20 px-4" aria-label="Technical skills">
			<m.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				viewport={{ once: true }}
				className="text-center mb-12 sm:mb-16"
			>
				<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 neon-glow text-primary">
					TECH_STACK
				</h2>
				<p className="text-base sm:text-lg text-muted-foreground font-mono">
					My arsenal of cybernetic enhancements
				</p>
			</m.div>

			{categorizedSkills.map((category) => (
				<div key={category.categoryName} className="mb-8 sm:mb-12">
					<m.h3
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-6 sm:mb-8 text-secondary neon-glow text-center"
					>
						{category.categoryName.toUpperCase().replace(/ /g, "_")}
					</m.h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
						{category.skills.map((skill, index) => {
							const Icon = skill.icon;
							return (
								<m.div
									key={skill.name}
									initial={{ opacity: 0, y: 50 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									viewport={{ once: true }}
								>
									<Card variant="hologram" className="h-full">
										<CardHeader className="text-center p-4 sm:p-6">
											<Icon
												className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-3 sm:mb-4 text-primary neon-glow"
												aria-hidden="true"
											/>
											<CardTitle className="font-heading text-primary text-sm sm:text-base">
												{skill.name}
											</CardTitle>
										</CardHeader>
										<CardContent className="p-4 sm:p-6 pt-0">
											<div className="space-y-2">
												<div className="flex justify-between items-center text-xs sm:text-sm font-mono">
													<span>
														Proficiency:{" "}
														<span className="text-accent">
															{skill.proficiencyWord}
														</span>
													</span>
													<span aria-label={`${skill.level} percent`}>
														{skill.level}%
													</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
													<m.div
														className="h-full bg-gradient-to-r from-primary to-secondary neon-border"
														initial={{ width: 0 }}
														whileInView={{ width: `${skill.level}%` }}
														transition={{
															duration: 1,
															delay: index * 0.1 + 0.2,
														}}
														viewport={{ once: true }}
														role="progressbar"
														aria-valuenow={skill.level}
														aria-valuemin={0}
														aria-valuemax={100}
														aria-label={`${skill.name} proficiency: ${skill.level}%`}
													/>
												</div>
											</div>
										</CardContent>
									</Card>
								</m.div>
							);
						})}
					</div>
				</div>
			))}
		</section>
	);
}

// Memoized StatusBar component with proper cleanup
const StatusBar = React.memo(() => {
	const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));

	const animateStats = useCallback(() => {
		stats.forEach((stat, index) => {
			let current = 0;
			const increment = stat.value / 100;
			const timer = setInterval(() => {
				current += increment;
				if (current >= stat.value) {
					current = stat.value;
					clearInterval(timer);
				}
				setAnimatedStats((prev) => {
					const newStats = [...prev];
					newStats[index] = Math.floor(current);
					return newStats;
				});
			}, 20);
		});
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					animateStats();
					observer.disconnect();
				}
			},
			{ threshold: 0.5 }
		);

		const element = document.getElementById("status-bar");
		if (element) {
			observer.observe(element);
		}

		return () => observer.disconnect();
	}, [animateStats]);

	return (
		<section
			id="status-bar"
			className="py-16 sm:py-20 px-4"
			aria-label="Professional statistics"
		>
			<m.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				viewport={{ once: true }}
				className="text-center mb-12 sm:mb-16"
			>
				<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 neon-glow text-primary">
					STATUS_BAR
				</h2>
				<p className="text-base sm:text-lg text-muted-foreground font-mono">
					System performance metrics
				</p>
			</m.div>

			<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
				{stats.map((stat, index) => (
					<m.div
						key={stat.label}
						initial={{ opacity: 0, scale: 0.5 }}
						whileInView={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						viewport={{ once: true }}
						className="lg:col-span-1"
					>
						<Card variant="cyberpunk" className="text-center p-4 sm:p-6 h-full">
							<div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary neon-glow mb-2">
								<span
									aria-label={`${animatedStats[index]}${stat.suffix} ${stat.label}`}
								>
									{animatedStats[index]}
									{stat.suffix}
								</span>
							</div>
							<div className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">
								{stat.label}
							</div>
						</Card>
					</m.div>
				))}
			</div>
		</section>
	);
});
StatusBar.displayName = "StatusBar";

export default function Home() {
	return (
		<LazyMotion features={domMax}>
			<div className="text-foreground selection:bg-accent selection:text-background">
				<Hero />
				<SkillsGrid />
				<StatusBar />
			</div>
		</LazyMotion>
	);
}
