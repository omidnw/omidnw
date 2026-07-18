import React from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import DashboardStatsGrid from "@/components/dashboard/DashboardStats";
import SystemStatus from "@/components/dashboard/SystemStatus";
import QuickActions from "@/components/dashboard/QuickActions";
import { useTheme } from "@/contexts/ThemeContext";

const Dashboard: React.FC = () => {
	const { apiCall } = useAdmin();
	const { stats, loading } = useAdminStats(apiCall);
	const { colors, isDark } = useTheme();

	return (
		<div className="relative space-y-8">
			{/* Animated background effects */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div
					className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
					style={{
						backgroundColor: isDark
							? "var(--color-electric-city-cyan)0D"
							: "var(--color-electric-city-cyan)1A",
					}}
				></div>
				<div
					className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
					style={{
						backgroundColor: isDark
							? "var(--color-tech-noir-purple)0D"
							: "var(--color-tech-noir-purple)1A",
						animationDelay: "1s",
					}}
				></div>
				<div
					className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse"
					style={{
						backgroundColor: isDark
							? "var(--color-neon-pulse-magenta)0D"
							: "var(--color-neon-pulse-magenta)1A",
						animationDelay: "2s",
					}}
				></div>
			</div>

			{/* Header with system status */}
			<div className="relative group">
				<div
					className="absolute -inset-1 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"
					style={{
						background:
							"linear-gradient(to right, var(--color-electric-city-cyan)33, var(--color-tech-noir-purple)33, var(--color-neon-pulse-magenta)33)",
					}}
				></div>
				<div
					className="relative flex items-center justify-between p-8 rounded-2xl backdrop-blur-xl overflow-hidden border-2"
					style={{
						background:
							"linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))",
						borderColor: "var(--color-border-primary)",
						boxShadow: "0 0 40px var(--color-electric-city-cyan)1A",
					}}
				>
					{/* Animated gradient overlay */}
					<div
						className="absolute inset-0 rounded-2xl"
						style={{
							background:
								"linear-gradient(to right, var(--color-electric-city-cyan)0D, var(--color-tech-noir-purple)1A, var(--color-neon-pulse-magenta)0D)",
						}}
					></div>

					{/* Animated grid pattern */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
								`<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-electric-city-cyan)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>`
							)}")`,
							backgroundSize: "40px 40px",
						}}
					></div>

					<div className="relative z-10">
						<h1
							className="text-5xl font-bold bg-clip-text text-transparent font-mono mb-3 tracking-tight"
							style={{
								backgroundImage:
									"linear-gradient(to right, var(--color-electric-city-cyan), var(--color-tech-noir-purple), var(--color-neon-pulse-magenta))",
							}}
						>
							DASHBOARD_OVERVIEW
						</h1>
						<p
							className="font-mono text-sm tracking-wide flex items-center"
							style={{ color: colors.text.secondary }}
						>
							<span
								style={{ color: "var(--color-electric-city-cyan)" }}
								className="mr-2"
							>
								▸
							</span>
							System status and analytics
						</p>
					</div>
					<div
						className="relative z-10 flex items-center space-x-3 px-6 py-3 rounded-xl backdrop-blur-sm border-2 shadow-lg"
						style={{
							backgroundColor: colors.background.card,
							borderColor: "var(--color-status-success)66",
							boxShadow: "0 0 20px var(--color-status-success)33",
						}}
					>
						<div className="relative">
							<div
								className="w-3 h-3 rounded-full animate-pulse"
								style={{ backgroundColor: colors.status.success }}
							></div>
							<div
								className="absolute inset-0 w-3 h-3 rounded-full animate-ping"
								style={{ backgroundColor: colors.status.success }}
							></div>
						</div>
						<span
							className="text-sm font-mono font-bold tracking-widest"
							style={{ color: colors.status.success }}
						>
							SYSTEM_ONLINE
						</span>
					</div>
				</div>
			</div>

			{/* Stats grid */}
			<div className="relative">
				<DashboardStatsGrid stats={stats} loading={loading} />
			</div>

			{/* System status and quick actions */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
				<div className="relative group">
					<div
						className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
						style={{
							background:
								"linear-gradient(to right, var(--color-electric-city-cyan)33, var(--color-holo-future-blue)33)",
						}}
					></div>
					<div className="relative">
						<SystemStatus stats={stats} />
					</div>
				</div>
				<div className="relative group">
					<div
						className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
						style={{
							background:
								"linear-gradient(to right, var(--color-tech-noir-purple)33, var(--color-neon-pulse-magenta)33)",
						}}
					></div>
					<div className="relative">
						<QuickActions />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
