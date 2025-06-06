import React, { useState, useEffect } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	X,
	Calendar,
	Clock,
	User,
	Tag,
	BookOpen,
	ExternalLink,
	AlertCircle,
} from "lucide-react";

// GitHub API integration & data types
import {
	fetchBlogPostBySlug,
	isGitHubConfigured,
	BlogPostData,
} from "@/lib/github-api";

// Local blogs loader
import { loadLocalBlogPostById } from "@/lib/local-blogs";

// Enhanced markdown processor
import {
	processMarkdown,
	addCyberpunkAnimations,
} from "@/lib/markdown-processor";

import ImageModal from "@/components/ImageModal";

interface BlogPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	blogId: string;
}

export default function BlogPostModal({
	isOpen,
	onClose,
	blogId,
}: BlogPostModalProps) {
	const [post, setPost] = useState<BlogPostData | null>(null);
	const [processedContent, setProcessedContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

	const handleImageClick = (imageUrl: string) => {
		console.log("Image clicked in BlogPostModal:", imageUrl);
		setSelectedImageUrl(imageUrl);
		setIsImageModalOpen(true);
	};

	useEffect(() => {
		if (!isOpen || !blogId) return;

		const loadPost = async () => {
			setLoading(true);
			setError(null);
			setProcessedContent("");

			try {
				let loadedPost: BlogPostData | null = null;

				if (isGitHubConfigured()) {
					try {
						loadedPost = await fetchBlogPostBySlug(blogId);
					} catch (githubError) {
						console.warn(
							`GitHub blog fetch failed for ${blogId}:`,
							githubError
						);
						loadedPost = await loadLocalBlogPostById(blogId);
					}
				} else {
					loadedPost = await loadLocalBlogPostById(blogId);
				}

				setPost(loadedPost);

				if (loadedPost?.content) {
					try {
						const html = await processMarkdown(loadedPost.content);
						setProcessedContent(addCyberpunkAnimations(html));
					} catch (markdownError) {
						console.warn("Failed to process markdown:", markdownError);
						setProcessedContent(loadedPost.content);
					}
				}
			} catch (error) {
				console.error("Error loading blog post:", error);
				setError("Failed to load blog post.");
				setPost(null);
			} finally {
				setLoading(false);
			}
		};

		loadPost();
	}, [isOpen, blogId]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			return () => document.removeEventListener("keydown", handleEscape);
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<LazyMotion features={domMax}>
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
							onClick={onClose}
						/>

						{/* Modal */}
						<m.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
						>
							<Card
								variant="cyberpunk"
								className="h-full flex flex-col bg-background/95 backdrop-blur-md border-primary/30"
							>
								{/* Header */}
								<div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary/30">
									<div className="flex items-center gap-2">
										<BookOpen className="w-5 h-5 text-primary" />
										<span className="font-heading font-bold text-primary">
											BLOG_READER.terminal
										</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={onClose}
										className="text-muted-foreground hover:text-primary"
									>
										<X className="w-4 h-4" />
									</Button>
								</div>

								{/* Content */}
								<div className="flex-1 overflow-auto p-4 sm:p-6">
									{loading ? (
										<div className="flex items-center justify-center h-full">
											<div className="text-center">
												<BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
												<p className="text-muted-foreground font-mono">
													Decrypting neural pathway...
												</p>
											</div>
										</div>
									) : error ? (
										<div className="flex items-center justify-center h-full">
											<div className="text-center max-w-md">
												<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
												<h3 className="text-lg font-heading font-bold text-red-400 mb-2">
													Data Corruption Detected
												</h3>
												<p className="text-muted-foreground font-mono mb-4">
													{error}
												</p>
												<Button
													variant="outline"
													onClick={onClose}
													className="touch-manipulation min-h-[44px]"
												>
													Close Terminal
												</Button>
											</div>
										</div>
									) : !post ? (
										<div className="flex items-center justify-center h-full">
											<div className="text-center max-w-md">
												<BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
												<h3 className="text-lg font-heading font-bold text-primary mb-2">
													404: Neural Pathway Not Found
												</h3>
												<p className="text-muted-foreground font-mono mb-4">
													The requested blog post could not be located in the
													data matrix.
												</p>
												<Button
													variant="outline"
													onClick={onClose}
													className="touch-manipulation min-h-[44px]"
												>
													Close Terminal
												</Button>
											</div>
										</div>
									) : (
										<>
											{/* Post Header */}
											<header className="mb-6 sm:mb-8 border-b-2 border-primary/30 pb-6 sm:pb-8">
												<h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black mb-3 sm:mb-4 text-primary neon-glow-subtle">
													{post.title}
												</h1>

												{/* Meta Information */}
												<div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground font-mono">
													<div className="flex items-center gap-1">
														<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
														<span>
															{new Date(post.date).toLocaleDateString("en-US", {
																year: "numeric",
																month: "short",
																day: "numeric",
															})}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<Clock className="w-3 h-3 sm:w-4 sm:h-4" />
														{post.readTime}
													</div>
													<div className="flex items-center gap-1">
														<User className="w-3 h-3 sm:w-4 sm:h-4" />
														{post.author}
													</div>
												</div>

												{/* Tags */}
												<div className="flex flex-wrap gap-1.5 sm:gap-2">
													{post.tags.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="font-mono text-xs"
														>
															<Tag className="w-3 h-3 mr-1" />
															{tag}
														</Badge>
													))}
												</div>
											</header>

											{/* Post Content */}
											<article
												className="prose prose-cyberpunk dark:prose-invert max-w-none 
														   prose-headings:font-heading prose-headings:tracking-tight 
														   prose-p:font-mono prose-li:font-mono prose-code:font-mono 
														   prose-a:text-secondary hover:prose-a:neon-glow-secondary-subtle
														   prose-code:bg-background/50 prose-code:p-1 prose-code:rounded-sm prose-code:text-xs
														   prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground
														   prose-strong:text-primary prose-strong:font-bold
														   prose-hr:border-primary/20"
												dangerouslySetInnerHTML={{ __html: processedContent }}
												onClick={(e) => {
													const target = e.target as HTMLElement;
													const imgElement = target.closest(
														"img"
													) as HTMLImageElement | null;
													if (imgElement) {
														e.preventDefault(); // Prevent default link behavior if image is inside a link
														handleImageClick(
															imgElement.getAttribute("src") || ""
														);
													}
												}}
											/>
										</>
									)}
								</div>

								{/* Footer */}
								<div className="border-t border-primary/30 p-4 sm:p-6">
									<div className="flex items-center justify-between">
										<span className="text-xs text-muted-foreground font-mono">
											terminal://blog/{blogId}
										</span>
										<Button
											variant="outline"
											onClick={onClose}
											className="font-mono touch-manipulation min-h-[44px]"
										>
											<X className="w-4 h-4 mr-2" />
											Close Terminal
										</Button>
									</div>
								</div>
							</Card>
						</m.div>

						{/* Image Modal */}
						<ImageModal
							isOpen={isImageModalOpen}
							onClose={() => setIsImageModalOpen(false)}
							imageUrl={selectedImageUrl}
							altText="Blog post image"
						/>
					</>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
