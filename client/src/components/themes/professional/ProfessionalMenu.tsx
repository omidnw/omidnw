import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa";
import { isNavItemActive, navigationItems } from "@/lib/navigation";
import { useSiteTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * Professional-theme mobile menu.
 *
 * A full-screen overlay carrying the same destinations as the CyberPunk menu —
 * the five page links, the Terminal, and the social icons — but rendered in the
 * Professional language: Geist, the mint accent, flat surfaces, no neon, no
 * terminal chrome.
 *
 * Only mounted below the `lg` breakpoint, where the header's inline links are
 * hidden. See ProfessionalHeader.
 */

const socialLinks = [
	{
		name: "GitHub",
		url: "https://github.com/omidnw",
		icon: SiGithub,
		ariaLabel: "Visit GitHub profile",
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/omid-reza-keshtkar",
		icon: FaLinkedinIn,
		ariaLabel: "Visit LinkedIn profile",
	},
	{
		name: "X",
		url: "https://x.com/omidrezakeshtka",
		icon: X,
		ariaLabel: "Visit X profile",
	},
];

interface ProfessionalMenuProps {
	className?: string;
	onTerminalOpen?: () => void;
}

export default function ProfessionalMenu({
	className,
	onTerminalOpen,
}: ProfessionalMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [location] = useLocation();
	const { siteTheme } = useSiteTheme();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	// Close on navigation.
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	// Lock background scroll while open.
	useEffect(() => {
		if (!isOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [isOpen]);

	// Escape closes, and focus returns to the trigger.
	useEffect(() => {
		if (!isOpen) return;
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen]);

	// Move focus into the panel while it is open, and back to the trigger on
	// close, so keyboard and screen-reader users are not left behind it.
	useEffect(() => {
		if (!isOpen) return;
		const trigger = triggerRef.current;
		const panel = panelRef.current;
		panel?.querySelector<HTMLElement>("a, button")?.focus();

		return () => {
			trigger?.focus();
		};
	}, [isOpen]);

	const close = () => setIsOpen(false);

	return (
		<>
			<button
				type="button"
				ref={triggerRef}
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-foreground transition-colors duration-200 hover:border-border hover:bg-accent hover:text-accent-foreground touch-manipulation",
					className,
				)}
				aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
				aria-expanded={isOpen}
			>
				{isOpen ? (
					<X className="h-5 w-5" aria-hidden="true" />
				) : (
					<Menu className="h-5 w-5" aria-hidden="true" />
				)}
			</button>

			{createPortal(
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							// The overlay itself never takes pointer events; the panel below
							// opts back in. AnimatePresence keeps this node mounted while it
							// fades out, and an interactive full-viewport node would swallow
							// every click on the page behind it during that window.
							className="pointer-events-none fixed inset-0 z-[9999] bg-background"
							role="dialog"
							aria-modal="true"
							aria-label="Navigation menu"
						>
							{/* Content */}
							<div
								ref={panelRef}
								// Opts back into pointer events only while open. The panel is a
								// descendant of a pointer-events-none overlay, so its subtree
								// must be re-enabled explicitly — and disabled again the moment
								// the fade-out starts, or the ghost panel keeps intercepting
								// clicks aimed at the page behind it.
								style={{ pointerEvents: isOpen ? "auto" : "none" }}
								className="relative flex h-full flex-col overflow-y-auto px-[var(--pf-gutter)] pb-8 pt-5"
							>
								<div className="mx-auto flex h-full w-full max-w-2xl flex-col">
									{/* Page links */}
									<nav
										className="flex flex-1 flex-col justify-center gap-1 py-10"
										aria-label="Main navigation"
									>
										{navigationItems.map((item, index) => {
											const active = isNavItemActive(location, item.path);
											return (
												<motion.div
													key={item.path}
													initial={{ opacity: 0, y: 12 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.25,
														delay: 0.04 * index,
													}}
												>
													<Link
														href={item.path}
														onClick={close}
														aria-current={active ? "page" : undefined}
														className={cn(
															"pf-focus flex items-baseline gap-4 rounded-lg px-3 py-3 text-3xl font-semibold tracking-tight transition-colors duration-200 sm:text-4xl",
															active
																? "text-primary"
																: "text-foreground hover:text-primary",
														)}
													>
														<span>{item.name}</span>
														{active ? (
															<span
																className="h-[2px] w-8 shrink-0 translate-y-[-0.35em] rounded-full bg-primary"
																style={{
																	boxShadow: "var(--pf-nav-glow)",
																}}
																aria-hidden="true"
															/>
														) : null}
													</Link>
												</motion.div>
											);
										})}

										<motion.div
											initial={{ opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.25, delay: 0.24 }}
											className="mt-4 border-t border-border pt-4"
										>
											<button
												type="button"
												onClick={() => {
													close();
													onTerminalOpen?.();
												}}
												className="pf-focus flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
											>
												<span>Terminal</span>
												<span className="font-mono text-xs text-muted-foreground">
													⌘K
												</span>
											</button>
										</motion.div>
									</nav>

									{/* Social links */}
									<div
										className="border-t border-border pt-5"
										role="group"
										aria-label="Social media links"
									>
										<div className="flex items-center gap-3">
											{socialLinks.map((social) => {
												const Icon = social.icon;
												return (
													<a
														key={social.name}
														href={social.url}
														target="_blank"
														rel="noopener noreferrer"
														aria-label={social.ariaLabel}
														className="pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
													>
														<Icon className="h-4 w-4" aria-hidden="true" />
													</a>
												);
											})}
										</div>
									</div>

									<p className="mt-5 font-mono text-xs text-muted-foreground">
										{siteTheme === "professional"
											? "Professional theme"
											: "CyberPunk theme"}
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body,
			)}
		</>
	);
}