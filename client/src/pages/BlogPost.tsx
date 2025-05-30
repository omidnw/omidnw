import React, { useState, useEffect, useCallback } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
					<p className="text-muted-foreground font-mono mb-2">
						{isGitHubConfigured()
							? "Decrypting neural pathway..."
							: "Loading blog data from local archive..."}
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card variant="cyberpunk" className="p-12 text-center max-w-md">
					<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
					<h1 className="text-2xl font-heading font-bold text-red-400 mb-4">
						Data Corruption Detected
					</h1>
					<p className="text-muted-foreground font-mono mb-6">{error}</p>
					<div className="flex gap-2 justify-center">
						<Button variant="neon" onClick={refreshPost} disabled={refreshing}>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
							/>
							Re-establish Link
						</Button>
						<Link href="/blog">
							<Button variant="outline">
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
			<div className="min-h-screen flex items-center justify-center">
				<Card variant="cyberpunk" className="p-12 text-center max-w-md">
					<BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
					<h1 className="text-2xl font-heading font-bold text-primary mb-4">
						404: Neural Pathway Not Found
					</h1>
					<p className="text-muted-foreground font-mono mb-6">
						The requested blog post could not be located in the data matrix.
					</p>
					<div className="flex items-center justify-center text-xs text-muted-foreground mb-6 p-3 bg-background/30 rounded-lg">
						Data source: {dataSource}
					</div>
					<Link href="/blog">
						<Button variant="neon">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Return to Blog Matrix
						</Button>
					</Link>
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
		<div className="min-h-screen">
			{/* Back Navigation & Data Source */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="mb-8 flex items-center justify-between"
			>
				<Link href="/blog">
					<Button variant="ghost" className="group">
						<ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
						Back to Neural Blog
					</Button>
				</Link>
				<div className="flex items-center gap-2 text-xs font-mono">
					{dataSource === "github" && (
						<Badge
							variant="outline"
							className="bg-green-500/10 border-green-500 text-green-400"
						>
							<Github className="w-3 h-3 mr-1" /> GitHub
						</Badge>
					)}
					{dataSource === "local" && (
						<Badge
							variant="outline"
							className="bg-blue-500/10 border-blue-500 text-blue-400"
						>
							<Code className="w-3 h-3 mr-1" /> Local
						</Badge>
					)}
					{dataSource === "github" && (
						<Button
							variant="ghost"
							size="sm"
							onClick={refreshPost}
							disabled={refreshing}
							className="text-xs"
						>
							<RefreshCw
								className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					)}
				</div>
			</motion.div>

			{/* Article Header */}
			<motion.header
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="mb-12"
			>
				<Card variant="hologram" className="p-8 md:p-12">
					{/* Meta Information */}
					<div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground font-mono">
						<div className="flex items-center gap-1">
							<Calendar className="w-4 h-4" />
							{new Date(post.date).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</div>
						<div className="flex items-center gap-1">
							<Clock className="w-4 h-4" />
							{post.readTime}
						</div>
						<div className="flex items-center gap-1">
							<User className="w-4 h-4" />
							{post.author}
						</div>
					</div>

					{/* Title */}
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-primary neon-glow mb-6">
						{post.title}
					</h1>

					{/* Excerpt */}
					<p className="text-lg md:text-xl text-muted-foreground font-mono leading-relaxed mb-8">
						{post.excerpt}
					</p>

					{/* Tags and Actions */}
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<Badge key={tag} variant="secondary" className="font-mono">
									<Tag className="w-3 h-3 mr-1" />
									{tag}
								</Badge>
							))}
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleShare}
								className="font-mono"
							>
								<Share2 className="w-4 h-4 mr-2" />
								Share
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={handleCopyLink}
								className={`font-mono transition-all duration-300 ${
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
				</Card>
			</motion.header>

			{/* Article Content */}
			<motion.article
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="mb-12"
			>
				<Card variant="cyberpunk" className="p-8 md:p-12">
					<div
						className="cyberpunk-markdown max-w-none"
						dangerouslySetInnerHTML={{
							__html: processedContent,
						}}
					/>
				</Card>
			</motion.article>

			{/* Navigation Footer */}
			<motion.footer
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.4 }}
			>
				<Card variant="cyberpunk" className="p-6 text-center">
					<p className="text-muted-foreground font-mono mb-4">
						End of neural transmission
					</p>
					<Link href="/blog">
						<Button variant="neon">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Explore More Posts
						</Button>
					</Link>
				</Card>
			</motion.footer>
		</div>
	);
}
