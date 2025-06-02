import React, { useState, useEffect, useCallback } from "react";
import { useRoute } from "wouter";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Calendar,
	Clock,
	User,
	Share2,
	Code,
	Tag,
	Link2,
	Check,
	ExternalLink,
	Github,
	Play,
	Star,
	Zap,
	Hash,
	Globe,
	GitBranch,
	RefreshCw,
	AlertCircle,
	Wifi,
	WifiOff,
	Laptop,
} from "lucide-react";
import { Link } from "wouter";

// GitHub API integration
import {
	fetchProjectBySlug,
	isGitHubConfigured,
	clearProjectsCache,
	ProjectData,
} from "@/lib/github-api";
import { GITHUB_CONFIG } from "@/lib/github-config";

// Local projects loader
import { loadLocalProjectById } from "@/lib/local-projects";

// Enhanced markdown processor
import {
	processMarkdown,
	addCyberpunkAnimations,
} from "@/lib/markdown-processor";

// Import the new ImageModal component
import ImageModal from "@/components/ImageModal";

export default function ProjectPost() {
	const [match, params] = useRoute("/projects/:slug");
	const [project, setProject] = useState<ProjectData | null>(null);
	const [processedContent, setProcessedContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [linkCopied, setLinkCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dataSource, setDataSource] = useState<"github" | "local" | "none">(
		"none"
	);
	const [refreshing, setRefreshing] = useState(false);

	// State for Image Modal
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
	const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");

	// Memoize the loadProject function to prevent infinite re-renders
	const loadProject = useCallback(async (slug: string) => {
		setLoading(true);
		setError(null);

		try {
			let loadedProject: ProjectData | null = null;

			// Try GitHub first if configured
			if (isGitHubConfigured()) {
				try {
					console.log(`🔍 Fetching project ${slug} from GitHub...`);
					loadedProject = await fetchProjectBySlug(slug);

					if (loadedProject) {
						setDataSource("github");
						console.log(`✅ Loaded project ${slug} from GitHub`);
					} else {
						console.log(
							`⚠️ Project ${slug} not found in GitHub, checking fallback options...`
						);
						// Check if local fallback is enabled
						if (GITHUB_CONFIG.enableLocalFallback) {
							console.log("🔄 Falling back to local project files...");
							loadedProject = await loadLocalProjectById(slug);
							setDataSource("local");
						} else {
							console.log("❌ Local fallback disabled, project not found");
							setDataSource("none");
						}
					}
				} catch (githubError) {
					console.warn(`❌ GitHub fetch failed for ${slug}:`, githubError);
					// Check if local fallback is enabled
					if (GITHUB_CONFIG.enableLocalFallback) {
						console.log("🔄 Falling back to local project files...");
						loadedProject = await loadLocalProjectById(slug);
						setDataSource("local");
					} else {
						console.log("❌ Local fallback disabled, showing error");
						throw githubError; // Re-throw error if fallback is disabled
					}
				}
			} else {
				// Check if local fallback is enabled when GitHub is not configured
				if (GITHUB_CONFIG.enableLocalFallback) {
					console.log(
						`ℹ️ GitHub not configured, using local files for ${slug}`
					);
					loadedProject = await loadLocalProjectById(slug);
					setDataSource("local");
				} else {
					console.log("❌ GitHub not configured and local fallback disabled");
					setDataSource("none");
				}
			}

			setProject(loadedProject);

			// Process markdown content if project is loaded
			if (loadedProject?.content) {
				try {
					const html = await processMarkdown(loadedProject.content);
					setProcessedContent(addCyberpunkAnimations(html));
				} catch (markdownError) {
					console.warn(
						"Failed to process markdown, using raw content:",
						markdownError
					);
					setProcessedContent(loadedProject.content);
				}
			}
		} catch (error) {
			console.error("Error loading project:", error);
			setError("Failed to load project. Please try again.");

			// Final fallback check
			if (GITHUB_CONFIG.enableLocalFallback) {
				try {
					const fallbackProject = await loadLocalProjectById(slug);
					setProject(fallbackProject);
					setDataSource("local");

					// Process markdown content for fallback project
					if (fallbackProject?.content) {
						try {
							const html = await processMarkdown(fallbackProject.content);
							setProcessedContent(addCyberpunkAnimations(html));
						} catch (markdownError) {
							console.warn(
								"Failed to process fallback markdown:",
								markdownError
							);
							setProcessedContent(fallbackProject.content);
						}
					}
				} catch (fallbackError) {
					console.error("Final fallback failed:", fallbackError);
					setProject(null);
					setDataSource("none");
				}
			} else {
				setProject(null);
				setDataSource("none");
			}
		} finally {
			setLoading(false);
		}
	}, []); // Empty dependency array since it doesn't depend on any state

	// Refresh project data
	const refreshProject = useCallback(async () => {
		if (!params?.slug) return;

		setRefreshing(true);
		setProcessedContent(""); // Clear processed content

		// Clear cache if using GitHub
		if (dataSource === "github") {
			clearProjectsCache();
		}

		await loadProject(params.slug);
		setRefreshing(false);
	}, [params?.slug, dataSource, loadProject]);

	// Load project when slug changes
	useEffect(() => {
		if (params?.slug) {
			loadProject(params.slug);
		}
	}, [params?.slug, loadProject]);

	// Event listener for image clicks to open modal
	useEffect(() => {
		const handleImageClick = (event: Event) => {
			const mouseEvent = event as MouseEvent;
			const target = mouseEvent.target as HTMLElement;
			const trigger = target.closest(
				".image-modal-trigger"
			) as HTMLElement | null;

			if (trigger) {
				const src = trigger.dataset.src;
				const alt = trigger.dataset.alt;
				if (src) {
					setSelectedImageUrl(src);
					setSelectedImageAlt(alt || "");
					setIsImageModalOpen(true);
				}
			}
		};

		// Add event listener to the article content area
		const articleElement = document.querySelector(".cyberpunk-markdown");
		if (articleElement) {
			articleElement.addEventListener("click", handleImageClick);
		}

		return () => {
			if (articleElement) {
				articleElement.removeEventListener("click", handleImageClick);
			}
		};
	}, [processedContent]); // Re-run if processedContent changes to re-attach listeners

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="text-center">
					<Code className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary mx-auto mb-4 animate-pulse" />
					<p className="text-muted-foreground font-mono mb-2 text-sm sm:text-base">
						{isGitHubConfigured()
							? "Connecting to GitHub matrix..."
							: "Loading project matrix..."}
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

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<Card
					variant="cyberpunk"
					className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full"
				>
					<AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-400 mx-auto mb-4" />
					<h1 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-red-400 mb-4">
						Connection Failed
					</h1>
					<p className="text-muted-foreground font-mono mb-6 text-sm sm:text-base">
						{error}
					</p>
					<div className="flex gap-2 justify-center">
						<Button
							variant="neon"
							onClick={refreshProject}
							disabled={refreshing}
							className="touch-manipulation min-h-[44px]"
						>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
							/>
							Retry
						</Button>
						<Link href="/projects">
							<Button
								variant="outline"
								className="touch-manipulation min-h-[44px]"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Projects
							</Button>
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	// Project not found
	if (!project) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<Card
					variant="cyberpunk"
					className="p-6 sm:p-8 md:p-12 text-center max-w-md w-full"
				>
					<Code className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
					<h1 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary mb-4">
						404: Project Not Found
					</h1>
					<p className="text-muted-foreground font-mono mb-4 text-sm sm:text-base">
						The requested project could not be located in the matrix.
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
								Using local project data
							</>
						)}
					</div>

					<div className="flex gap-2 justify-center">
						{isGitHubConfigured() && (
							<Button
								variant="outline"
								onClick={refreshProject}
								disabled={refreshing}
								className="touch-manipulation min-h-[44px]"
							>
								<RefreshCw
									className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
								/>
								Refresh
							</Button>
						)}
						<Link href="/projects">
							<Button
								variant="neon"
								className="touch-manipulation min-h-[44px]"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Return to Projects
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
					title: project.title,
					text: project.description,
					url: window.location.href,
				});
			} catch (error) {
				console.log("Error sharing:", error);
			}
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setLinkCopied(true);
			// Reset the copied state after 2 seconds
			setTimeout(() => {
				setLinkCopied(false);
			}, 2000);
		} catch (error) {
			console.log("Error copying link:", error);
		}
	};

	// Get status badge variant
	const getStatusVariant = (status: string) => {
		switch (status) {
			case "completed":
				return "default";
			case "in-progress":
				return "secondary";
			case "planned":
				return "outline";
			default:
				return "outline";
		}
	};

	// Get status icon
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />;
			case "in-progress":
				return <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />;
			case "planned":
				return <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />;
			default:
				return null;
		}
	};

	// Format duration
	const formatDuration = () => {
		const start = new Date(project.startDate);
		const end = project.endDate ? new Date(project.endDate) : new Date();
		const diffMonths =
			(end.getFullYear() - start.getFullYear()) * 12 +
			(end.getMonth() - start.getMonth());

		if (diffMonths < 1) return "< 1 month";
		if (diffMonths === 1) return "1 month";
		return `${diffMonths} months`;
	};

	// Fix image URL paths - remove incorrect /projects/ prefix
	const getCorrectImageUrl = (imageUrl: string | undefined): string | null => {
		if (!imageUrl) return null;

		// If the URL starts with /projects/images/, remove the /projects/ part
		if (imageUrl.startsWith("/projects/images/")) {
			return imageUrl.replace("/projects/images/", "/images/");
		}

		// If it starts with projects/images/ (without leading slash), fix it
		if (imageUrl.startsWith("projects/images/")) {
			return "/" + imageUrl.replace("projects/images/", "images/");
		}

		// Return as-is if it's already correct or a different format
		return imageUrl;
	};

	return (
		<LazyMotion features={domMax}>
			<div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Back Navigation */}
				<m.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
				>
					<Link href="/projects">
						<Button
							variant="ghost"
							className="group touch-manipulation min-h-[44px]"
						>
							<ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
							Back to Project Matrix
						</Button>
					</Link>

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
								onClick={refreshProject}
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
				</m.div>

				{/* Project Header */}
				<m.header
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="mb-8 sm:mb-12"
				>
					<Card variant="hologram" className="p-6 sm:p-8 md:p-12">
						{/* Meta Information */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground font-mono">
							<Badge
								variant={getStatusVariant(project.status)}
								className="font-mono"
							>
								{getStatusIcon(project.status)}
								{project.status.replace("-", " ")}
							</Badge>
							<div className="flex items-center gap-1">
								<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
								<span className="hidden sm:inline">
									{new Date(project.startDate).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
									})}{" "}
									-{" "}
									{project.endDate
										? new Date(project.endDate).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
										  })
										: "Present"}
								</span>
								<span className="sm:hidden">
									{new Date(project.startDate).getFullYear()} -{" "}
									{project.endDate
										? new Date(project.endDate).getFullYear()
										: "Present"}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="w-3 h-3 sm:w-4 sm:h-4" />
								{formatDuration()}
							</div>
							{project.featured && (
								<Badge variant="outline" className="neon-border">
									<Star className="w-3 h-3 mr-1" />
									FEATURED
								</Badge>
							)}
						</div>

						{/* Title */}
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-primary neon-glow mb-4 sm:mb-6">
							{project.title}
						</h1>

						{/* Description */}
						<p className="text-base sm:text-lg md:text-xl text-muted-foreground font-mono leading-relaxed mb-6 sm:mb-8">
							{project.description}
						</p>

						{/* Technologies */}
						<div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
							<span className="text-sm font-mono text-muted-foreground flex items-center mr-4 flex-shrink-0">
								<Code className="w-4 h-4 mr-2" />
								Technologies:
							</span>
							{project.technologies.map((tech) => (
								<Badge key={tech} variant="secondary" className="font-mono">
									<Hash className="w-3 h-3 mr-1" />
									{tech}
								</Badge>
							))}
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="flex flex-wrap gap-2">
								{project.demoUrl && (
									<Button
										variant="neon"
										onClick={() => window.open(project.demoUrl, "_blank")}
										className="font-mono touch-manipulation min-h-[48px]"
									>
										<Play className="w-4 h-4 mr-2" />
										Live Demo
									</Button>
								)}

								{project.githubUrl && (
									<Button
										variant="outline"
										onClick={() => window.open(project.githubUrl, "_blank")}
										className="font-mono touch-manipulation min-h-[48px]"
									>
										<Github className="w-4 h-4 mr-2" />
										Source Code
									</Button>
								)}
							</div>

							<div className="flex items-center gap-2">
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

						{/* Tags */}
						<div className="flex flex-wrap gap-2 mt-6">
							<span className="text-sm font-mono text-muted-foreground flex items-center mr-4 flex-shrink-0">
								<Tag className="w-4 h-4 mr-2" />
								Tags:
							</span>
							{[...project.tags, project.category]
								.filter((tag, index, arr) => arr.indexOf(tag) === index)
								.map((tag) => (
									<Badge key={tag} variant="outline" className="font-mono">
										<Hash className="w-3 h-3 mr-1" />
										{tag}
									</Badge>
								))}
						</div>
					</Card>
				</m.header>

				{/* Project Images */}
				{project.image && (
					<m.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="mb-8 sm:mb-12"
					>
						<h2 className="text-xl sm:text-2xl font-heading font-bold text-primary mb-4 sm:mb-6 flex items-center">
							<Laptop className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
							PROJECT_PREVIEW.display()
						</h2>

						<m.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="group cursor-pointer"
							onClick={() => {
								const correctedUrl = getCorrectImageUrl(project.image);
								if (correctedUrl) {
									setSelectedImageUrl(correctedUrl);
									setSelectedImageAlt(`${project.title} preview`);
									setIsImageModalOpen(true);
								}
							}}
						>
							<Card
								variant="cyberpunk"
								className="overflow-hidden hover:scale-105 transition-transform"
							>
								<div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
									<img
										src={getCorrectImageUrl(project.image) || project.image}
										alt={`${project.title} preview`}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
										<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
											<div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm">
												<ExternalLink className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
											</div>
										</div>
									</div>
								</div>
							</Card>
						</m.div>
					</m.section>
				)}

				{/* Project Content - MAIN CONTENT SECTION */}
				{processedContent && (
					<m.article
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="mb-8 sm:mb-12"
					>
						<Card variant="cyberpunk" className="p-6 sm:p-8 md:p-12">
							<h2 className="text-xl sm:text-2xl font-heading font-bold text-primary mb-4 sm:mb-6 flex items-center">
								<Code className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
								PROJECT_DOCUMENTATION.load()
							</h2>
							<div
								className="cyberpunk-markdown max-w-none"
								dangerouslySetInnerHTML={{
									__html: processedContent,
								}}
							/>
						</Card>
					</m.article>
				)}

				{/* Project Details Fallback */}
				{!processedContent && (
					<m.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="mb-8 sm:mb-12"
					>
						<Card variant="cyberpunk" className="p-6 sm:p-8 md:p-12">
							<h2 className="text-xl sm:text-2xl font-heading font-bold text-primary mb-4 sm:mb-6 flex items-center">
								<Code className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
								PROJECT_DETAILS.scan()
							</h2>

							<div className="prose prose-invert max-w-none">
								<p className="text-muted-foreground font-mono leading-relaxed text-sm sm:text-base">
									{project.description}
								</p>

								{project.content && (
									<div className="mt-4">
										<pre className="whitespace-pre-wrap text-muted-foreground font-mono text-sm leading-relaxed">
											{project.content}
										</pre>
									</div>
								)}
							</div>
						</Card>
					</m.section>
				)}

				{/* Navigation Footer */}
				<m.footer
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<Card variant="cyberpunk" className="p-4 sm:p-6 text-center">
						<p className="text-muted-foreground font-mono mb-2 text-sm sm:text-base">
							End of project transmission
						</p>

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
								<span className="text-blue-400">
									ℹ Using local project data
								</span>
							)}
						</div>

						<div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
							{project.demoUrl && (
								<Button
									variant="neon"
									onClick={() => window.open(project.demoUrl, "_blank")}
									className="touch-manipulation min-h-[48px]"
								>
									<ExternalLink className="w-4 h-4 mr-2" />
									View Live Project
								</Button>
							)}
							<Link href="/projects">
								<Button
									variant="outline"
									className="touch-manipulation min-h-[48px]"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Explore More Projects
								</Button>
							</Link>
						</div>
					</Card>
				</m.footer>
			</div>

			{/* Image Modal */}
			<AnimatePresence>
				{isImageModalOpen && selectedImageUrl && (
					<ImageModal
						isOpen={isImageModalOpen}
						onClose={() => setIsImageModalOpen(false)}
						imageUrl={selectedImageUrl}
						altText={selectedImageAlt}
					/>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
