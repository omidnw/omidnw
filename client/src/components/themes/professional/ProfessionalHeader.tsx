import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import ProfessionalMenu from "@/components/themes/professional/ProfessionalMenu";
import ThemeSwitcher from "@/components/themes/professional/ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { pictureSource } from "@/lib/images";
import { isNavItemActive, navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * The Professional header.
 *
 * A single full-width bar: brand lockup on the left, inline page links in the
 * centre, and the mode toggle plus theme switcher on the right. The inline
 * links appear at `lg` (1024px) rather than only at `xl`, so 1024–1279px
 * visitors keep the full navigation instead of falling back to the menu. At
 * narrower widths the links are dropped and the menu takes over, so every route
 * stays reachable.
 *
 * Horizontal padding comes from `--pf-gutter`, the same token every section
 * uses, so the brand and the nav sit exactly on the content column's left edge
 * at every breakpoint.
 *
 * Deliberately free of the CyberPunk neon utilities (`neon-glow`,
 * `neon-border`, `glitch-text`) — those read as neon glow on every `Button`
 * variant except `outline`, `ghost`, `link` and `destructive`.
 */

const LOGO = pictureSource("/images/ork-logo.png");

/** Past this scroll offset the bar is treated as "stuck" and starts to blur. */
const STUCK_AFTER = 8;

interface ProfessionalHeaderProps {
	onTerminalOpen?: () => void;
}

export default function ProfessionalHeader({
	onTerminalOpen,
}: ProfessionalHeaderProps) {
	const [location] = useLocation();
	const { toggleTheme, isDark } = useTheme();
	const [stuck, setStuck] = useState(false);

	// Scroll position is the only thing the bar's treatment depends on, so it is
	// tracked with a passive listener and a rAF-free threshold comparison rather
	// than a resize observer.
	useEffect(() => {
		const sync = () => setStuck(window.scrollY > STUCK_AFTER);
		sync();
		window.addEventListener("scroll", sync, { passive: true });
		return () => window.removeEventListener("scroll", sync);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300",
				stuck
					? "border-border/80 bg-background/80 backdrop-blur-md backdrop-saturate-150"
					: "border-border bg-background",
			)}
			style={{ boxShadow: stuck ? "var(--pf-bar-glow)" : undefined }}
		>
			<div
				className="pf-shell flex h-(--pf-bar-height) items-center gap-4"
				// The bar's bottom-right corner is rounded in the reference design.
				style={{ borderBottomRightRadius: "0.75rem" }}
			>
				{/* Brand lockup. The name is dropped below `sm` — the wordmark plus
				    the home link already identify the site there, and four controls
				    plus a full name do not fit in 375px. */}
				<Link
					href="/"
					className="pf-focus flex min-h-11 min-w-0 shrink items-center gap-2.5"
					aria-label="Omid Reza Keshtkar — home"
				>
					<picture>
						<source type="image/webp" srcSet={LOGO.srcSet} sizes="56px" />
						<img
							{...LOGO}
							sizes="56px"
							alt="ORK"
							className="h-7 w-auto shrink-0 select-none sm:h-8"
							draggable={false}
						/>
					</picture>
					<span
						className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
						style={{ boxShadow: "0 0 8px 0 hsl(var(--primary) / 0.6)" }}
						aria-hidden="true"
					/>
					<span className="hidden truncate text-sm font-medium text-foreground sm:inline">
						Omid Reza Keshtkar
					</span>
				</Link>

				{/* Page links */}
				<nav
					className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
					aria-label="Main navigation"
				>
					{navigationItems.map((item) => {
						const active = isNavItemActive(location, item.path);
						return (
							<Link
								key={item.path}
								href={item.path}
								aria-current={active ? "page" : undefined}
								className={cn(
									"pf-focus relative rounded-md px-3 py-2 text-sm transition-colors duration-200",
									active
										? "font-medium text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.name}
								{/* One shared element slides between links, so the indicator
								    tracks the active route instead of blinking on mount. */}
								{active ? (
									<motion.span
										layoutId="professional-nav-underline"
										className="absolute inset-x-2.5 -bottom-px h-(--pf-nav-underline) rounded-full bg-primary"
										style={{ boxShadow: "var(--pf-nav-glow)" }}
										aria-hidden="true"
									/>
								) : null}
							</Link>
						);
					})}
				</nav>

				{/* Controls */}
				<div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
					<button
						type="button"
						onClick={toggleTheme}
						aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
						className="pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors duration-200 hover:border-border hover:bg-accent hover:text-accent-foreground"
					>
						{isDark ? (
							<svg
								viewBox="0 0 24 24"
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								aria-hidden="true"
							>
								<circle cx="12" cy="12" r="4" />
								<path
									d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
									strokeLinecap="round"
								/>
							</svg>
						) : (
							<svg
								viewBox="0 0 24 24"
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								aria-hidden="true"
							>
								<path
									d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						)}
					</button>

					<ThemeSwitcher />

					{/* Only needed while the inline links are hidden. */}
					<ProfessionalMenu
						className="lg:hidden"
						onTerminalOpen={onTerminalOpen}
					/>
				</div>
			</div>
		</header>
	);
}