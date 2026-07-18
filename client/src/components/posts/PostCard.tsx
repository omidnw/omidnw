import React from "react";
import { Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface PostCardProps {
	post: Post;
	onEdit?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit }) => {
	return (
		<Card className="group relative bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90 border-2 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden backdrop-blur-xl">
			{/* Animated gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

			{/* Glow effect */}
			<div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

			<CardContent className="relative p-6 z-10">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3 font-mono group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">
							{post.title}
						</h3>
						<p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">
							{post.excerpt}
						</p>

						{/* Tags */}
						{post.tags && post.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-4">
								{post.tags.slice(0, 3).map((tag) => (
									<Badge
										key={tag}
										variant="outline"
										className="text-xs border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-mono"
									>
										#{tag}
									</Badge>
								))}
							</div>
						)}

						<div className="flex items-center space-x-4 text-xs font-mono text-gray-500">
							<span className="flex items-center">
								<span className="text-cyan-400 mr-1">●</span>
								Created: {new Date(post.createdAt).toLocaleDateString()}
							</span>
							{post.publishedAt && (
								<span className="flex items-center">
									<span className="text-green-400 mr-1">●</span>
									Published: {new Date(post.publishedAt).toLocaleDateString()}
								</span>
							)}
						</div>
					</div>
					<div className="flex flex-col items-end space-y-2 ml-4">
						<Badge
							className={
								post.isPublished
									? "bg-green-500/20 text-green-400 border border-green-500/30 font-mono shadow-lg shadow-green-500/20"
									: "bg-gray-500/20 text-gray-400 border border-gray-500/30 font-mono"
							}
						>
							{post.isPublished ? "● PUBLISHED" : "○ DRAFT"}
						</Badge>
						{onEdit && (
							<Button
								size="sm"
								variant="outline"
								onClick={() => onEdit(post)}
								className="border-2 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:text-cyan-300 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/30"
							>
								<Edit className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PostCard;
