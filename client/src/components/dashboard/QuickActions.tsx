import React from "react";
import { Link } from "wouter";
import { Plus, Folder, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

const QuickActions: React.FC = () => {
	const { colors, isDark } = useTheme();

	return (
		<Card
			className="relative overflow-hidden border-2 backdrop-blur-xl shadow-xl hover:shadow-xl transition-all duration-300 group"
			style={{
				background:
					"linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))",
				borderColor: "var(--color-border-primary)",
				boxShadow: "0 0 40px var(--color-tech-noir-purple)1A",
			}}
		>
			<div
				className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl"
				style={{ backgroundColor: "var(--color-tech-noir-purple)0D" }}
			></div>
			<CardHeader className="relative z-10">
				<CardTitle className="flex items-center space-x-3">
					<div
						className="p-2 rounded-lg border"
						style={{
							backgroundColor: "var(--color-tech-noir-purple)1A",
							borderColor: "var(--color-tech-noir-purple)4D",
						}}
					>
						<BarChart3
							className="w-5 h-5 animate-pulse"
							style={{ color: "var(--color-tech-noir-purple)" }}
						/>
					</div>
					<span
						className="font-mono text-lg bg-clip-text text-transparent"
						style={{
							backgroundImage:
								"linear-gradient(to right, var(--color-tech-noir-purple), var(--color-neon-pulse-magenta))",
						}}
					>
						QUICK_ACTIONS
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="relative z-10">
				<div className="space-y-5">
					<Link href="/admin/posts">
						<div
							className="w-full px-4 py-5 rounded-lg border transition-colors duration-300 group/item cursor-pointer"
							style={{
								backgroundColor: colors.background.tertiary,
								borderColor: colors.border.primary,
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor =
									"var(--color-electric-city-cyan)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = colors.border.primary;
							}}
						>
							<div className="flex items-center space-x-3">
								<div
									className="p-2 rounded-lg border"
									style={{
										backgroundColor: "var(--color-electric-city-cyan)1A",
										borderColor: "var(--color-electric-city-cyan)4D",
									}}
								>
									<Plus
										className="w-4 h-4"
										style={{ color: "var(--color-electric-city-cyan)" }}
									/>
								</div>
								<span
									className="font-mono text-sm transition-colors"
									style={{ color: colors.text.secondary }}
								>
									Create New Post
								</span>
							</div>
						</div>
					</Link>
					<Link href="/admin/projects">
						<div
							className="w-full px-4 py-5 rounded-lg border transition-colors duration-300 group/item cursor-pointer"
							style={{
								backgroundColor: colors.background.tertiary,
								borderColor: colors.border.primary,
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor =
									"var(--color-tech-noir-purple)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = colors.border.primary;
							}}
						>
							<div className="flex items-center space-x-3">
								<div
									className="p-2 rounded-lg border"
									style={{
										backgroundColor: "var(--color-tech-noir-purple)1A",
										borderColor: "var(--color-tech-noir-purple)4D",
									}}
								>
									<Folder
										className="w-4 h-4"
										style={{ color: "var(--color-tech-noir-purple)" }}
									/>
								</div>
								<span
									className="font-mono text-sm transition-colors"
									style={{ color: colors.text.secondary }}
								>
									Add Project
								</span>
							</div>
						</div>
					</Link>
					<Link href="/admin/github">
						<div
							className="w-full px-4 py-5 rounded-lg border transition-colors duration-300 group/item cursor-pointer"
							style={{
								backgroundColor: colors.background.tertiary,
								borderColor: colors.border.primary,
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = colors.status.success;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = colors.border.primary;
							}}
						>
							<div className="flex items-center space-x-3">
								<div
									className="p-2 rounded-lg border"
									style={{
										backgroundColor: `${colors.status.success}1A`,
										borderColor: `${colors.status.success}4D`,
									}}
								>
									<RefreshCw
										className="w-4 h-4"
										style={{ color: colors.status.success }}
									/>
								</div>
								<span
									className="font-mono text-sm transition-colors"
									style={{ color: colors.text.secondary }}
								>
									Sync GitHub
								</span>
							</div>
						</div>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
};

export default QuickActions;
