import React, { useState, useEffect, useCallback } from "react";
import { useRoute } from "wouter";
import { LazyMotion, m, domMax } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Calendar,
	Clock,
	User,
	Share2,
	BookOpen,
	Tag,
	Link2,
	Check,
	RefreshCw,
	AlertCircle,
	Github,
	Code,
	Wifi,
	WifiOff,
} from "lucide-react";
import { Link } from "wouter";

// GitHub API integration & data types
import {
	fetchBlogPostBySlug,
	isGitHubConfigured,
	clearBlogCache,
	BlogPostData,
} from "@/lib/github-api";
import { GITHUB_CONFIG } from "@/lib/github-config";

// Local blogs loader
import { loadLocalBlogPostById } from "@/lib/local-blogs";

// Enhanced markdown processor
import {
	processMarkdown,
	addCyberpunkAnimations,
} from "@/lib/markdown-processor";

export default function BlogPost() {
	const [match, params] = useRoute("/blog/:slug");
	const [post, setPost] = useState<BlogPostData | null>(null);
	const [processedContent, setProcessedContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [linkCopied, setLinkCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dataSource, setDataSource] = useState<"github" | "local" | "none">(
		"none"
	);
	const [refreshing, setRefreshing] = useState(false);

	const loadPost = useCallback(async (slug: string) => {
		setLoading(true);
		setError(null);
		setProcessedContent("");

		try {
			let loadedPost: BlogPostData | null = null;

			if (isGitHubConfigured()) {
				try {
					console.log(`🔍 Fetching blog post ${slug} from GitHub...`);
					loadedPost = await fetchBlogPostBySlug(slug);
					if (loadedPost) {
						setDataSource("github");
						console.log(`✅ Loaded blog post ${slug} from GitHub`);
					} else {
						console.log(
							`⚠️ Blog post ${slug} not found in GitHub, checking fallback...`
						);
						if (GITHUB_CONFIG.enableLocalFallback) {
							console.log("🔄 Falling back to local blog file...");
							loadedPost = await loadLocalBlogPostById(slug);
							setDataSource(loadedPost ? "local" : "none");
						} else {
							console.log("❌ Local fallback disabled, post not found");
							setDataSource("none");
						}
					}
				} catch (githubError) {
					console.warn(`❌ GitHub blog fetch failed for ${slug}:`, githubError);
					if (GITHUB_CONFIG.enableLocalFallback) {
						console.log("🔄 Falling back to local blog file...");
						loadedPost = await loadLocalBlogPostById(slug);
						setDataSource(loadedPost ? "local" : "none");
					} else {
						console.log("❌ Local fallback disabled, showing error");
						throw githubError;
					}
				}
			} else {
				if (GITHUB_CONFIG.enableLocalFallback) {
					console.log(`ℹ️ GitHub not configured, using local file for ${slug}`);
					loadedPost = await loadLocalBlogPostById(slug);
					setDataSource(loadedPost ? "local" : "none");
				} else {
					console.log("❌ GitHub not configured and local fallback disabled");
					setDataSource("none");
				}
			}

			setPost(loadedPost);

			if (loadedPost?.content) {
				try {
					const html = await processMarkdown(loadedPost.content);
					setProcessedContent(addCyberpunkAnimations(html));
				} catch (markdownError) {
					console.warn(
						"Failed to process markdown for blog post, using raw content:",
						markdownError
					);
					setProcessedContent(loadedPost.content);
				}
			}
		} catch (error) {
			console.error("Error loading blog post:", error);
			setError("Failed to load blog post. Please try again.");
			if (GITHUB_CONFIG.enableLocalFallback) {
				try {
					const fallbackPost = await loadLocalBlogPostById(slug);
					setPost(fallbackPost);
					setDataSource(fallbackPost ? "local" : "none");
					if (fallbackPost?.content) {
						const html = await processMarkdown(fallbackPost.content);
						setProcessedContent(addCyberpunkAnimations(html));
					}
				} catch (fbError) {
					console.error("Final blog post fallback failed:", fbError);
					setPost(null);
					setDataSource("none");
				}
			} else {
				setPost(null);
				setDataSource("none");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const refreshPost = useCallback(async () => {
		if (!params?.slug) return;
		setRefreshing(true);
		if (dataSource === "github") {
			clearBlogCache();
		}
		await loadPost(params.slug);
		setRefreshing(false);
	}, [params?.slug, dataSource, loadPost]);

	useEffect(() => {
		if (params?.slug) {
			loadPost(params.slug);
		} else {
			setLoading(false);
			setError("Blog post slug not provided.");
		}
	}, [params?.slug, loadPost]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="text-center">
					<BookOpen className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary mx-auto mb-4 animate-pulse" />
					<p className="text-muted-foreground font-mono mb-2 text-sm sm:text-base">
						{isGitHubConfigured()
							? "Decrypting neural pathway..."
							: "Loading blog data from local archive..."}
					</p>
					{isGitHubConfigured() && (
						<div className="flex items-center justify-center text-xs text-muted-foreground">
							<Wifi className="w-3 h-3 mr-1" />
							<span>GitHub API Integration Enabled</span>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<Card
					variant="cyberpunk"
					className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full"
				>
					<AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-400 mx-auto mb-4" />
					<h1 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-red-400 mb-4">
						Data Corruption Detected
					</h1>
					<p className="text-muted-foreground font-mono mb-6 text-sm sm:text-base">
						{error}
					</p>
					<div className="flex gap-2 justify-center">
						<Button
							variant="neon"
							onClick={refreshPost}
							disabled={refreshing}
							className="touch-manipulation min-h-[44px]"
						>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
							/>
							Re-establish Link
						</Button>
						<Link href="/blog">
							<Button
								variant="outline"
								className="touch-manipulation min-h-[44px]"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Blog Matrix
							</Button>
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<Card
					variant="cyberpunk"
					className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full"
				>
					<BookOpen className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
					<h1 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary mb-4">
						404: Neural Pathway Not Found
					</h1>
					<p className="text-muted-foreground font-mono mb-4 text-sm sm:text-base">
						The requested blog post could not be located in the data matrix.
					</p>

					{/* Show data source info */}
					<div className="flex items-center justify-center text-xs text-muted-foreground mb-6 p-3 bg-background/30 rounded-lg">
						{isGitHubConfigured() ? (
							<>
								<Wifi className="w-3 h-3 mr-1" />
								Searched GitHub repository
							</>
						) : (
							<>
								<WifiOff className="w-3 h-3 mr-1" />
								Using local blog data
							</>
						)}
					</div>

					<div className="flex gap-2 justify-center">
						{isGitHubConfigured() && (
							<Button
								variant="outline"
								onClick={refreshPost}
								disabled={refreshing}
								className="touch-manipulation min-h-[44px]"
							>
								<RefreshCw
									className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
								/>
								Refresh
							</Button>
						)}
						<Link href="/blog">
							<Button
								variant="neon"
								className="touch-manipulation min-h-[44px]"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Return to Blog Matrix
							</Button>
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: post.title,
					text: post.excerpt,
					url: window.location.href,
				});
			} catch (error) {
				console.log("Error sharing:", error);
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setLinkCopied(true);
			setTimeout(() => {
				setLinkCopied(false);
			}, 2000);
		} catch (error) {
			console.log("Error copying link:", error);
		}
	};

	return (
		<LazyMotion features={domMax}>
			<div className="max-w-4xl mx-auto px-4 py-8 font-sans">
				{/* Back to Blog Button */}
				<m.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="mb-6 sm:mb-8"
				>
					<Link href="/blog">
						<Button
							variant="ghost"
							className="group touch-manipulation min-h-[44px]"
						>
							<ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
							Back to Neural Blog
						</Button>
					</Link>
				</m.div>

				{/* Post Header */}
				<m.header
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.2 }}
					className="mb-6 sm:mb-8 border-b-2 border-primary/30 pb-6 sm:pb-8"
				>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black mb-3 sm:mb-4 text-primary neon-glow-subtle">
						{post.title}
					</h1>

					{/* Meta Information */}
					<div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground font-mono">
						<div className="flex items-center gap-1">
							<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
							<span className="hidden sm:inline">
								{new Date(post.date).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
							<span className="sm:hidden">
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

					{/* Tags and Actions */}
					<div className="flex flex-col gap-4">
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

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleShare}
									className="font-mono touch-manipulation min-h-[44px]"
								>
									<Share2 className="w-4 h-4 mr-2" />
									Share
								</Button>

								<Button
									variant="outline"
									size="sm"
									onClick={handleCopyLink}
									className={`font-mono transition-all duration-300 touch-manipulation min-h-[44px] ${
										linkCopied
											? "bg-green-500/20 border-green-500 text-green-400"
											: ""
									}`}
								>
									{linkCopied ? (
										<>
											<Check className="w-4 h-4 mr-2" />
											Copied!
										</>
									) : (
										<>
											<Link2 className="w-4 h-4 mr-2" />
											Copy Link
										</>
									)}
								</Button>
							</div>
						</div>
					</div>

					{/* Data source indicator and refresh button */}
					<div className="flex items-center gap-2">
						<div className="flex items-center text-xs text-muted-foreground font-mono">
							{dataSource === "github" ? (
								<>
									<Github className="w-3 h-3 mr-1 text-green-400" />
									<span className="text-green-400">GitHub</span>
								</>
							) : dataSource === "local" ? (
								<>
									<Code className="w-3 h-3 mr-1 text-blue-400" />
									<span className="text-blue-400">Local</span>
								</>
							) : null}
						</div>

						{dataSource === "github" && (
							<Button
								variant="ghost"
								size="sm"
								onClick={refreshPost}
								disabled={refreshing}
								className="text-xs h-6 sm:h-8 touch-manipulation"
							>
								<RefreshCw
									className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`}
								/>
								Refresh
							</Button>
						)}
					</div>
				</m.header>

				{/* Post Content */}
				<m.article
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="prose prose-cyberpunk dark:prose-invert max-w-none 
                           prose-headings:font-heading prose-headings:tracking-tight 
                           prose-p:font-mono prose-li:font-mono prose-code:font-mono 
                           prose-a:text-secondary hover:prose-a:neon-glow-secondary-subtle
                           prose-code:bg-background/50 prose-code:p-1 prose-code:rounded-sm prose-code:text-xs
                           prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground
                           prose-strong:text-primary prose-strong:font-bold
                           prose-hr:border-primary/20
                           mb-8 sm:mb-12"
					dangerouslySetInnerHTML={{ __html: processedContent }}
				/>

				{/* Post Footer - Tags & Share */}
				<m.footer
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
					className="border-t-2 border-primary/30 pt-6 sm:pt-8"
				>
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						{/* Tags */}
						<div className="flex flex-wrap gap-2">
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

						{/* Data source info */}
						<div className="text-xs text-muted-foreground font-mono mb-4">
							{dataSource === "github" && (
								<span className="text-green-400">
									✓ Loaded from GitHub repository
								</span>
							)}
							{dataSource === "local" && isGitHubConfigured() && (
								<span className="text-yellow-400">
									⚠ Fallback to local data
								</span>
							)}
							{dataSource === "local" && !isGitHubConfigured() && (
								<span className="text-blue-400">ℹ Using local blog data</span>
							)}
						</div>

						<Link href="/blog">
							<Button
								variant="neon"
								className="touch-manipulation min-h-[48px]"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Explore More Posts
							</Button>
						</Link>
					</div>
				</m.footer>
			</div>
		</LazyMotion>
	);
}
