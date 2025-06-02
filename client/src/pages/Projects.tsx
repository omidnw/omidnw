import React, { useState, useMemo, useRef, useEffect } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Search,
	Calendar,
	Clock,
	Tag,
	ArrowRight,
	Filter,
	Code,
	X,
	Hash,
	Plus,
	Check,
	ExternalLink,
	Github,
	Play,
	Star,
	Zap,
	ChevronDown,
	RefreshCw,
	AlertCircle,
	Wifi,
	WifiOff,
	GitBranch,
	Database,
	CheckCircle,
} from "lucide-react";

// GitHub API integration
import {
	fetchAllProjects,
	isGitHubConfigured,
	clearProjectsCache,
	type ProjectData,
} from "@/lib/github-api";
import { GITHUB_CONFIG } from "@/lib/github-config";

// Local projects loader
import { loadLocalProjects } from "@/lib/local-projects";

// Define status variants for badges
const statusVariants = {
	completed: "default" as const,
	"In progress": "secondary" as const,
	planned: "outline" as const,
};

// Get status icon
function getStatusIcon(status: string) {
	switch (status) {
		case "completed":
			return <CheckCircle className="w-3 h-3 mr-1" />;
		case "in-progress":
			return <Clock className="w-3 h-3 mr-1" />;
		default:
			return <AlertCircle className="w-3 h-3 mr-1" />;
	}
}

// Get status variant
function getStatusVariant(status: string) {
	return statusVariants[status as keyof typeof statusVariants] || "outline";
}

