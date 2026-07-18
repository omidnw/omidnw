import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type SkeletonType =
	| "stat-card"
	| "post-card"
	| "project-card"
	| "table-row"
	| "activity-item"
	| "form";

interface LoadingSkeletonProps {
	type: SkeletonType;
	count?: number;
	className?: string;
}

const StatCardSkeleton = () => (
	<Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-2 border-gray-700/50 backdrop-blur-xl animate-pulse">
		<div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-shimmer"></div>
		<CardContent className="p-6 relative z-10">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Skeleton className="h-4 w-24 mb-2 bg-gray-800/80 rounded" />
					<Skeleton className="h-8 w-16 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded" />
				</div>
				<Skeleton className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-800/80 to-gray-700/80" />
			</div>
		</CardContent>
	</Card>
);

const PostCardSkeleton = () => (
	<Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-2 border-gray-700/50 backdrop-blur-xl animate-pulse">
		<div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer"></div>
		<CardContent className="p-6 relative z-10">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<Skeleton className="h-6 w-3/4 mb-2 bg-gray-800/80 rounded" />
					<Skeleton className="h-4 w-full mb-2 bg-gray-800/80 rounded" />
					<Skeleton className="h-4 w-2/3 mb-4 bg-gray-800/80 rounded" />
					<div className="flex items-center space-x-4">
						<Skeleton className="h-3 w-24 bg-gray-800/80 rounded" />
						<Skeleton className="h-3 w-24 bg-gray-800/80 rounded" />
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Skeleton className="h-6 w-20 rounded-full bg-gray-800/80" />
					<Skeleton className="h-8 w-8 rounded bg-gray-800/80" />
				</div>
			</div>
		</CardContent>
	</Card>
);

const ProjectCardSkeleton = () => (
	<Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-2 border-gray-700/50 backdrop-blur-xl animate-pulse">
		<div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent animate-shimmer"></div>
		<CardContent className="p-6 relative z-10">
			<div className="flex items-start justify-between mb-4">
				<Skeleton className="h-6 w-1/2 bg-gray-800/80 rounded" />
				<div className="flex items-center space-x-2">
					<Skeleton className="h-6 w-20 rounded-full bg-gray-800/80" />
					<Skeleton className="h-6 w-20 rounded-full bg-gray-800/80" />
				</div>
			</div>
			<Skeleton className="h-4 w-full mb-2 bg-gray-800/80 rounded" />
			<Skeleton className="h-4 w-5/6 mb-4 bg-gray-800/80 rounded" />
			<div className="flex items-center space-x-4 mb-4">
				<Skeleton className="h-3 w-20 bg-gray-800/80 rounded" />
				<Skeleton className="h-3 w-20 bg-gray-800/80 rounded" />
			</div>
			<div className="flex items-center justify-between">
				<div className="flex flex-wrap gap-2">
					<Skeleton className="h-5 w-16 rounded-full bg-gray-800/80" />
					<Skeleton className="h-5 w-16 rounded-full bg-gray-800/80" />
					<Skeleton className="h-5 w-16 rounded-full bg-gray-800/80" />
				</div>
				<Skeleton className="h-8 w-8 rounded bg-gray-800/80" />
			</div>
		</CardContent>
	</Card>
);

const TableRowSkeleton = () => (
	<div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg">
		<div className="flex-1 space-y-2">
			<Skeleton className="h-4 w-3/4 bg-gray-800" />
			<Skeleton className="h-3 w-1/2 bg-gray-800" />
		</div>
		<div className="flex items-center space-x-2">
			<Skeleton className="h-6 w-20 rounded-full bg-gray-800" />
			<Skeleton className="h-8 w-8 rounded bg-gray-800" />
		</div>
	</div>
);

const ActivityItemSkeleton = () => (
	<div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
		<div className="flex items-center space-x-3">
			<Skeleton className="w-2 h-2 rounded-full bg-gray-700" />
			<Skeleton className="h-4 w-48 bg-gray-700" />
		</div>
		<Skeleton className="h-3 w-24 bg-gray-700" />
	</div>
);

const FormSkeleton = () => (
	<div className="space-y-6">
		<div className="space-y-2">
			<Skeleton className="h-4 w-24 bg-gray-800" />
			<Skeleton className="h-10 w-full bg-gray-800" />
		</div>
		<div className="space-y-2">
			<Skeleton className="h-4 w-24 bg-gray-800" />
			<Skeleton className="h-10 w-full bg-gray-800" />
		</div>
		<div className="space-y-2">
			<Skeleton className="h-4 w-24 bg-gray-800" />
			<Skeleton className="h-32 w-full bg-gray-800" />
		</div>
		<div className="flex space-x-2">
			<Skeleton className="h-10 w-32 bg-gray-800" />
			<Skeleton className="h-10 w-32 bg-gray-800" />
		</div>
	</div>
);

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
	type,
	count = 1,
	className = "",
}) => {
	const skeletonMap: Record<SkeletonType, React.ReactNode> = {
		"stat-card": <StatCardSkeleton />,
		"post-card": <PostCardSkeleton />,
		"project-card": <ProjectCardSkeleton />,
		"table-row": <TableRowSkeleton />,
		"activity-item": <ActivityItemSkeleton />,
		form: <FormSkeleton />,
	};

	const skeleton = skeletonMap[type];

	if (count === 1) {
		return <div className={className}>{skeleton}</div>;
	}

	return (
		<div className={className}>
			{Array.from({ length: count }).map((_, index) => (
				<React.Fragment key={index}>{skeleton}</React.Fragment>
			))}
		</div>
	);
};

export default LoadingSkeleton;
