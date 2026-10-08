import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";

interface CyberpunkHeaderProps {
	onTerminalOpen: () => void;
	isMac: boolean;
}

/**
 * The original CyberPunk header: a floating neon card with a terminal-opening
 * logo, the music player, and the fullscreen hamburger menu.
 *
 * Extracted verbatim from Layout so each theme owns its own header file.
 * This theme deliberately keeps no inline page links — the hamburger menu is
 * the navigation, matching the original design.
 */
export default function CyberpunkHeader({
	onTerminalOpen,
	isMac,
}: CyberpunkHeaderProps) {
	return (
		<nav
			className="fixed top-0 left-0 right-0 z-20 p-2 sm:p-3"
			role="navigation"
			aria-label="Main navigation"
		>
			<Card variant="cyberpunk" className="mx-auto max-w-4xl">
				<div className="flex items-center justify-between px-2.5 py-2 sm:px-4 sm:py-3">
					{/* Logo - Opens Terminal instead of navigating */}
					<motion.div
						className="flex items-center space-x-1 sm:space-x-2 cursor-pointer group"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onTerminalOpen}
						role="button"
						tabIndex={0}
						aria-label="Open terminal interface"
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onTerminalOpen();
							}
						}}
					>
						<Terminal
							className="w-5 h-5 sm:w-7 sm:h-7 text-primary neon-glow group-hover:text-secondary transition-colors"
							aria-hidden="true"
						/>
						<span className="text-base sm:text-xl font-heading font-bold neon-glow text-primary group-hover:text-secondary transition-colors">
							PortFolio.sh
						</span>
						<span className="text-xs font-mono text-primary/60 group-hover:text-secondary/60 transition-colors ml-1 sm:ml-2 hidden sm:inline">
							[{isMac ? "Ctrl+Cmd+K" : "Ctrl+Alt+K"}]
						</span>
					</motion.div>

					{/* Right side controls */}
					<div className="flex items-center gap-1 sm:gap-2">
						<div className="relative">
							<GlobalMusicPlayer />
						</div>
						<HamburgerMenu onTerminalOpen={onTerminalOpen} />
					</div>
				</div>
			</Card>
		</nav>
	);
}