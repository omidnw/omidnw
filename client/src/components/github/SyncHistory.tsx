import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SyncHistoryEntry {
	success: boolean;
	message: string;
	timestamp: string;
}

interface SyncHistoryProps {
	history: SyncHistoryEntry[];
}

const SyncHistory: React.FC<SyncHistoryProps> = ({ history }) => {
	return (
		<Card className="bg-gray-900/50 border-gray-700">
			<CardHeader>
				<CardTitle>Recent Sync Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{history?.length > 0 ? (
						history.map((entry, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
							>
								<div className="flex items-center space-x-3">
									<div
										className={`w-2 h-2 rounded-full ${
											entry.success ? "bg-green-400" : "bg-red-400"
										}`}
									></div>
									<span className="text-sm">{entry.message}</span>
								</div>
								<span className="text-xs text-gray-500">
									{new Date(entry.timestamp).toLocaleString()}
								</span>
							</div>
						))
					) : (
						<p className="text-gray-400 text-center py-8">
							No sync history available
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default SyncHistory;
