import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Folder, Star } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { useStaggerDelay } from "@/hooks/useStaggerAnimation";
import { staggerContainerVariants } from "@/lib/animations";

interface DashboardStats {
	totalPosts: number;
	publishedPosts: number;
	totalProjects: number;
	featuredProjects: number;
	lastSyncAt: string | null;
	systemStatus: "online" | "offline" | "maintenance";
}

interface DashboardStatsGridProps {
	stats: DashboardStats;
	loading: boolean;
}

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
	stats,
	loading,
}) => {
	const statCards = [
		{
			title: "Total Posts",
			value: stats.totalPosts,
			icon: FileText,
			color: "from-electric-city-cyan to-holo-future-blue",
			bgColor: "electric-city-cyan",
			borderColor: "electric-city-cyan",
		},
		{
			title: "Published Posts",
			value: stats.publishedPosts,
			icon: CheckCircle,
			color: "from-urban-jungle-green to-holo-future-green",
			bgColor: "status-success",
			borderColor: "status-success",
		},
		{
			title: "Total Projects",
			value: stats.totalProjects,
			icon: Folder,
			color: "from-tech-noir-purple to-neon-pulse-magenta",
			bgColor: "tech-noir-purple",
			borderColor: "tech-noir-purple",
		},
		{
			title: "Featured Projects",
			value: stats.featuredProjects,
			icon: Star,
			color: "from-cyber-sunset-yellow to-cyber-sunset-orange",
			bgColor: "cyber-sunset-yellow",
			borderColor: "cyber-sunset-yellow",
		},
	];

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300">
				<LoadingSkeleton type="stat-card" count={4} />
			</div>
		);
	}

	return (
		<motion.div
			className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300"
			initial="hidden"
			animate="visible"
			variants={staggerContainerVariants}
		>
			{statCards.map((stat, index) => (
				<StatCard
					key={stat.title}
					title={stat.title}
					value={stat.value}
					icon={stat.icon}
					color={stat.color}
					bgColor={stat.bgColor}
					borderColor={stat.borderColor}
					delay={index * 0.1}
				/>
			))}
		</motion.div>
	);
};

export default DashboardStatsGrid;
