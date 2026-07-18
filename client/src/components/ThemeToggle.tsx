import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
	const { toggleTheme, isDark, colors } = useTheme();

	return (
		<Button
			onClick={toggleTheme}
			variant="outline"
			size="sm"
			className="relative overflow-hidden border-2 transition-all duration-300"
			style={{
				backgroundColor: colors.background.primary,
				borderColor: isDark
					? "var(--color-electric-city-cyan)66"
					: "var(--color-tech-noir-purple)66",
				color: isDark
					? "var(--color-electric-city-cyan)"
					: "var(--color-tech-noir-purple)",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = colors.background.tertiary;
				e.currentTarget.style.borderColor = isDark
					? "var(--color-electric-city-cyan)"
					: "var(--color-tech-noir-purple)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = colors.background.primary;
				e.currentTarget.style.borderColor = isDark
					? "var(--color-electric-city-cyan)66"
					: "var(--color-tech-noir-purple)66";
			}}
			aria-label="Toggle theme"
		>
			<motion.div
				initial={false}
				animate={{
					rotate: isDark ? 0 : 180,
					scale: isDark ? 1 : 0,
				}}
				transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
				className="absolute inset-0 flex items-center justify-center"
			>
				<Moon className="w-4 h-4" />
			</motion.div>
			<motion.div
				initial={false}
				animate={{
					rotate: isDark ? -180 : 0,
					scale: isDark ? 0 : 1,
				}}
				transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
				className="absolute inset-0 flex items-center justify-center"
			>
				<Sun className="w-4 h-4" />
			</motion.div>
			<span className="opacity-0 w-4 h-4">{/* Spacer for button size */}</span>
		</Button>
	);
};

export default ThemeToggle;
