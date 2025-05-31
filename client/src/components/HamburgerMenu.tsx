import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Home,
	User,
	Briefcase,
	BookOpen,
	Mail,
	Github,
	Linkedin,
	Twitter,
	Menu,
	X,
} from "lucide-react";

const navigationItems = [
	{ name: "Home", path: "/", icon: Home },
	{ name: "About", path: "/about", icon: User },
	{ name: "Projects", path: "/projects", icon: Briefcase },
	{ name: "Blog", path: "/blog", icon: BookOpen },
	{ name: "Contact", path: "/contact", icon: Mail },
];

const socialLinks = [
	{
		name: "GitHub",
		url: "https://github.com/omidnw",
		icon: Github,
		ariaLabel: "Visit GitHub profile",
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/omid-reza-keshtkar",
		icon: Linkedin,
		ariaLabel: "Visit LinkedIn profile",
	},
	{
		name: "X",
		url: "https://x.com/omidrezakeshtka",
		icon: Twitter,
		ariaLabel: "Visit X profile",
	},
];

interface HamburgerMenuProps {
	className?: string;
}

export default function HamburgerMenu({ className = "" }: HamburgerMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [location] = useLocation();

	// Close menu when route changes
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	// Prevent body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	return (
		<>
			{/* Hamburger Button */}
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleMenu}
				className={`relative z-[60] w-8 h-8 sm:w-10 sm:h-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 touch-manipulation ${className}`}
				aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
				aria-expanded={isOpen}
			>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.3 }}
				>
					{isOpen ? (
						<X className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
					) : (
						<Menu className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
					)}
				</motion.div>
			</Button>

			{/* Fullscreen Overlay Menu using Portal */}
			{createPortal(
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg"
							style={{
								position: "fixed",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								width: "100vw",
								height: "100vh",
							}}
							onClick={() => setIsOpen(false)}
						>
							{/* Enhanced Background Effects */}
							<div
								className="absolute inset-0 overflow-hidden"
								aria-hidden="true"
							>
								{/* Animated grid */}
								<div className="absolute inset-0 cyber-grid opacity-20" />

								{/* Scan lines */}
								<div className="absolute inset-0 scan-lines opacity-40" />

								{/* Matrix rain effect */}
								<div className="absolute inset-0 opacity-10">
									{Array.from({ length: 20 }).map((_, i) => (
										<motion.div
											key={i}
											className="absolute text-primary font-mono text-xs"
											style={{
												left: `${Math.random() * 100}%`,
												top: `-10%`,
											}}
											animate={{
												y: ["0vh", "110vh"],
											}}
											transition={{
												duration: Math.random() * 3 + 2,
												repeat: Infinity,
												delay: Math.random() * 2,
											}}
										>
											{Array.from({ length: 10 }).map((_, j) => (
												<div key={j} className="block">
													{Math.floor(Math.random() * 2)}
												</div>
											))}
										</motion.div>
									))}
								</div>

								{/* Neon circuit lines */}
								<div className="absolute inset-0 opacity-15">
									<svg className="w-full h-full" viewBox="0 0 1000 1000">
										<defs>
											<linearGradient
												id="menuGradient"
												x1="0%"
												y1="0%"
												x2="100%"
												y2="100%"
											>
												<stop offset="0%" stopColor="#ff0080" stopOpacity="1" />
												<stop
													offset="25%"
													stopColor="#00ffff"
													stopOpacity="0.8"
												/>
												<stop
													offset="50%"
													stopColor="#ffff00"
													stopOpacity="0.6"
												/>
												<stop
													offset="75%"
													stopColor="#ff0080"
													stopOpacity="0.8"
												/>
												<stop
													offset="100%"
													stopColor="#00ffff"
													stopOpacity="1"
												/>
											</linearGradient>
											<filter id="glow">
												<feGaussianBlur stdDeviation="3" result="coloredBlur" />
												<feMerge>
													<feMergeNode in="coloredBlur" />
													<feMergeNode in="SourceGraphic" />
												</feMerge>
											</filter>
										</defs>
										<path
											d="M0,200 Q250,100 500,200 T1000,200"
											stroke="url(#menuGradient)"
											strokeWidth="2"
											fill="none"
											filter="url(#glow)"
											className="animate-pulse"
										/>
										<path
											d="M0,400 Q250,300 500,400 T1000,400"
											stroke="url(#menuGradient)"
											strokeWidth="2"
											fill="none"
											filter="url(#glow)"
											className="animate-pulse"
											style={{ animationDelay: "1s" }}
										/>
										<path
											d="M0,600 Q250,500 500,600 T1000,600"
											stroke="url(#menuGradient)"
											strokeWidth="2"
											fill="none"
											filter="url(#glow)"
											className="animate-pulse"
											style={{ animationDelay: "2s" }}
										/>
									</svg>
								</div>

								{/* Glitch overlay */}
								<motion.div
									className="absolute inset-0 pointer-events-none"
									animate={{
										opacity: [0, 0.1, 0, 0.05, 0],
									}}
									transition={{
										duration: 4,
										repeat: Infinity,
										times: [0, 0.1, 0.2, 0.8, 1],
									}}
								>
									<div className="w-full h-full bg-gradient-to-r from-red-500/20 via-transparent to-cyan-500/20" />
								</motion.div>
							</div>

							{/* Close Button - Top Right */}
							<motion.button
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3, delay: 0.2 }}
								onClick={() => setIsOpen(false)}
								className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[10001] group touch-manipulation"
								aria-label="Close menu"
							>
								<div className="relative">
									<div className="absolute inset-0 bg-red-500/20 rounded-lg blur group-hover:bg-red-500/40 transition-all duration-300" />
									<div className="relative bg-background/80 border border-red-500 rounded-lg p-2 sm:p-3 group-hover:border-red-400 group-hover:bg-red-500/10 transition-all duration-300">
										<X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-400" />
									</div>
								</div>
								<span className="absolute -bottom-6 sm:-bottom-8 right-0 text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
									ESC
								</span>
							</motion.button>

							{/* Menu Content */}
							<motion.div
								initial={{ scale: 0.8, y: 50, opacity: 0 }}
								animate={{ scale: 1, y: 0, opacity: 1 }}
								exit={{ scale: 0.8, y: 50, opacity: 0 }}
								transition={{
									duration: 0.4,
									delay: 0.1,
									type: "spring",
									stiffness: 100,
								}}
								className="relative z-[10000] h-full flex items-center justify-center p-4 sm:p-8"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="relative w-full max-w-sm sm:max-w-lg mx-auto">
									{/* Terminal-style container */}
									<div className="relative bg-background/90 border border-primary/50 rounded-lg backdrop-blur-md overflow-hidden">
										{/* Terminal header */}
										<div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/30 px-4 sm:px-6 py-2 sm:py-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
													<div
														className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse"
														style={{ animationDelay: "0.2s" }}
													/>
													<div
														className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"
														style={{ animationDelay: "0.4s" }}
													/>
												</div>
												<span className="text-xs font-mono text-primary hidden sm:block">
													NEURAL_INTERFACE_v2.077
												</span>
												<span className="text-xs font-mono text-primary sm:hidden">
													v2.077
												</span>
											</div>
										</div>

										<div className="p-4 sm:p-8">
											{/* Navigation Section */}
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: 0.3 }}
												className="mb-6 sm:mb-8"
											>
												<div className="text-center mb-4 sm:mb-6">
													<motion.h2
														className="text-lg sm:text-2xl font-heading font-bold text-primary neon-glow mb-2"
														animate={{
															textShadow: [
																"0 0 10px #ff0080",
																"0 0 20px #ff0080, 0 0 30px #ff0080",
																"0 0 10px #ff0080",
															],
														}}
														transition={{ duration: 2, repeat: Infinity }}
													>
														&gt; NAVIGATION.sh
													</motion.h2>
													<div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
												</div>

												<nav
													className="space-y-2"
													role="navigation"
													aria-label="Main navigation"
												>
													{navigationItems.map((item, index) => {
														const Icon = item.icon;
														const isActive = location === item.path;
														return (
															<motion.div
																key={item.path}
																initial={{ opacity: 0, x: -30 }}
																animate={{ opacity: 1, x: 0 }}
																transition={{
																	duration: 0.4,
																	delay: 0.4 + index * 0.1,
																	type: "spring",
																	stiffness: 100,
																}}
															>
																<Link href={item.path}>
																	<button
																		className={`w-full flex items-center justify-start px-3 sm:px-4 py-3 sm:py-4 rounded-md font-mono text-left transition-all duration-300 group min-h-[48px] touch-manipulation ${
																			isActive
																				? "bg-primary/20 border border-primary text-primary shadow-lg shadow-primary/25"
																				: "bg-background/50 border border-border hover:border-primary/50 hover:bg-primary/10 text-foreground hover:text-primary"
																		}`}
																		aria-current={isActive ? "page" : undefined}
																	>
																		<span className="mr-2 sm:mr-3 text-sm sm:text-lg">
																			&gt;
																		</span>
																		<Icon
																			className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:scale-110 transition-transform flex-shrink-0"
																			aria-hidden="true"
																		/>
																		<span className="flex-1 text-sm sm:text-base">
																			{item.name.toUpperCase()}
																		</span>
																		{isActive && (
																			<span className="text-xs opacity-60 hidden sm:inline">
																				ACTIVE
																			</span>
																		)}
																		{isActive && (
																			<span className="text-xs opacity-60 sm:hidden">
																				•
																			</span>
																		)}
																	</button>
																</Link>
															</motion.div>
														);
													})}
												</nav>
											</motion.div>

											{/* Social Links Section */}
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: 0.9 }}
												className="pt-4 sm:pt-6 border-t border-primary/30"
											>
												<div className="text-center mb-3 sm:mb-4">
													<h3 className="text-base sm:text-lg font-heading font-bold text-secondary mb-2">
														&gt; CONNECT.social()
													</h3>
													<div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
												</div>

												<div
													className="flex justify-center space-x-3 sm:space-x-4"
													role="group"
													aria-label="Social media links"
												>
													{socialLinks.map((social, index) => {
														const Icon = social.icon;
														return (
															<motion.div
																key={social.name}
																initial={{
																	opacity: 0,
																	scale: 0.5,
																	rotate: 180,
																}}
																animate={{ opacity: 1, scale: 1, rotate: 0 }}
																transition={{
																	duration: 0.5,
																	delay: 1.0 + index * 0.1,
																	type: "spring",
																	stiffness: 100,
																}}
															>
																<motion.a
																	href={social.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	aria-label={social.ariaLabel}
																	whileHover={{ scale: 1.2, rotate: 10 }}
																	whileTap={{ scale: 0.9 }}
																	className="group relative block touch-manipulation"
																>
																	<div className="absolute inset-0 bg-secondary/20 rounded-lg blur group-hover:bg-secondary/40 transition-all duration-300" />
																	<div className="relative bg-background/80 border border-secondary rounded-lg p-2 sm:p-3 group-hover:border-secondary/80 group-hover:bg-secondary/10 transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center">
																		<Icon
																			className="w-4 h-4 sm:w-5 sm:h-5 text-secondary group-hover:text-secondary/80"
																			aria-hidden="true"
																		/>
																	</div>
																</motion.a>
															</motion.div>
														);
													})}
												</div>
											</motion.div>
										</div>
									</div>

									{/* Terminal prompt */}
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3, delay: 1.2 }}
										className="mt-3 sm:mt-4 text-center px-2"
									>
										<span className="font-mono text-xs text-muted-foreground">
											Press <span className="text-red-500 font-bold">ESC</span>{" "}
											or tap outside to exit
										</span>
									</motion.div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}
		</>
	);
}
