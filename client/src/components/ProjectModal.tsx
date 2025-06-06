import React, { useState, useEffect } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	X,
	Calendar,
	Clock,
	Code,
	Tag,
	Hash,
	Play,
	Github,
	ExternalLink,
	AlertCircle,
	Star,
	Zap,
	Check,
} from "lucide-react";

// GitHub API integration & data types
import {
	fetchProjectBySlug,
	isGitHubConfigured,
	ProjectData,
} from "@/lib/github-api";

// Local projects loader
import { loadLocalProjectById } from "@/lib/local-projects";

// Enhanced markdown processor
import {
	processMarkdown,
	addCyberpunkAnimations,
} from "@/lib/markdown-processor";

import ImageModal from "@/components/ImageModal";

interface ProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: string;
}

export default function ProjectModal({
	isOpen,
	onClose,
	projectId,
}: ProjectModalProps) {
	const [project, setProject] = useState<ProjectData | null>(null);
	const [processedContent, setProcessedContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen || !projectId) return;

		const loadProject = async () => {
			setLoading(true);
			setError(null);
			setProcessedContent("");

			try {
				let loadedProject: ProjectData | null = null;

				if (isGitHubConfigured()) {
					try {
						loadedProject = await fetchProjectBySlug(projectId);
					} catch (githubError) {
						console.warn(
							`GitHub project fetch failed for ${projectId}:`,
							githubError
						);
						loadedProject = await loadLocalProjectById(projectId);
					}
				} else {
					loadedProject = await loadLocalProjectById(projectId);
				}

				setProject(loadedProject);

				if (loadedProject?.content) {
					try {
						const html = await processMarkdown(loadedProject.content);
						setProcessedContent(addCyberpunkAnimations(html));
					} catch (markdownError) {
						console.warn("Failed to process markdown:", markdownError);
						setProcessedContent(loadedProject.content);
					}
				}
			} catch (error) {
				console.error("Error loading project:", error);
				setError("Failed to load project.");
				setProject(null);
			} finally {
				setLoading(false);
			}
		};

		loadProject();
	}, [isOpen, projectId]);

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

	// Get status badge variant and icon
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
		if (!project) return "";
		const start = new Date(project.startDate);
		const end = project.endDate ? new Date(project.endDate) : new Date();
		const diffMonths =
			(end.getFullYear() - start.getFullYear()) * 12 +
			(end.getMonth() - start.getMonth());

		if (diffMonths < 1) return "< 1 month";
		if (diffMonths === 1) return "1 month";
		return `${diffMonths} months`;
	};

	const handleImageClick = (imageUrl: string) => {
		setSelectedImageUrl(imageUrl);
		setIsImageModalOpen(true);
	};

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
										<Code className="w-5 h-5 text-primary" />
										<span className="font-heading font-bold text-primary">
											PROJECT_VIEWER.terminal
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
												<Code className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
												<p className="text-muted-foreground font-mono">
													Connecting to project matrix...
												</p>
											</div>
										</div>
									) : error ? (
										<div className="flex items-center justify-center h-full">
											<div className="text-center max-w-md">
												<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
												<h3 className="text-lg font-heading font-bold text-red-400 mb-2">
													Connection Failed
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
									) : !project ? (
										<div className="flex items-center justify-center h-full">
											<div className="text-center max-w-md">
												<Code className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
												<h3 className="text-lg font-heading font-bold text-primary mb-2">
													404: Project Not Found
												</h3>
												<p className="text-muted-foreground font-mono mb-4">
													The requested project could not be located in the
													matrix.
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
											{/* Project Header */}
											<header className="mb-6 sm:mb-8">
												<Card variant="hologram" className="p-4 sm:p-6">
													{/* Meta Information */}
													<div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-muted-foreground font-mono">
														<Badge
															variant={getStatusVariant(project.status)}
															className="font-mono"
														>
															{getStatusIcon(project.status)}
															{project.status.replace("-", " ")}
														</Badge>
														<div className="flex items-center gap-1">
															<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
															<span>
																{new Date(project.startDate).toLocaleDateString(
																	"en-US",
																	{
																		year: "numeric",
																		month: "short",
																	}
																)}{" "}
																-{" "}
																{project.endDate
																	? new Date(
																			project.endDate
																	  ).toLocaleDateString("en-US", {
																			year: "numeric",
																			month: "short",
																	  })
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
													<h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-black text-primary neon-glow mb-3 sm:mb-4">
														{project.title}
													</h1>

													{/* Description */}
													<p className="text-sm sm:text-base text-muted-foreground font-mono leading-relaxed mb-4 sm:mb-6">
														{project.description}
													</p>

													{/* Technologies */}
													<div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
														<span className="text-sm font-mono text-muted-foreground flex items-center mr-2 flex-shrink-0">
															<Code className="w-4 h-4 mr-2" />
															Tech:
														</span>
														{project.technologies.map((tech) => (
															<Badge
																key={tech}
																variant="secondary"
																className="font-mono text-xs"
															>
																<Hash className="w-3 h-3 mr-1" />
																{tech}
															</Badge>
														))}
													</div>

													{/* Actions */}
													<div className="flex flex-wrap gap-2">
														{project.demoUrl && (
															<Button
																variant="neon"
																size="sm"
																onClick={() =>
																	window.open(project.demoUrl, "_blank")
																}
																className="font-mono touch-manipulation min-h-[40px]"
															>
																<Play className="w-3 h-3 mr-2" />
																Live Demo
															</Button>
														)}

														{project.githubUrl && (
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	window.open(project.githubUrl, "_blank")
																}
																className="font-mono touch-manipulation min-h-[40px]"
															>
																<Github className="w-3 h-3 mr-2" />
																Source
															</Button>
														)}
													</div>
												</Card>
											</header>

											{/* Project Image */}
											{project.image && (
												<section className="mb-6 sm:mb-8">
													<Card variant="cyberpunk" className="overflow-hidden">
														<div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
															<img
																src={project.image}
																alt={`${project.title} preview`}
																className="w-full h-full object-cover cursor-pointer"
																loading="lazy"
																onClick={() => handleImageClick(project.image)}
															/>
														</div>
													</Card>
												</section>
											)}

											{/* Project Content */}
											{processedContent && (
												<article className="mb-6 sm:mb-8">
													<Card variant="cyberpunk" className="p-4 sm:p-6">
														<h2 className="text-lg sm:text-xl font-heading font-bold text-primary mb-4 flex items-center">
															<Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
															PROJECT_DOCUMENTATION.load()
														</h2>
														<div
															className="prose prose-cyberpunk dark:prose-invert max-w-none prose-sm
																	   prose-headings:font-heading prose-headings:tracking-tight 
																	   prose-p:font-mono prose-li:font-mono prose-code:font-mono 
																	   prose-a:text-secondary hover:prose-a:neon-glow-secondary-subtle
																	   prose-code:bg-background/50 prose-code:p-1 prose-code:rounded-sm prose-code:text-xs
																	   prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground
																	   prose-strong:text-primary prose-strong:font-bold
																	   prose-hr:border-primary/20"
															dangerouslySetInnerHTML={{
																__html: processedContent,
															}}
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
													</Card>
												</article>
											)}

											{/* Tags */}
											<div className="flex flex-wrap gap-2">
												<span className="text-sm font-mono text-muted-foreground flex items-center mr-2 flex-shrink-0">
													<Tag className="w-4 h-4 mr-2" />
													Tags:
												</span>
												{[...project.tags, project.category]
													.filter(
														(tag, index, arr) => arr.indexOf(tag) === index
													)
													.map((tag) => (
														<Badge
															key={tag}
															variant="outline"
															className="font-mono text-xs"
														>
															<Hash className="w-3 h-3 mr-1" />
															{tag}
														</Badge>
													))}
											</div>
										</>
									)}
								</div>

								{/* Footer */}
								<div className="border-t border-primary/30 p-4 sm:p-6">
									<div className="flex items-center justify-between">
										<span className="text-xs text-muted-foreground font-mono">
											terminal://projects/{projectId}
										</span>
										<div className="flex gap-2">
											{project?.demoUrl && (
												<Button
													variant="neon"
													size="sm"
													onClick={() => window.open(project.demoUrl, "_blank")}
													className="font-mono touch-manipulation min-h-[40px]"
												>
													<ExternalLink className="w-3 h-3 mr-2" />
													Live Demo
												</Button>
											)}
											<Button
												variant="outline"
												onClick={onClose}
												className="font-mono touch-manipulation min-h-[40px]"
											>
												<X className="w-4 h-4 mr-2" />
												Close Terminal
											</Button>
										</div>
									</div>
								</div>
							</Card>
						</m.div>

						{/* Image Modal */}
						<ImageModal
							isOpen={isImageModalOpen}
							onClose={() => setIsImageModalOpen(false)}
							imageUrl={selectedImageUrl}
							altText={`${project?.title} preview`}
						/>
					</>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
