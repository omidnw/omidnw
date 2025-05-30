import React, {
	useState,
	useMemo,
	useRef,
	useEffect,
	useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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
	BookOpen,
	X,
	Hash,
	Plus,
	Check,
	RefreshCw,
	AlertCircle,
	GitBranch,
	Database,
} from "lucide-react";

// GitHub API integration & data types
import {
	fetchAllBlogPosts,
	isGitHubConfigured,
	clearBlogCache,
	BlogPostData, // Use the interface from github-api
} from "@/lib/github-api";
import { GITHUB_CONFIG } from "@/lib/github-config";

// Local blogs loader
import { loadLocalBlogPosts } from "@/lib/local-blogs";

export default function Blog() {
	const [searchTerm, setSearchTerm] = useState("");
	const [tagSearch, setTagSearch] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [showTagSuggestions, setShowTagSuggestions] = useState(false);
	const [posts, setPosts] = useState<BlogPostData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dataSource, setDataSource] = useState<"github" | "local" | "none">(
		"none"
	);
	const [refreshing, setRefreshing] = useState(false);
	const tagInputRef = useRef<HTMLInputElement>(null);

	// Load posts data
	const loadPosts = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			let loadedPosts: BlogPostData[] = [];

			if (isGitHubConfigured()) {
				try {
					console.log("🔍 Fetching blog posts from GitHub...");
					const githubPostsData = await fetchAllBlogPosts();
					const postsArray = Object.values(githubPostsData);

					if (postsArray.length > 0) {
						loadedPosts = postsArray;
						setDataSource("github");
						console.log(`✅ Loaded ${postsArray.length} posts from GitHub`);
					} else {
						console.log("⚠️ No posts found in GitHub, checking fallback...");
						if (GITHUB_CONFIG.enableLocalFallback) {
							console.log("🔄 Falling back to local blog files...");
							loadedPosts = await loadLocalBlogPosts();
							setDataSource("local");
						} else {
							console.log("❌ Local fallback disabled, no posts to load");
							setDataSource("none");
						}
					}
				} catch (githubError) {
					console.warn("❌ GitHub blog fetch failed:", githubError);
					if (GITHUB_CONFIG.enableLocalFallback) {
						console.log("🔄 Falling back to local blog files...");
						loadedPosts = await loadLocalBlogPosts();
						setDataSource("local");
					} else {
						console.log("❌ Local fallback disabled, showing error");
						throw githubError;
					}
				}
			} else {
				if (GITHUB_CONFIG.enableLocalFallback) {
					console.log("ℹ️ GitHub not configured, using local blog files");
					loadedPosts = await loadLocalBlogPosts();
					setDataSource("local");
				} else {
					console.log("❌ GitHub not configured and local fallback disabled");
					setDataSource("none");
				}
			}
			setPosts(
				loadedPosts.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
				)
			);
		} catch (err) {
			console.error("Error loading posts:", err);
			setError("Failed to load blog posts. Please try again.");
			if (GITHUB_CONFIG.enableLocalFallback) {
				try {
					const fallbackPosts = await loadLocalBlogPosts();
					setPosts(
						fallbackPosts.sort(
							(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
						)
					);
					setDataSource("local");
				} catch (fallbackError) {
					console.error("Final blog fallback failed:", fallbackError);
					setPosts([]);
					setDataSource("none");
				}
			} else {
				setPosts([]);
				setDataSource("none");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// Refresh posts data
	const refreshPosts = useCallback(async () => {
		setRefreshing(true);
		if (dataSource === "github") {
			clearBlogCache();
		}
		await loadPosts();
		setRefreshing(false);
	}, [dataSource, loadPosts]);

	// Load posts on component mount
	useEffect(() => {
		loadPosts();
	}, [loadPosts]);

	// Get all unique tags from posts
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		posts.forEach((post) => {
			post.tags.forEach((tag) => tags.add(tag));
		});
		return Array.from(tags).sort();
	}, [posts]);

	// Filter tags based on tag search input
	const filteredTagSuggestions = useMemo(() => {
		if (!tagSearch.trim()) return allTags;
		return allTags.filter((tag) =>
			tag.toLowerCase().includes(tagSearch.toLowerCase())
		);
	}, [tagSearch, allTags]);

	// Filter posts based on search term and selected tags
	const filteredPosts = useMemo(() => {
		return posts.filter((post) => {
			const matchesSearch =
				!searchTerm.trim() ||
				post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.tags.some((tag) =>
					tag.toLowerCase().includes(searchTerm.toLowerCase())
				);

			const matchesTags =
				selectedTags.length === 0 ||
				selectedTags.every((selectedTag) =>
					post.tags.some((postTag) =>
						postTag.toLowerCase().includes(selectedTag.toLowerCase())
					)
				);

			return matchesSearch && matchesTags;
		});
	}, [searchTerm, selectedTags, posts]);

	const featuredPost = useMemo(() => posts.find((p) => p.featured), [posts]);
	const regularPosts = useMemo(
		() =>
			filteredPosts.filter(
				(p) => !p.featured || searchTerm || selectedTags.length > 0
			),
		[filteredPosts, searchTerm, selectedTags]
	);

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
		setShowTagSuggestions(false);
	};

	// Handle clicks outside tag suggestions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				tagInputRef.current &&
				!tagInputRef.current.contains(event.target as Node)
			) {
				setShowTagSuggestions(false);
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
		}
	};

	// Loading State
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
					<p className="text-muted-foreground font-mono mb-2">
						{isGitHubConfigured()
							? "Accessing neural network for blog data..."
							: "Scanning local blog archives..."}
					</p>
				</div>
			</div>
		);
	}

	// Error State
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card variant="cyberpunk" className="p-12 text-center max-w-md">
					<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
					<h1 className="text-2xl font-heading font-bold text-red-400 mb-4">
						Data Stream Interrupted
					</h1>
					<p className="text-muted-foreground font-mono mb-6">{error}</p>
					<div className="flex gap-2 justify-center">
						<Button variant="neon" onClick={refreshPosts} disabled={refreshing}>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
							/>
							Retry Connection
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<motion.header
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="text-center py-12 mb-8"
			>
				<h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black mb-4 neon-glow text-primary">
					NEURAL_BLOG.sh
				</h1>
				<p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
					Transmissions from the digital frontier - insights, tutorials, and
					thoughts on cybernetic development
				</p>
				{/* Data source indicator */}
				<div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono">
					{dataSource === "github" && (
						<Badge
							variant="outline"
							className="bg-green-500/10 border-green-500 text-green-400"
						>
							<GitBranch className="w-3 h-3 mr-1" /> GitHub
						</Badge>
					)}
					{dataSource === "local" && (
						<Badge
							variant="outline"
							className="bg-blue-500/10 border-blue-500 text-blue-400"
						>
							<Database className="w-3 h-3 mr-1" /> Local
						</Badge>
					)}
					{dataSource === "github" && (
						<Button
							variant="ghost"
							size="sm"
							onClick={refreshPosts}
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
			</motion.header>

			{/* Enhanced Search and Filter Section */}
			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="mb-12 relative z-30" // Ensure filter section is above content
			>
				<Card variant="cyberpunk" className="p-6">
					<div className="space-y-4">
						{/* Main Search Input */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search neural pathways... (title, content, author, tags)"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 bg-background/50 border-primary/30 focus:border-primary font-mono"
							/>
						</div>

						{/* Tag Search and Filter */}
						<div className="flex flex-col md:flex-row gap-4 relative z-20">
							{" "}
							{/* Ensure tag dropdown is above content */}
							{/* Tag Search Input */}
							<div className="relative flex-1" ref={tagInputRef}>
								<Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Search and filter by tags..."
									value={tagSearch}
									onChange={(e) => {
										setTagSearch(e.target.value);
										setShowTagSuggestions(true);
									}}
									onFocus={() => setShowTagSuggestions(true)}
									onKeyDown={handleKeyDown}
									className="pl-10 bg-background/50 border-secondary/30 focus:border-secondary font-mono"
								/>

								{/* Tag Suggestions Dropdown */}
								<AnimatePresence>
									{showTagSuggestions && filteredTagSuggestions.length > 0 && (
										<motion.div
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
														  } selected`
														: "Select tags to filter"}
												</div>
												<div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50">
													{filteredTagSuggestions.map((tag) => {
														const isSelected = selectedTags.includes(tag);
														return (
															<button
																key={tag}
																onClick={() => handleTagSelect(tag)}
																disabled={isSelected}
																className={`w-full text-left px-3 py-2 font-mono text-sm transition-all duration-200 rounded flex items-center justify-between group ${
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
										</motion.div>
									)}
								</AnimatePresence>
							</div>
							{/* Clear Filters Button */}
							{(searchTerm || selectedTags.length > 0) && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleClearFilters}
									className="font-mono whitespace-nowrap md:mt-0 mt-2"
								>
									<X className="w-4 h-4 mr-2" />
									Clear All
								</Button>
							)}
						</div>

						{/* Selected Tags Display */}
						{selectedTags.length > 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="space-y-2 pt-4"
							>
								<div className="flex items-center gap-2">
									<span className="text-sm font-mono text-muted-foreground flex items-center">
										<Filter className="w-4 h-4 mr-2" />
										Active filters ({selectedTags.length}):
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{selectedTags.map((tag, index) => (
										<motion.div
											key={tag}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											transition={{ duration: 0.2, delay: index * 0.05 }}
										>
											<Badge
												variant="secondary"
												className="font-mono cursor-pointer hover:bg-destructive/20 transition-colors group relative"
												onClick={() => handleTagRemove(tag)}
											>
												<Hash className="w-3 h-3 mr-1" />
												{tag}
												<X className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100" />
											</Badge>
										</motion.div>
									))}
								</div>
							</motion.div>
						)}

						{/* Search Results Summary */}
						<div className="flex items-center justify-between text-sm font-mono text-muted-foreground pt-4">
							<span>
								{filteredPosts.length} post
								{filteredPosts.length !== 1 ? "s" : ""}
								{posts.length > 0 && searchTerm && !filteredPosts.length
									? ""
									: searchTerm || selectedTags.length > 0
									? " found"
									: " available"}
								{selectedTags.length > 1 && (
									<span className="text-xs ml-2 text-primary">
										(matching all {selectedTags.length} tags)
									</span>
								)}
							</span>
							<span className="text-xs">
								{allTags.length} tag{allTags.length !== 1 ? "s" : ""} available
							</span>
						</div>
					</div>
				</Card>
			</motion.section>

			{/* Featured Post */}
			{featuredPost && !selectedTags.length && !searchTerm && (
				<motion.section
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mb-12"
				>
					<h2 className="text-2xl font-heading font-bold text-primary mb-6 flex items-center">
						<BookOpen className="w-6 h-6 mr-2" />
						FEATURED_POST.highlight()
					</h2>

					<Link href={`/blog/${featuredPost.id}`}>
						<Card
							variant="hologram"
							className="overflow-hidden group cursor-pointer"
						>
							<div className="md:flex">
								<div className="md:w-1/3 bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex items-center justify-center">
									<div className="text-center">
										<BookOpen className="w-16 h-16 text-primary mx-auto mb-4 neon-glow" />
										<Badge variant="outline" className="neon-border">
											FEATURED
										</Badge>
									</div>
								</div>
								<div className="md:w-2/3 p-8">
									<div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground font-mono">
										<div className="flex items-center gap-1">
											<Calendar className="w-4 h-4" />
											{new Date(featuredPost.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</div>
										<div className="flex items-center gap-1">
											<Clock className="w-4 h-4" />
											{featuredPost.readTime}
										</div>
									</div>

									<h3 className="text-2xl font-heading font-bold text-primary mb-3 group-hover:neon-glow transition-all">
										{featuredPost.title}
									</h3>

									<p className="text-muted-foreground font-mono mb-4 leading-relaxed line-clamp-3">
										{featuredPost.excerpt}
									</p>

									<div className="flex flex-wrap gap-2 mb-4">
										{featuredPost.tags.slice(0, 4).map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="text-xs font-mono cursor-pointer hover:bg-secondary/20"
												onClick={(e) => {
													e.preventDefault();
													handleTagSelect(tag);
												}}
											>
												<Hash className="w-3 h-3 mr-1" />
												{tag}
											</Badge>
										))}
										{featuredPost.tags.length > 4 && (
											<Badge variant="outline" className="text-xs font-mono">
												+{featuredPost.tags.length - 4}
											</Badge>
										)}
									</div>

									<Button
										variant="neon"
										className="group-hover:scale-105 transition-transform"
									>
										Read Full Post
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</div>
							</div>
						</Card>
					</Link>
				</motion.section>
			)}

			{/* Blog Posts Grid */}
			<motion.section
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{
					duration: 0.6,
					delay:
						featuredPost && !selectedTags.length && !searchTerm ? 0.6 : 0.4,
				}}
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-heading font-bold text-primary flex items-center">
						<Tag className="w-6 h-6 mr-2" />
						{selectedTags.length > 0 || searchTerm
							? "FILTERED_RESULTS.scan()"
							: "ALL_POSTS.scan()"}
					</h2>
				</div>

				{filteredPosts.length === 0 &&
				(searchTerm || selectedTags.length > 0) ? (
					<Card variant="cyberpunk" className="p-12 text-center">
						<div className="text-muted-foreground">
							<Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
							<h3 className="text-xl font-heading mb-2">No posts found</h3>
							<p className="font-mono mb-4">
								No posts match your current search criteria.
								{selectedTags.length > 1 && (
									<span className="block text-sm mt-2 text-primary">
										Posts must contain ALL selected tags.
									</span>
								)}
							</p>
							<Button variant="outline" onClick={handleClearFilters}>
								<X className="w-4 h-4 mr-2" />
								Clear Filters
							</Button>
						</div>
					</Card>
				) : posts.length === 0 && !loading ? (
					<Card variant="cyberpunk" className="p-12 text-center">
						<div className="text-muted-foreground">
							<BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
							<h3 className="text-xl font-heading mb-2">No Blog Posts Yet</h3>
							<p className="font-mono mb-4">
								{dataSource === "github"
									? "No blog posts found in the GitHub repository."
									: "No local blog posts found. Add some MDX files to your blogs folder."}
							</p>
							{dataSource === "github" && (
								<Button
									variant="outline"
									onClick={refreshPosts}
									disabled={refreshing}
								>
									<RefreshCw
										className={`w-4 h-4 mr-2 ${
											refreshing ? "animate-spin" : ""
										}`}
									/>
									Refresh from GitHub
								</Button>
							)}
						</div>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{(searchTerm || selectedTags.length > 0
							? filteredPosts
							: regularPosts
						).map((post, index) => (
							<motion.div
								key={post.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
							>
								<Link href={`/blog/${post.id}`}>
									<Card
										variant="cyberpunk"
										className="h-full flex flex-col group cursor-pointer hover:scale-105 transition-transform"
									>
										<CardHeader className="pb-3">
											<div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground font-mono">
												<div className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{new Date(post.date).toLocaleDateString("en-US", {
														year: "numeric",
														month: "short",
														day: "numeric",
													})}
												</div>
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{post.readTime}
												</div>
											</div>

											<CardTitle className="text-lg text-primary font-heading group-hover:neon-glow transition-all line-clamp-2 h-[3rem] leading-tight flex items-start">
												{post.title}
											</CardTitle>
										</CardHeader>

										<CardContent className="flex-1 flex flex-col pt-0 pb-4">
											<p className="text-muted-foreground font-mono text-sm mb-4 flex-1 leading-relaxed line-clamp-4 h-[5.5rem]">
												{post.excerpt}
											</p>

											<div className="flex flex-wrap gap-1 mb-4 h-[2.5rem] overflow-hidden items-center">
												{post.tags.slice(0, 3).map((tag) => {
													const isSelected = selectedTags.includes(tag);
													return (
														<Badge
															key={tag}
															variant={isSelected ? "default" : "outline"}
															className={`text-xs font-mono cursor-pointer transition-all ${
																isSelected
																	? "bg-primary/20 text-primary border-primary"
																	: "hover:bg-primary/10"
															}`}
															onClick={(e) => {
																e.preventDefault();
																if (!isSelected) {
																	handleTagSelect(tag);
																}
															}}
														>
															<Hash className="w-3 h-3 mr-1" />
															{tag}
															{isSelected && <Check className="w-3 h-3 ml-1" />}
														</Badge>
													);
												})}
												{post.tags.length > 3 && (
													<Badge
														variant="outline"
														className="text-xs font-mono"
													>
														+{post.tags.length - 3}
													</Badge>
												)}
											</div>

											<Button
												variant="ghost"
												size="sm"
												className="w-full justify-between group-hover:bg-primary/10 mt-auto pt-2"
											>
												Read More
												<ArrowRight className="w-4 h-4" />
											</Button>
										</CardContent>
									</Card>
								</Link>
							</motion.div>
						))}
					</div>
				)}
			</motion.section>
		</div>
	);
}
