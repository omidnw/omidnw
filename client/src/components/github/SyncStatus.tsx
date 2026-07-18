import React from "react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

interface SyncStatusData {
	lastSyncAt?: string;
	autoSync?: boolean;
	connected?: boolean;
}

interface SyncStatusProps {
	syncStatus: SyncStatusData | null;
	loading: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ syncStatus, loading }) => {
	if (loading) {
		return (
			<Card className="bg-gray-900/50 border-gray-700">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<SiGithub className="w-5 h-5 text-white" />
						<span>Sync Status</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<LoadingSkeleton type="activity-item" count={4} />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-gray-900/50 border-gray-700">
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<SiGithub className="w-5 h-5 text-white" />
					<span>Sync Status</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-400">Connection Status</span>
						<Badge className="bg-green-500/20 text-green-400">Connected</Badge>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-400">Last Sync</span>
						<span className="text-sm text-gray-300">
							{syncStatus?.lastSyncAt
								? new Date(syncStatus.lastSyncAt).toLocaleString()
								: "Never"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-400">Auto Sync</span>
						<Switch checked={syncStatus?.autoSync || false} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SyncStatus;
