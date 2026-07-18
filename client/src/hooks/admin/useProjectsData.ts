import { useState, useEffect, useCallback } from "react";

interface Project {
	id: number;
	title: string;
	description: string;
	isPublished: boolean;
	featured: boolean;
	githubUrl?: string;
	liveUrl?: string;
	technologies?: string[];
	images?: string[];
	createdAt: string;
}

interface UseProjectsDataResult {
	projects: Project[];
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	deleteProject: (id: number) => Promise<void>;
	togglePublish: (id: number, isPublished: boolean) => Promise<void>;
	toggleFeatured: (id: number, featured: boolean) => Promise<void>;
}

export const useProjectsData = (
	apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>
): UseProjectsDataResult => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchProjects = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiCall("/projects");
			const data = await response.json();
			if (data.success) {
				setProjects(data.projects);
			} else {
				throw new Error(data.error || "Failed to fetch projects");
			}
		} catch (err) {
			console.error("Error loading projects:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [apiCall]);

	const deleteProject = useCallback(
		async (id: number) => {
			try {
				const response = await apiCall(`/projects/${id}`, {
					method: "DELETE",
				});
				const data = await response.json();
				if (data.success) {
					setProjects((prev) => prev.filter((project) => project.id !== id));
				} else {
					throw new Error(data.error || "Failed to delete project");
				}
			} catch (err) {
				console.error("Error deleting project:", err);
				throw err;
			}
		},
		[apiCall]
	);

	const togglePublish = useCallback(
		async (id: number, isPublished: boolean) => {
			try {
				const response = await apiCall(`/projects/${id}`, {
					method: "PUT",
					body: JSON.stringify({ isPublished }),
				});
				const data = await response.json();
				if (data.success) {
					setProjects((prev) =>
						prev.map((project) =>
							project.id === id ? { ...project, isPublished } : project
						)
					);
				} else {
					throw new Error(data.error || "Failed to update project");
				}
			} catch (err) {
				console.error("Error toggling publish:", err);
				throw err;
			}
		},
		[apiCall]
	);

	const toggleFeatured = useCallback(
		async (id: number, featured: boolean) => {
			try {
				const response = await apiCall(`/projects/${id}`, {
					method: "PUT",
					body: JSON.stringify({ featured }),
				});
				const data = await response.json();
				if (data.success) {
					setProjects((prev) =>
						prev.map((project) =>
							project.id === id ? { ...project, featured } : project
						)
					);
				} else {
					throw new Error(data.error || "Failed to update project");
				}
			} catch (err) {
				console.error("Error toggling featured:", err);
				throw err;
			}
		},
		[apiCall]
	);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	return {
		projects,
		loading,
		error,
		refetch: fetchProjects,
		deleteProject,
		togglePublish,
		toggleFeatured,
	};
};
