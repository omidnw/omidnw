import { useState, useEffect, useCallback } from "react";

interface DashboardStats {
	totalPosts: number;
	publishedPosts: number;
	totalProjects: number;
	featuredProjects: number;
	lastSyncAt: string | null;
	systemStatus: "online" | "offline" | "maintenance";
}

interface UseAdminStatsResult {
	stats: DashboardStats;
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export const useAdminStats = (
	apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>
): UseAdminStatsResult => {
	const [stats, setStats] = useState<DashboardStats>({
		totalPosts: 0,
		publishedPosts: 0,
		totalProjects: 0,
		featuredProjects: 0,
		lastSyncAt: null,
		systemStatus: "online",
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiCall("/stats");
			const data = await response.json();
			if (data.success) {
				setStats(data.stats);
			} else {
				throw new Error(data.error || "Failed to fetch stats");
			}
		} catch (err) {
			console.error("Error loading stats:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [apiCall]);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return { stats, loading, error, refetch: fetchStats };
};
