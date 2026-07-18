import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
	icon: Icon,
	title,
	description,
	action,
	className = "",
}) => {
	return (
		<Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
			<CardContent className="text-center py-12">
				<Icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
				<h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
				{description && <p className="text-gray-400 mb-4">{description}</p>}
				{action && <div className="mt-6">{action}</div>}
			</CardContent>
		</Card>
	);
};

export default EmptyState;
