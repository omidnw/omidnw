import { useState, useEffect, useCallback } from "react";

interface Post {
	id: number;
	title: string;
	excerpt: string;
	content: string;
	isPublished: boolean;
	createdAt: string;
	publishedAt: string | null;
	tags?: string[];
}

interface UsePostsDataResult {
	posts: Post[];
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	deletePost: (id: number) => Promise<void>;
	togglePublish: (id: number, isPublished: boolean) => Promise<void>;
}

export const usePostsData = (
	apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>
): UsePostsDataResult => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchPosts = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiCall("/posts");
			const data = await response.json();
			if (data.success) {
				setPosts(data.posts);
			} else {
				throw new Error(data.error || "Failed to fetch posts");
			}
		} catch (err) {
			console.error("Error loading posts:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [apiCall]);

	const deletePost = useCallback(
		async (id: number) => {
			try {
				const response = await apiCall(`/posts/${id}`, {
					method: "DELETE",
				});
				const data = await response.json();
				if (data.success) {
					setPosts((prev) => prev.filter((post) => post.id !== id));
				} else {
					throw new Error(data.error || "Failed to delete post");
				}
			} catch (err) {
				console.error("Error deleting post:", err);
				throw err;
			}
		},
		[apiCall]
	);

	const togglePublish = useCallback(
		async (id: number, isPublished: boolean) => {
			try {
				const response = await apiCall(`/posts/${id}`, {
					method: "PUT",
					body: JSON.stringify({ isPublished }),
				});
				const data = await response.json();
				if (data.success) {
					setPosts((prev) =>
						prev.map((post) =>
							post.id === id ? { ...post, isPublished } : post
						)
					);
				} else {
					throw new Error(data.error || "Failed to update post");
				}
			} catch (err) {
				console.error("Error toggling publish:", err);
				throw err;
			}
		},
		[apiCall]
	);

	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);

	return { posts, loading, error, refetch: fetchPosts, deletePost, togglePublish };
};
