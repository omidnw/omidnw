import React from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "./PostCard";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";

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

interface PostsListProps {
	posts: Post[];
	loading: boolean;
	onCreateClick: () => void;
	onEditPost?: (post: Post) => void;
}

const PostsList: React.FC<PostsListProps> = ({
	posts,
	loading,
	onCreateClick,
	onEditPost,
}) => {
	return (
		<div className="space-y-6 relative">
			{/* Background effects */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
			</div>

			{/* Header */}
			<div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90 border border-cyan-500/20 backdrop-blur-xl">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent rounded-2xl"></div>
				<div className="relative z-10 flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-mono mb-2">
							POSTS_MANAGEMENT
						</h1>
						<p className="text-gray-400 font-mono text-sm tracking-wide">
							Manage and publish your blog content
						</p>
					</div>
					<Button
						onClick={onCreateClick}
						className="relative bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all duration-300 font-mono border-0 overflow-hidden group"
					>
						<span className="relative z-10 flex items-center">
							<Plus className="w-4 h-4 mr-2" />
							Create Post
						</span>
						{/* Dark overlay for better text contrast */}
						<div className="absolute inset-0 bg-black/20"></div>
					</Button>
				</div>
			</div>

			{/* Posts list */}
			<div className="space-y-4">
				{loading ? (
					<LoadingSkeleton type="post-card" count={3} className="space-y-4" />
				) : posts.length === 0 ? (
					<EmptyState
						icon={FileText}
						title="No posts yet"
						description="Create your first post to get started!"
						action={
							<Button
								onClick={onCreateClick}
								className="relative bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] border-0 overflow-hidden"
							>
								<span className="relative z-10 flex items-center">
									<Plus className="w-4 h-4 mr-2" />
									Create Post
								</span>
								<div className="absolute inset-0 bg-black/20"></div>
							</Button>
						}
					/>
				) : (
					posts.map((post) => (
						<PostCard key={post.id} post={post} onEdit={onEditPost} />
					))
				)}
			</div>
		</div>
	);
};

export default PostsList;
