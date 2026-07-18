import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { statCardVariants, hoverScaleVariants } from "@/lib/animations";

interface StatCardProps {
	title: string;
	value: number | string;
	icon: LucideIcon;
	color: string;
	bgColor: string;
	borderColor: string;
	loading?: boolean;
	delay?: number;
	trend?: {
		value: number;
		direction: "up" | "down";
	};
}

const StatCard: React.FC<StatCardProps> = React.memo(
	({
		title,
		value,
		icon: Icon,
		color,
		bgColor,
		borderColor,
		loading = false,
		delay = 0,
		trend,
	}) => {
		const { colors, isDark } = useTheme();

		// Use animated counter for numeric values
		const numericValue = typeof value === "number" ? value : 0;
		const shouldAnimate = typeof value === "number" && !loading;
		const animatedValue = useCountAnimation(numericValue, 2000, shouldAnimate);
		const displayValue = shouldAnimate ? animatedValue : value;

		// Map color names to CSS variables
		const getColorVar = (colorName: string) => `var(--color-${colorName})`;
		const bgColorVar = getColorVar(bgColor);
		const borderColorVar = getColorVar(borderColor);

		return (
			<motion.div
				custom={delay}
				initial="hidden"
				animate="visible"
				variants={statCardVariants}
				whileHover="hover"
				className="group relative"
			>
				{/* Glow effect */}
				<div
					className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
					style={{
						background: `linear-gradient(to right, ${bgColorVar}33, ${borderColorVar}33)`,
					}}
				></div>

				<Card
					className="relative border-2 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
					style={{
						backgroundColor: colors.background.card,
						borderColor: `${borderColorVar}33`,
					}}
				>
					{/* Animated gradient overlay */}
					<div
						className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
						style={{
							background: isDark
								? "linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent)"
								: "linear-gradient(to bottom right, rgba(0, 0, 0, 0.05), transparent)",
						}}
					></div>

					{/* Subtle background gradient */}
					<div
						className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
						style={{
							background: `linear-gradient(to bottom right, ${bgColorVar}, ${borderColorVar})`,
						}}
					></div>

					{/* Animated shine effect */}
					<motion.div
						className="absolute inset-0"
						style={{
							background: `linear-gradient(to right, transparent, ${
								isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
							}, transparent)`,
						}}
						animate={{
							x: ["-100%", "200%"],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							repeatDelay: 5,
							ease: "linear",
						}}
					/>

					<CardContent className="relative p-6 z-10">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p
									className="text-xs font-bold uppercase tracking-widest font-mono mb-3 transition-colors duration-300"
									style={{ color: colors.text.tertiary }}
								>
									{title}
								</p>
								<motion.p
									className="text-4xl font-bold bg-clip-text text-transparent font-mono tabular-nums"
									style={{
										backgroundImage: `linear-gradient(to right, ${bgColorVar}, ${borderColorVar})`,
									}}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{
										delay: delay + 0.2,
										type: "spring",
										stiffness: 200,
									}}
								>
									{loading ? "—" : displayValue}
								</motion.p>

								{/* Trend indicator */}
								{trend && !loading && (
									<motion.div
										className="flex items-center mt-2 space-x-1"
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: delay + 0.4 }}
									>
										{trend.direction === "up" ? (
											<TrendingUp
												className="w-4 h-4"
												style={{ color: colors.status.success }}
											/>
										) : (
											<TrendingDown
												className="w-4 h-4"
												style={{ color: colors.status.error }}
											/>
										)}
										<span
											className="text-xs font-mono font-bold"
											style={{
												color:
													trend.direction === "up"
														? colors.status.success
														: colors.status.error,
											}}
										>
											{trend.value > 0 ? "+" : ""}
											{trend.value}%
										</span>
									</motion.div>
								)}
							</div>
							<motion.div
								className="relative p-4 rounded-2xl border-2 shadow-lg transition-all duration-300"
								style={{
									backgroundColor: `${bgColorVar}1A`,
									borderColor: `${borderColorVar}33`,
									boxShadow: `0 0 20px ${bgColorVar}1A`,
								}}
								whileHover={{
									scale: 1.1,
									rotate: [0, -5, 5, 0],
									boxShadow: `0 0 30px ${bgColorVar}33`,
								}}
								transition={{ duration: 0.3 }}
							>
								{/* Gradient background for icon */}
								<div
									className="absolute inset-0 opacity-20 rounded-2xl"
									style={{
										background: `linear-gradient(to bottom right, ${bgColorVar}, ${borderColorVar})`,
									}}
								></div>

								{/* Pulsing glow effect */}
								<motion.div
									className="absolute inset-0 rounded-2xl"
									style={{
										background: `radial-gradient(circle, ${bgColorVar}33, transparent)`,
									}}
									animate={{
										opacity: [0.3, 0.6, 0.3],
										scale: [1, 1.1, 1],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								/>

								<Icon className="w-8 h-8 text-white relative z-10" />
							</motion.div>
						</div>

						{/* Progress indicator */}
						<div
							className="mt-4 h-1 rounded-full overflow-hidden"
							style={{ backgroundColor: colors.background.tertiary }}
						>
							<motion.div
								className="h-full"
								style={{
									background: `linear-gradient(to right, ${bgColorVar}, ${borderColorVar})`,
								}}
								initial={{ width: "0%" }}
								animate={{ width: loading ? "50%" : "100%" }}
								transition={{
									delay: delay + 0.3,
									duration: 1,
									ease: "easeOut",
								}}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}
);

StatCard.displayName = "StatCard";

export default StatCard;