export default function Projects() {
	const [searchTerm, setSearchTerm] = useState("");
	const [tagSearch, setTagSearch] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [showTagSuggestions, setShowTagSuggestions] = useState(false);
	const [showStatusDropdown, setShowStatusDropdown] = useState(false);
	const [projects, setProjects] = useState<ProjectData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dataSource, setDataSource] = useState<"github" | "local" | "none">(
		"none"
	);
	const [refreshing, setRefreshing] = useState(false);
	const tagInputRef = useRef<HTMLInputElement>(null);
	const statusDropdownRef = useRef<HTMLDivElement>(null);

	// Load projects data
	const loadProjects = async () => {
		setLoading(true);
		setError(null);

		try {
			let loadedProjects: ProjectData[] = [];

			// Try GitHub first if configured
			if (isGitHubConfigured()) {
				try {
					console.log("🔍 Fetching projects from GitHub...");
					const githubProjects = await fetchAllProjects();
					const projectsArray = Object.values(githubProjects);

					if (projectsArray.length > 0) {
						loadedProjects = projectsArray;
						setDataSource("github");
						console.log(
							`✅ Loaded ${projectsArray.length} projects from GitHub`
						);
					} else {
						console.log(
							"⚠️ No projects found in GitHub, checking fallback options..."
						);
						// Check if local fallback is enabled
						if (GITHUB_CONFIG.enableLocalFallback) {
							console.log("🔄 Falling back to local project files...");
							loadedProjects = await loadLocalProjects();
							setDataSource("local");
						} else {
							console.log("❌ Local fallback disabled, no projects to load");
							loadedProjects = [];
							setDataSource("none");
						}
					}
				} catch (githubError) {
					console.warn("❌ GitHub fetch failed:", githubError);
					// Check if local fallback is enabled
					if (GITHUB_CONFIG.enableLocalFallback) {
						console.log("🔄 Falling back to local project files...");
						loadedProjects = await loadLocalProjects();
						setDataSource("local");
					} else {
						console.log("❌ Local fallback disabled, showing error");
						throw githubError; // Re-throw error if fallback is disabled
					}
				}
			} else {
				// Check if local fallback is enabled when GitHub is not configured
				if (GITHUB_CONFIG.enableLocalFallback) {
					console.log("ℹ️ GitHub not configured, using local project files");
					loadedProjects = await loadLocalProjects();
					setDataSource("local");
				} else {
					console.log("❌ GitHub not configured and local fallback disabled");
					loadedProjects = [];
					setDataSource("none");
				}
			}

			setProjects(loadedProjects);
		} catch (error) {
			console.error("Error loading projects:", error);
			setError("Failed to load projects. Please try again.");

			// Final fallback check
			if (GITHUB_CONFIG.enableLocalFallback) {
				try {
					const fallbackProjects = await loadLocalProjects();
					setProjects(fallbackProjects);
					setDataSource("local");
				} catch (fallbackError) {
					console.error("Final fallback failed:", fallbackError);
					setProjects([]);
					setDataSource("none");
				}
			} else {
				setProjects([]);
				setDataSource("none");
			}
		} finally {
			setLoading(false);
		}
	};

	// Refresh projects data
	const refreshProjects = async () => {
		setRefreshing(true);

		// Clear cache if using GitHub
		if (dataSource === "github") {
			clearProjectsCache();
		}

		await loadProjects();
		setRefreshing(false);
	};

	// Load projects on component mount
	useEffect(() => {
		loadProjects();
	}, []);

	// Get all unique tags from projects (including technologies and categories)
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		projects.forEach((project) => {
			project.tags.forEach((tag) => tags.add(tag));
			project.technologies.forEach((tech) => tags.add(tech));
			// Add category as a tag too
			tags.add(project.category);
		});
		return Array.from(tags).sort();
	}, [projects]);

	const allStatuses = ["completed", "in-progress", "planned"];

	// Filter tags based on tag search input
	const filteredTagSuggestions = useMemo(() => {
		if (!tagSearch.trim()) return allTags;
		return allTags.filter((tag) =>
			tag.toLowerCase().includes(tagSearch.toLowerCase())
		);
	}, [tagSearch, allTags]);

	// Filter projects based on search term and selected filters
	const filteredProjects = useMemo(() => {
		return projects.filter((project) => {
			// Full text search
			const matchesSearch =
				!searchTerm.trim() ||
				project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.technologies.some((tech) =>
					tech.toLowerCase().includes(searchTerm.toLowerCase())
				) ||
				project.tags.some((tag) =>
					tag.toLowerCase().includes(searchTerm.toLowerCase())
				);

			// Tag filter - projects must contain ALL selected tags (AND logic)
			const matchesTags =
				selectedTags.length === 0 ||
				selectedTags.every((selectedTag) =>
					[...project.tags, ...project.technologies, project.category].some(
						(tag) => tag.toLowerCase() === selectedTag.toLowerCase()
					)
				);

			// Status filter
			const matchesStatus =
				!selectedStatus ||
				project.status.toLowerCase().replace(/\s+/g, "-") === selectedStatus;

			return matchesSearch && matchesTags && matchesStatus;
		});
	}, [searchTerm, selectedTags, selectedStatus, projects]);

	const featuredProjects = filteredProjects.filter(
		(project) => project.featured
	);
	const regularProjects = useMemo(() => {
		// If any filter is active, show all filtered projects in the main list
		// Otherwise, only show non-featured projects (featured are in their own section)
		if (searchTerm || selectedTags.length > 0 || selectedStatus) {
			return filteredProjects;
		} else {
			return filteredProjects.filter((project) => !project.featured);
		}
	}, [filteredProjects, searchTerm, selectedTags, selectedStatus]);

	// Handle tag selection (supports multiple tags)
	const handleTagSelect = (tag: string) => {
		if (!selectedTags.includes(tag)) {
			setSelectedTags([...selectedTags, tag]);
		}
		setTagSearch("");
		setShowTagSuggestions(false);
	};

	// Handle tag removal
	const handleTagRemove = (tagToRemove: string) => {
		setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
	};

	// Clear all filters
	const handleClearFilters = () => {
		setSearchTerm("");
		setTagSearch("");
		setSelectedTags([]);
		setSelectedStatus("");
		setShowTagSuggestions(false);
		setShowStatusDropdown(false);
	};

	// Handle clicks outside dropdowns
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				tagInputRef.current &&
				!tagInputRef.current.contains(event.target as Node)
			) {
				setShowTagSuggestions(false);
			}
			if (
				statusDropdownRef.current &&
				!statusDropdownRef.current.contains(event.target as Node)
			) {
				setShowStatusDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			setShowTagSuggestions(false);
			setShowStatusDropdown(false);
		}
	};

	// Handle status selection
	const handleStatusSelect = (status: string) => {
		setSelectedStatus(status);
		setShowStatusDropdown(false);
	};

	// Handle keyboard navigation for status dropdown
	const handleStatusKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === "Escape") {
			setShowStatusDropdown(false);
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setShowStatusDropdown(!showStatusDropdown);
		}
	};

	// Get status display text
	const getStatusDisplayText = () => {
		if (!selectedStatus) return "All Status";
		return (
			selectedStatus.charAt(0).toUpperCase() +
			selectedStatus.slice(1).replace("-", " ")
		);
	};

	return (
		<LazyMotion features={domMax}>
			<div className="min-h-screen">
				{/* Loading State */}
				{loading && (
					<div className="min-h-screen flex items-center justify-center px-4">
						<div className="text-center">
							<Code className="w-8 h-8 sm:w-10 sm:w-10 md:w-12 md:h-12 text-primary mx-auto mb-4 animate-pulse" />
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
				)}

				{/* Error State */}
				{error && !loading && (
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
									onClick={refreshProjects}
									disabled={refreshing}
									className="touch-manipulation min-h-[44px]"
								>
									<RefreshCw
										className={`w-4 h-4 mr-2 ${
											refreshing ? "animate-spin" : ""
										}`}
									/>
									Retry
								</Button>
							</div>
						</Card>
					</div>
				)}

				{/* Main Content */}
				{!loading && !error && (
					<div className="px-4 sm:px-6 lg:px-8">
						{/* Hero Section */}
						<m.header
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center py-8 sm:py-10 md:py-12 mb-6 sm:mb-8"
						>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
								<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-heading font-black neon-glow text-primary">
									PROJECT_MATRIX.load()
								</h1>

								{/* Data source indicator and refresh button */}
								<div className="flex items-center gap-2">
									<div className="flex items-center text-xs text-muted-foreground font-mono">
										{dataSource === "github" ? (
											<>
												<Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-400" />
												<span className="text-green-400">GitHub</span>
											</>
										) : dataSource === "local" ? (
											<>
												<Code className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-400" />
												<span className="text-blue-400">Local</span>
											</>
										) : null}
									</div>

									{dataSource === "github" && (
										<Button
											variant="ghost"
											size="sm"
											onClick={refreshProjects}
											disabled={refreshing}
											className="text-xs h-8 touch-manipulation"
										>
											<RefreshCw
												className={`w-3 h-3 mr-1 ${
													refreshing ? "animate-spin" : ""
												}`}
											/>
											Refresh
										</Button>
									)}
								</div>
							</div>

							<p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-mono max-w-2xl mx-auto mb-4 px-4">
								Digital constructs and cybernetic innovations - showcasing the
								evolution of code into reality
							</p>

							{/* Connection status info */}
							<div className="text-xs text-muted-foreground font-mono">
								{dataSource === "github" && (
									<span className="text-green-400">
										✓ Connected to GitHub repository
									</span>
								)}
								{dataSource === "local" && isGitHubConfigured() && (
									<span className="text-yellow-400">
										⚠ Using local fallback data
									</span>
								)}
								{dataSource === "local" && !isGitHubConfigured() && (
									<span className="text-blue-400">
										ℹ Using local project data
									</span>
								)}
							</div>
						</m.header>

						{/* Data Source Indicator */}
						{dataSource && (
							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-center mb-6 sm:mb-8"
							>
								{dataSource === "github" && (
									<Badge
										variant="outline"
										className="bg-green-500/10 border-green-500 text-green-400 text-xs sm:text-sm"
									>
										<GitBranch className="w-3 h-3 mr-1" />
										Connected to GitHub Repository
									</Badge>
								)}
								{dataSource === "local" && (
									<Badge
										variant="outline"
										className="bg-yellow-500/10 border-yellow-500 text-yellow-400 text-xs sm:text-sm"
									>
										<Database className="w-3 h-3 mr-1" />
										Using Local Project Data
										{isGitHubConfigured() && " (GitHub Fallback)"}
									</Badge>
								)}
								{dataSource === "none" && (
									<Badge
										variant="outline"
										className="bg-red-500/10 border-red-500 text-red-400 text-xs sm:text-sm"
									>
										<AlertCircle className="w-3 h-3 mr-1" />
										No Data Available (Local Fallback Disabled)
									</Badge>
								)}
							</m.div>
						)}

						{/* Enhanced Search and Filter Section */}
						<m.section
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="mb-8 sm:mb-10 md:mb-12"
						>
							<Card variant="cyberpunk" className="p-4 sm:p-6 relative z-30">
								<div className="space-y-4">
									{/* Main Search Input */}
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											type="text"
											placeholder="Search project matrix... (title, description, technologies, tags)"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 bg-background/50 border-primary/30 focus:border-primary font-mono h-10 sm:h-12 text-sm sm:text-base touch-manipulation"
										/>
									</div>

									{/* Filters Row */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative z-20">
										{/* Tag Search Input */}
										<div className="relative" ref={tagInputRef}>
											<Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												type="text"
												placeholder="Search tags, technologies & categories..."
												value={tagSearch}
												onChange={(e) => {
													setTagSearch(e.target.value);
													setShowTagSuggestions(true);
												}}
												onFocus={() => setShowTagSuggestions(true)}
												onKeyDown={handleKeyDown}
												className="pl-10 bg-background/50 border-secondary/30 focus:border-secondary font-mono h-10 sm:h-12 text-sm sm:text-base touch-manipulation"
											/>

											{/* Tag Suggestions Dropdown */}
											<AnimatePresence>
												{showTagSuggestions &&
													filteredTagSuggestions.length > 0 && (
														<m.div
															initial={{ opacity: 0, y: -10 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -10 }}
															transition={{ duration: 0.2 }}
															className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-sm border border-primary/50 rounded-lg shadow-2xl max-h-60 overflow-hidden z-50"
															style={{
																boxShadow:
																	"0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
															}}
														>
															<div className="p-2">
																<div className="text-xs font-mono text-muted-foreground px-3 py-2 border-b border-primary/20">
																	{selectedTags.length > 0
																		? `${selectedTags.length} tag${
																				selectedTags.length !== 1 ? "s" : ""
																		  } selected • Click to add more`
																		: "Select multiple tags to filter projects"}
																</div>
																<div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50">
																	{filteredTagSuggestions.map((tag) => {
																		const isSelected =
																			selectedTags.includes(tag);
																		return (
																			<button
																				key={tag}
																				onClick={() => handleTagSelect(tag)}
																				disabled={isSelected}
																				className={`w-full text-left px-3 py-3 sm:py-2 font-mono text-sm transition-all duration-200 rounded flex items-center justify-between group touch-manipulation min-h-[44px] sm:min-h-[auto] ${
																					isSelected
																						? "bg-primary/20 text-primary cursor-default border-l-2 border-primary"
																						: "hover:bg-primary/10 text-foreground hover:border-l-2 hover:border-secondary"
																				}`}
																			>
																				<div className="flex items-center">
																					<Hash className="w-3 h-3 mr-2" />
																					{tag}
																				</div>
																				{isSelected ? (
																					<div className="flex items-center text-xs">
																						<Check className="w-3 h-3 mr-1" />
																						Selected
																					</div>
																				) : (
																					<Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
																				)}
																			</button>
																		);
																	})}
																</div>
															</div>
														</m.div>
													)}
											</AnimatePresence>
										</div>

										{/* Custom Status Dropdown */}
										<div className="relative" ref={statusDropdownRef}>
											<button
												onClick={() =>
													setShowStatusDropdown(!showStatusDropdown)
												}
												onKeyDown={handleStatusKeyDown}
												className="w-full pl-10 pr-10 py-2 bg-background/50 border border-accent/30 hover:border-accent focus:border-accent rounded-lg font-mono text-sm text-left transition-all duration-200 flex items-center justify-between relative h-10 sm:h-12 touch-manipulation"
											>
												<Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
												<span
													className={`mr-auto ${
														selectedStatus
															? "text-foreground"
															: "text-muted-foreground"
													}`}
												>
													{getStatusDisplayText()}
												</span>
												<ChevronDown
													className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
														showStatusDropdown ? "rotate-180" : ""
													}`}
												/>
											</button>

											{/* Status Dropdown Menu */}
											<AnimatePresence>
												{showStatusDropdown && (
													<m.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														transition={{ duration: 0.2 }}
														className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-sm border border-accent/50 rounded-lg shadow-2xl overflow-hidden z-50"
														style={{
															boxShadow:
																"0 0 20px rgba(128, 0, 255, 0.3), 0 0 40px rgba(255, 0, 128, 0.2)",
														}}
													>
														<div className="p-2">
															<div className="text-xs font-mono text-muted-foreground px-3 py-2 border-b border-accent/20">
																Filter by project status
															</div>
															<button
																onClick={() => handleStatusSelect("")}
																className={`w-full text-left px-3 py-3 sm:py-2 font-mono text-sm transition-all duration-200 rounded flex items-center justify-between group touch-manipulation min-h-[44px] sm:min-h-[auto] ${
																	!selectedStatus
																		? "bg-accent/20 text-accent cursor-default border-l-2 border-accent"
																		: "hover:bg-accent/10 text-foreground hover:border-l-2 hover:border-accent"
																}`}
															>
																<div className="flex items-center">
																	<Filter className="w-3 h-3 mr-2" />
																	All Status
																</div>
																{!selectedStatus && (
																	<div className="flex items-center text-xs">
																		<Check className="w-3 h-3 mr-1" />
																		Selected
																	</div>
																)}
															</button>
															{allStatuses.map((status) => {
																const isSelected = selectedStatus === status;
																const displayText =
																	status.charAt(0).toUpperCase() +
																	status.slice(1).replace("-", " ");
																return (
																	<button
																		key={status}
																		onClick={() => handleStatusSelect(status)}
																		className={`w-full text-left px-3 py-3 sm:py-2 font-mono text-sm transition-all duration-200 rounded flex items-center justify-between group touch-manipulation min-h-[44px] sm:min-h-[auto] ${
																			isSelected
																				? "bg-accent/20 text-accent cursor-default border-l-2 border-accent"
																				: "hover:bg-accent/10 text-foreground hover:border-l-2 hover:border-accent"
																		}`}
																	>
																		<div className="flex items-center">
																			{getStatusIcon(status)}
																			{displayText}
																		</div>
																		{isSelected && (
																			<div className="flex items-center text-xs">
																				<Check className="w-3 h-3 mr-1" />
																				Selected
																			</div>
																		)}
																	</button>
																);
															})}
														</div>
													</m.div>
												)}
											</AnimatePresence>
										</div>
									</div>

									{/* Clear Filters Button */}
									{(searchTerm ||
										selectedTags.length > 0 ||
										selectedStatus) && (
										<div className="flex justify-end">
											<Button
												variant="outline"
												size="sm"
												onClick={handleClearFilters}
												className="font-mono touch-manipulation min-h-[44px] sm:min-h-[auto]"
											>
												<X className="w-4 h-4 mr-2" />
												Clear All Filters
											</Button>
										</div>
									)}

									{/* Selected Tags Display */}
									{selectedTags.length > 0 && (
										<m.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="space-y-2"
										>
											<div className="flex flex-col sm:flex-row sm:items-center gap-2">
												<span className="text-sm font-mono text-muted-foreground flex items-center">
													<Filter className="w-4 h-4 mr-2" />
													Active filters ({selectedTags.length}):
												</span>
												<Badge
													variant="outline"
													className="text-xs font-mono w-fit"
												>
													{selectedTags.length === 1
														? "AND logic"
														: "Multiple tags (AND logic)"}
												</Badge>
											</div>
											<div className="flex flex-wrap gap-2">
												{selectedTags.map((tag, index) => (
													<m.div
														key={tag}
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.8 }}
														transition={{ duration: 0.2, delay: index * 0.05 }}
													>
														<Badge
															variant="secondary"
															className="font-mono cursor-pointer hover:bg-destructive/20 transition-colors group relative touch-manipulation min-h-[32px] flex items-center"
															onClick={() => handleTagRemove(tag)}
														>
															<Hash className="w-3 h-3 mr-1" />
															{tag}
															<X className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100" />
														</Badge>
													</m.div>
												))}
											</div>
										</m.div>
									)}

									{/* Search Results Summary */}
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm font-mono text-muted-foreground">
										<span>
											{filteredProjects.length} project
											{filteredProjects.length !== 1 ? "s" : ""}{" "}
											{searchTerm || selectedTags.length > 0 || selectedStatus
												? "found"
												: "available"}
											{selectedTags.length > 1 && (
												<span className="text-xs ml-2 text-primary block sm:inline">
													(matching all {selectedTags.length} tags)
												</span>
											)}
										</span>
										<span className="text-xs">
											{allTags.length} tag{allTags.length !== 1 ? "s" : ""}{" "}
											available
										</span>
									</div>
								</div>
							</Card>
						</m.section>

						{/* Featured Projects - Conditionally Rendered */}
						{featuredProjects.length > 0 &&
							!searchTerm &&
							selectedTags.length === 0 &&
							!selectedStatus && (
								<m.section
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.4 }}
									className="mb-8 sm:mb-10 md:mb-12"
								>
									<h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary mb-4 sm:mb-6 flex items-center">
										<Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
										FEATURED_PROJECTS.highlight()
									</h2>

									<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
										{featuredProjects.map((project) => (
											<Link
												key={project.id}
												href={`/projects/${project.id}`}
												className="block"
											>
												<Card
													variant="hologram"
													className="overflow-hidden group cursor-pointer h-full touch-manipulation"
												>
													{/* Mobile: Stack vertically, Tablet+: Side by side */}
													<div className="flex flex-col sm:flex-row h-full min-h-[420px] sm:min-h-[380px] md:min-h-[400px]">
														{/* Left side - Icon and badge */}
														<div className="sm:w-1/3 bg-gradient-to-br from-primary/20 to-secondary/20 p-4 sm:p-6 flex items-center justify-center flex-shrink-0">
															<div className="text-center">
																<Code className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-3 neon-glow" />
																<Badge
																	variant="outline"
																	className="neon-border text-xs"
																>
																	FEATURED
																</Badge>
															</div>
														</div>

														{/* Right side - Content */}
														<div className="sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between flex-1 min-h-0">
															{/* Top content */}
															<div className="flex-1">
																<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 text-xs text-muted-foreground font-mono">
																	<Badge
																		variant={getStatusVariant(project.status)}
																		className="font-mono text-xs w-fit"
																	>
																		{getStatusIcon(project.status)}
																		{project.status.replace("-", " ")}
																	</Badge>
																	<div className="flex items-center gap-1">
																		<Calendar className="w-3 h-3" />
																		{new Date(project.startDate).getFullYear()}
																	</div>
																</div>
																<h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary mb-3 group-hover:neon-glow transition-all line-clamp-2 leading-tight">
																	{project.title}
																</h3>
																<p className="text-muted-foreground font-mono text-sm mb-4 leading-relaxed line-clamp-3">
																	{project.description}
																</p>

																{/* Technologies */}
																<div className="flex flex-wrap gap-1 mb-4">
																	{project.technologies
																		.slice(0, 3)
																		.map((tech) => (
																			<Badge
																				key={tech}
																				variant="secondary"
																				className="text-xs font-mono cursor-pointer hover:bg-secondary/20 touch-manipulation"
																				onClick={(e) => {
																					e.preventDefault();
																					handleTagSelect(tech);
																				}}
																			>
																				<Hash className="w-2 h-2 mr-1" />
																				{tech}
																			</Badge>
																		))}
																	{project.technologies.length > 3 && (
																		<Badge
																			variant="outline"
																			className="text-xs font-mono"
																		>
																			+{project.technologies.length - 3}
																		</Badge>
																	)}
																</div>
															</div>

															{/* Bottom buttons - Always visible */}
															<div className="flex-shrink-0 space-y-3">
																<Button
																	variant="neon"
																	size="sm"
																	className="w-full touch-manipulation min-h-[48px] group-hover:scale-105 transition-transform"
																>
																	<Code className="w-4 h-4 mr-2" />
																	View Project
																	<ArrowRight className="w-4 h-4 ml-2" />
																</Button>

																{/* Secondary buttons */}
																{(project.demoUrl || project.githubUrl) && (
																	<div className="flex gap-2">
																		{project.demoUrl && (
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={(e) => {
																					e.preventDefault();
																					window.open(
																						project.demoUrl,
																						"_blank"
																					);
																				}}
																				className="touch-manipulation min-h-[44px] flex-1"
																			>
																				<Play className="w-4 h-4 mr-2" />
																				<span className="hidden sm:inline">
																					Live Demo
																				</span>
																				<span className="sm:hidden">Demo</span>
																			</Button>
																		)}

																		{project.githubUrl && (
																			<Button
																				variant="ghost"
																				size="sm"
																				onClick={(e) => {
																					e.preventDefault();
																					window.open(
																						project.githubUrl,
																						"_blank"
																					);
																				}}
																				className="touch-manipulation min-h-[44px] flex-1"
																			>
																				<Github className="w-4 h-4 mr-2" />
																				<span className="hidden sm:inline">
																					GitHub
																				</span>
																				<span className="sm:hidden">Code</span>
																			</Button>
																		)}
																	</div>
																)}
															</div>
														</div>
													</div>
												</Card>
											</Link>
										))}
									</div>
								</m.section>
							)}

						{/* Projects Grid */}
						<m.section
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.6 }}
						>
							<div className="flex items-center justify-between mb-4 sm:mb-6">
								<h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary flex items-center">
									<Code className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
									{selectedTags.length > 0 || searchTerm || selectedStatus
										? "FILTERED_PROJECTS.scan()"
										: "ALL_PROJECTS.scan()"}
								</h2>
							</div>

							{regularProjects.length === 0 ? (
								<Card
									variant="cyberpunk"
									className="p-6 sm:p-8 md:p-12 text-center"
								>
									<div className="text-muted-foreground">
										<Search className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
										<h3 className="text-lg sm:text-xl font-heading mb-2">
											No projects found
										</h3>
										<p className="font-mono mb-4 text-sm sm:text-base">
											No projects match your current search criteria
											{selectedTags.length > 1 && (
												<span className="block text-sm mt-2 text-primary">
													Projects must contain ALL selected tags
												</span>
											)}
										</p>
										<Button
											variant="outline"
											onClick={handleClearFilters}
											className="touch-manipulation min-h-[44px]"
										>
											<X className="w-4 h-4 mr-2" />
											Clear Filters
										</Button>
									</div>
								</Card>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
									{regularProjects.map((project, index) => (
										<m.div
											key={project.id}
											initial={{ opacity: 0, y: 30 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
											className="h-[420px] sm:h-[440px] md:h-[460px]"
										>
											<Link
												href={`/projects/${project.id}`}
												className="block h-full"
											>
												<Card
													variant="cyberpunk"
													className="h-full flex flex-col group cursor-pointer hover:scale-105 transition-transform touch-manipulation"
												>
													<CardHeader className="pb-3 flex-shrink-0 p-4 sm:p-6">
														<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-xs text-muted-foreground font-mono">
															<Badge
																variant={getStatusVariant(project.status)}
																className="font-mono w-fit"
															>
																{getStatusIcon(project.status)}
																{project.status.replace("-", " ")}
															</Badge>
															<div className="flex items-center gap-1">
																<Calendar className="w-3 h-3" />
																{new Date(project.startDate).getFullYear()}
															</div>
														</div>

														<CardTitle className="text-primary font-heading group-hover:neon-glow transition-all line-clamp-2 text-base sm:text-lg leading-tight">
															{project.title}
														</CardTitle>
													</CardHeader>

													<CardContent className="flex-1 flex flex-col pt-0 pb-4 px-4 sm:px-6">
														<div className="flex-1 flex flex-col min-h-0">
															<p className="text-muted-foreground font-mono text-sm leading-relaxed line-clamp-4 mb-4 flex-shrink-0">
																{project.description}
															</p>

															<div className="flex flex-wrap gap-1 mb-4 flex-shrink-0">
																{[
																	...project.technologies.slice(0, 2),
																	project.category,
																].map((tech) => {
																	const isSelected =
																		selectedTags.includes(tech);
																	return (
																		<Badge
																			key={tech}
																			variant={
																				isSelected ? "default" : "outline"
																			}
																			className={`text-xs font-mono cursor-pointer transition-all touch-manipulation ${
																				isSelected
																					? "bg-primary/20 text-primary border-primary"
																					: "hover:bg-primary/10"
																			}`}
																			onClick={(e) => {
																				e.preventDefault();
																				if (!isSelected) {
																					handleTagSelect(tech);
																				}
																			}}
																		>
																			<Hash className="w-3 h-3 mr-1" />
																			{tech}
																			{isSelected && (
																				<Check className="w-3 h-3 ml-1" />
																			)}
																		</Badge>
																	);
																})}
																{project.technologies.length > 2 && (
																	<Badge
																		variant="outline"
																		className="text-xs font-mono"
																	>
																		+{project.technologies.length - 2}
																	</Badge>
																)}
															</div>
														</div>

														{/* Buttons section - always at bottom */}
														<div className="flex-shrink-0 space-y-3 mt-auto">
															<Button
																variant="ghost"
																size="sm"
																className="w-full justify-center group-hover:bg-primary/10 touch-manipulation min-h-[48px]"
															>
																<Code className="w-4 h-4 mr-2" />
																View Project
																<ArrowRight className="w-4 h-4 ml-2" />
															</Button>

															{(project.demoUrl || project.githubUrl) && (
																<div className="flex gap-2">
																	{project.demoUrl && (
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={(e) => {
																				e.preventDefault();
																				window.open(project.demoUrl, "_blank");
																			}}
																			className="touch-manipulation min-h-[44px] flex-1"
																		>
																			<ExternalLink className="w-4 h-4 mr-2" />
																			<span className="hidden sm:inline">
																				Live Demo
																			</span>
																			<span className="sm:hidden">Demo</span>
																		</Button>
																	)}

																	{project.githubUrl && (
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={(e) => {
																				e.preventDefault();
																				window.open(
																					project.githubUrl,
																					"_blank"
																				);
																			}}
																			className="touch-manipulation min-h-[44px] flex-1"
																		>
																			<Github className="w-4 h-4 mr-2" />
																			<span className="hidden sm:inline">
																				GitHub
																			</span>
																			<span className="sm:hidden">Code</span>
																		</Button>
																	)}
																</div>
															)}
														</div>
													</CardContent>
												</Card>
											</Link>
										</m.div>
									))}
								</div>
							)}
						</m.section>
					</div>
				)}
			</div>
		</LazyMotion>
	);
}
