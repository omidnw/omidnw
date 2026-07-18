import React from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardStats {
	totalPosts: number;
	publishedPosts: number;
	totalProjects: number;
	featuredProjects: number;
	lastSyncAt: string | null;
	systemStatus: "online" | "offline" | "maintenance";
}

interface SystemStatusProps {
	stats: DashboardStats;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ stats }) => {
	const { colors, isDark } = useTheme();

	return (
		<Card
			className="relative overflow-hidden border-2 backdrop-blur-xl shadow-xl hover:shadow-xl transition-all duration-300 group"
			style={{
				background:
					"linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))",
				borderColor: "var(--color-border-primary)",
				boxShadow: "0 0 40px var(--color-electric-city-cyan)1A",
			}}
		>
			<div
				className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl"
				style={{ backgroundColor: "var(--color-electric-city-cyan)0D" }}
			></div>
			<CardHeader className="relative z-10">
				<CardTitle className="flex items-center space-x-3">
					<div
						className="p-2 rounded-lg border"
						style={{
							backgroundColor: "var(--color-electric-city-cyan)1A",
							borderColor: "var(--color-electric-city-cyan)4D",
						}}
					>
						<Activity
							className="w-5 h-5 animate-pulse"
							style={{ color: "var(--color-electric-city-cyan)" }}
						/>
					</div>
					<span
						className="font-mono text-lg bg-clip-text text-transparent"
						style={{
							backgroundImage:
								"linear-gradient(to right, var(--color-electric-city-cyan), var(--color-holo-future-blue))",
						}}
					>
						SYSTEM_STATUS
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="relative z-10">
				<div className="space-y-4">
					<div
						className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 group/item"
						style={{
							backgroundColor: colors.background.tertiary,
							borderColor: colors.border.primary,
						}}
					>
						<span
							className="text-sm font-mono flex items-center space-x-2"
							style={{ color: colors.text.tertiary }}
						>
							<div
								className="w-1.5 h-1.5 rounded-full animate-pulse"
								style={{
									backgroundColor: colors.status.success,
									boxShadow: `0 0 4px ${colors.status.success}`,
								}}
							></div>
							<span>Database</span>
						</span>
						<Badge
							className="border font-mono"
							style={{
								backgroundColor: `${colors.status.success}33`,
								color: colors.status.success,
								borderColor: `${colors.status.success}4D`,
							}}
						>
							ONLINE
						</Badge>
					</div>
					<div
						className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 group/item"
						style={{
							backgroundColor: colors.background.tertiary,
							borderColor: colors.border.primary,
						}}
					>
						<span
							className="text-sm font-mono flex items-center space-x-2"
							style={{ color: colors.text.tertiary }}
						>
							<div
								className="w-1.5 h-1.5 rounded-full animate-pulse"
								style={{
									backgroundColor: colors.status.success,
									boxShadow: `0 0 4px ${colors.status.success}`,
								}}
							></div>
							<span>API Server</span>
						</span>
						<Badge
							className="border font-mono"
							style={{
								backgroundColor: `${colors.status.success}33`,
								color: colors.status.success,
								borderColor: `${colors.status.success}4D`,
							}}
						>
							ONLINE
						</Badge>
					</div>
					<div
						className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 group/item"
						style={{
							backgroundColor: colors.background.tertiary,
							borderColor: colors.border.primary,
						}}
					>
						<span
							className="text-sm font-mono flex items-center space-x-2"
							style={{ color: colors.text.tertiary }}
						>
							<div
								className="w-1.5 h-1.5 rounded-full animate-pulse"
								style={{
									backgroundColor: colors.primary.blue,
									boxShadow: `0 0 4px ${colors.primary.blue}`,
								}}
							></div>
							<span>GitHub Sync</span>
						</span>
						<Badge
							className="border font-mono"
							style={{
								backgroundColor: `${colors.primary.blue}33`,
								color: colors.primary.blue,
								borderColor: `${colors.primary.blue}4D`,
							}}
						>
							CONNECTED
						</Badge>
					</div>
					<div
						className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-300"
						style={{
							background: `linear-gradient(to right, ${colors.background.tertiary}, ${colors.background.secondary})`,
							borderColor: colors.border.secondary,
						}}
					>
						<span
							className="text-sm font-mono"
							style={{ color: colors.text.tertiary }}
						>
							Last Sync
						</span>
						<span
							className="text-sm font-mono"
							style={{ color: colors.text.secondary }}
						>
							{stats.lastSyncAt
								? new Date(stats.lastSyncAt).toLocaleString()
								: "Never"}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SystemStatus;
