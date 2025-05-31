import React, { Suspense, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
// import { Canvas } from "@react-three/fiber";
// import { Stars, Float } from "@react-three/drei";
import { Card } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";

interface LayoutProps {
	children: React.ReactNode;
}

// Memoized background particles to prevent re-creation on every render
const BackgroundParticles = React.memo(() => {
	const particles = useMemo(
		() =>
			Array.from({ length: 50 }, (_, i) => ({
				id: i,
				left: Math.random() * 100,
				top: Math.random() * 100,
				duration: 3 + Math.random() * 4,
				delay: Math.random() * 2,
			})),
		[]
	);

	return (
		<div className="absolute inset-0" aria-hidden="true">
			{particles.map((particle) => (
				<div
					key={particle.id}
					className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
					style={{
						left: `${particle.left}%`,
						top: `${particle.top}%`,
						animation: `float ${particle.duration}s ease-in-out infinite`,
						animationDelay: `${particle.delay}s`,
					}}
				/>
			))}
		</div>
	);
});
BackgroundParticles.displayName = "BackgroundParticles";

function CyberBackground() {
	return (
		<div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
			{/* CSS-only cyberpunk background */}
			<div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

			{/* Animated grid lines */}
			<div className="absolute inset-0 cyber-grid opacity-20" />

			{/* Scan lines */}
			<div className="absolute inset-0 scan-lines opacity-30" />

			{/* Floating particles */}
			<BackgroundParticles />

			{/* Neon circuit lines */}
			<div className="absolute inset-0 opacity-10">
				<svg
					className="w-full h-full"
					viewBox="0 0 1000 1000"
					aria-hidden="true"
					role="presentation"
				>
					<defs>
						<linearGradient
							id="neonGradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="100%"
						>
							<stop offset="0%" stopColor="#ff00ff" stopOpacity="0.8" />
							<stop offset="50%" stopColor="#00ffff" stopOpacity="0.6" />
							<stop offset="100%" stopColor="#ff00ff" stopOpacity="0.8" />
						</linearGradient>
					</defs>
					<path
						d="M100,100 L300,200 L500,150 L700,300 L900,200"
						stroke="url(#neonGradient)"
						strokeWidth="2"
						fill="none"
						className="animate-pulse"
					/>
					<path
						d="M50,400 L250,500 L450,450 L650,600 L850,500"
						stroke="url(#neonGradient)"
						strokeWidth="2"
						fill="none"
						className="animate-pulse"
						style={{ animationDelay: "1s" }}
					/>
					<path
						d="M150,700 L350,800 L550,750 L750,900 L950,800"
						stroke="url(#neonGradient)"
						strokeWidth="2"
						fill="none"
						className="animate-pulse"
						style={{ animationDelay: "2s" }}
					/>
				</svg>
			</div>

			{/* Glitch overlay */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
			</div>
		</div>
	);
}

function SkipLink() {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all"
		>
			Skip to main content
		</a>
	);
}

const formatTime = (timeInSeconds: number): string => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds % 60);
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
		2,
		"0"
	)}`;
};

function Navigation() {
	return (
		<nav
			className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-4"
			role="navigation"
			aria-label="Main navigation"
		>
			<Card variant="cyberpunk" className="mx-auto max-w-4xl">
				<div className="flex items-center justify-between p-2 sm:p-4">
					{/* Logo */}
					<Link href="/" aria-label="Go to home page">
						<motion.div
							className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Terminal
								className="w-6 h-6 sm:w-8 sm:h-8 text-primary neon-glow"
								aria-hidden="true"
							/>
							<span className="text-lg sm:text-2xl font-heading font-bold neon-glow text-primary">
								PortFolio.sh
							</span>
						</motion.div>
					</Link>

					{/* Right side controls */}
					<div className="flex items-center gap-1 sm:gap-2">
						<div className="relative">
							<GlobalMusicPlayer />
						</div>
						<HamburgerMenu />
					</div>
				</div>
			</Card>
		</nav>
	);
}

const PageTransition = React.memo(
	({ children }: { children: React.ReactNode }) => {
		const [location] = useLocation();

		return (
			<motion.div
				key={location}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.3 }}
				className="w-full"
			>
				{children}
			</motion.div>
		);
	}
);
PageTransition.displayName = "PageTransition";

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
			<SkipLink />
			<CyberBackground />
			<Navigation />

			<main
				id="main-content"
				className="relative z-10 pt-20 sm:pt-24 pb-4 sm:pb-8"
				role="main"
			>
				<div className="container mx-auto px-2 sm:px-4">
					<PageTransition>{children}</PageTransition>
				</div>
			</main>
		</div>
	);
}
