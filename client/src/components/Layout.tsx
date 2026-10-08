import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
// import { Canvas } from "@react-three/fiber";
// import { Stars, Float } from "@react-three/drei";
import CircuitBackground from "@/components/CircuitBackground";
import CyberpunkTerminal from "@/components/CyberpunkTerminal";
import CyberpunkHeader from "@/components/themes/cyberpunk/CyberpunkHeader";
import ProfessionalHeader from "@/components/themes/professional/ProfessionalHeader";
import { useTheme } from "@/contexts/ThemeContext";

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
	const [isTerminalOpen, setIsTerminalOpen] = useState(false);
	const [isMac, setIsMac] = useState(false);
	const [location] = useLocation();
	const { isProfessional } = useTheme();

	// Read terminal state from localStorage on mount
	useEffect(() => {
		const savedState = localStorage.getItem("terminalState");
		if (savedState === "open") {
			setIsTerminalOpen(true);
		}
	}, []); // Empty dependency array means this runs once on mount

	// Save terminal state to localStorage when it changes
	useEffect(() => {
		if (isTerminalOpen) {
			localStorage.setItem("terminalState", "open");
		} else {
			localStorage.setItem("terminalState", "closed");
			// Alternatively, to remove the item entirely:
			// localStorage.removeItem('terminalState');
		}
	}, [isTerminalOpen]);

	// Scroll to top on route change
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location]);

	// Detect macOS
	useEffect(() => {
		setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
	}, []);

	// Global keyboard shortcut for terminal
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// For macOS: Ctrl+Cmd+K, For others: Ctrl+Alt+K
			const isCorrectCombo = isMac
				? e.ctrlKey && e.metaKey && e.key.toLowerCase() === "k"
				: e.ctrlKey && e.altKey && e.key.toLowerCase() === "k";

			if (isCorrectCombo) {
				e.preventDefault();
				setIsTerminalOpen(true);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isMac]);

	return (
		<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
			<SkipLink />
			<CircuitBackground />
			{isProfessional ? null : <CyberBackground />}
			{isProfessional ? (
				<ProfessionalHeader
					onTerminalOpen={() => setIsTerminalOpen(true)}
				/>
			) : (
				<CyberpunkHeader
					onTerminalOpen={() => setIsTerminalOpen(true)}
					isMac={isMac}
				/>
			)}

			<main
				id="main-content"
				className={`relative z-10 ${
					// The Professional bar is a flush 4rem strip; the CyberPunk
					// header is a floating card that already clears its own space.
					isProfessional ? "pt-(--pf-bar-height)" : "pt-18 sm:pt-22 pb-4 sm:pb-8"
				}`}
			>
				{/* Professional shares one gutter and one max-width with its header
				    (`.pf-shell`), so the multi-page routes line up with the landing
				    page. CyberPunk keeps the original Tailwind `container` untouched. */}
				<div className={isProfessional ? "pf-shell" : "container mx-auto px-2 sm:px-4"}>
					<PageTransition>{children}</PageTransition>
				</div>
			</main>

			{/* Cyberpunk Terminal */}
			<CyberpunkTerminal
				isOpen={isTerminalOpen}
				onClose={() => setIsTerminalOpen(false)}
			/>
		</div>
	);
}
