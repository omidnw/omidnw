import React, { useState, useEffect } from "react";
import { Route, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
	Shield,
	Home,
	FileText,
	Folder,
	GitHub,
	LogOut,
	Settings,
	Menu,
	X,
	Terminal,
	Activity,
	TrendingUp,
	Database,
	Clock,
	Eye,
	Edit,
	Plus,
	Trash2,
	RefreshCw,
	CheckCircle,
	XCircle,
	Users,
	BarChart3,
	Calendar,
	Zap,
	Globe,
	Star,
	Tag,
	Image,
	LinkIcon,
	AlertCircle,
	Cpu,
	HardDrive,
	Wifi,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";
import NeuralLinkAnimation from "../components/NeuralLinkAnimation";

interface User {
	id: number;
	username: string;
	email: string;
	lastLoginAt: string | null;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
}

interface DashboardStats {
	totalPosts: number;
	publishedPosts: number;
	totalProjects: number;
	featuredProjects: number;
	lastSyncAt: string | null;
	systemStatus: "online" | "offline" | "maintenance";
}

// Dashboard Overview Component
const AdminDashboard = ({ apiCall }: { apiCall: any }) => {
	const [stats, setStats] = useState<DashboardStats>({
		totalPosts: 0,
		publishedPosts: 0,
		totalProjects: 0,
		featuredProjects: 0,
		lastSyncAt: null,
		systemStatus: "online",
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const response = await apiCall("/stats");
				const data = await response.json();
				if (data.success) {
					setStats(data.stats);
				}
			} catch (error) {
				console.error("Error loading stats:", error);
			} finally {
				setLoading(false);
			}
		};

		loadStats();
	}, [apiCall]);

	const statCards = [
		{
			title: "Total Posts",
			value: stats.totalPosts,
			icon: FileText,
			color: "from-cyan-400 to-blue-500",
			bgColor: "bg-cyan-500/10",
			borderColor: "border-cyan-500/20",
		},
		{
			title: "Published Posts",
			value: stats.publishedPosts,
			icon: CheckCircle,
			color: "from-green-400 to-emerald-500",
			bgColor: "bg-green-500/10",
			borderColor: "border-green-500/20",
		},
		{
			title: "Total Projects",
			value: stats.totalProjects,
			icon: Folder,
			color: "from-purple-400 to-pink-500",
			bgColor: "bg-purple-500/10",
			borderColor: "border-purple-500/20",
		},
		{
			title: "Featured Projects",
			value: stats.featuredProjects,
			icon: Star,
			color: "from-yellow-400 to-orange-500",
			bgColor: "bg-yellow-500/10",
			borderColor: "border-yellow-500/20",
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
						DASHBOARD_OVERVIEW
					</h1>
					<p className="text-gray-400 mt-2">System status and analytics</p>
				</div>
				<div className="flex items-center space-x-2">
					<div className="flex items-center space-x-2">
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
						<span className="text-sm text-green-400 font-mono">
							SYSTEM_ONLINE
						</span>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<motion.div
							key={stat.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card
								className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm`}
							>
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
												{stat.title}
											</p>
											<p
												className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
											>
												{loading ? "—" : stat.value}
											</p>
										</div>
										<div className={`p-3 rounded-lg ${stat.bgColor}`}>
											<Icon className="w-6 h-6 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* System Status */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="bg-gray-900/50 border-gray-700">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Activity className="w-5 h-5 text-cyan-400" />
							<span>System Status</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">Database</span>
								<Badge className="bg-green-500/20 text-green-400">Online</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">API Server</span>
								<Badge className="bg-green-500/20 text-green-400">Online</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">GitHub Sync</span>
								<Badge className="bg-blue-500/20 text-blue-400">
									Connected
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">Last Sync</span>
								<span className="text-sm text-gray-300">
									{stats.lastSyncAt
										? new Date(stats.lastSyncAt).toLocaleString()
										: "Never"}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gray-900/50 border-gray-700">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<BarChart3 className="w-5 h-5 text-purple-400" />
							<span>Quick Actions</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Link href="/admin/posts">
								<Button className="w-full justify-start bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20">
									<Plus className="w-4 h-4 mr-2" />
									Create New Post
								</Button>
							</Link>
							<Link href="/admin/projects">
								<Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20">
									<Folder className="w-4 h-4 mr-2" />
									Add Project
								</Button>
							</Link>
							<Link href="/admin/github">
								<Button className="w-full justify-start bg-green-500/10 hover:bg-green-500/20 border-green-500/20">
									<RefreshCw className="w-4 h-4 mr-2" />
									Sync GitHub
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

// Posts Management Component
const AdminPosts = ({ apiCall }: { apiCall: any }) => {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		loadPosts();
	}, []);

	const loadPosts = async () => {
		try {
			const response = await apiCall("/posts");
			const data = await response.json();
			if (data.success) {
				setPosts(data.posts);
			}
		} catch (error) {
			console.error("Error loading posts:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
					POSTS_MANAGEMENT
				</h1>
				<Button
					onClick={() => setShowCreateForm(true)}
					className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
				>
					<Plus className="w-4 h-4 mr-2" />
					Create Post
				</Button>
			</div>

			{/* Posts List */}
			<div className="space-y-4">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : posts.length === 0 ? (
					<Card className="bg-gray-900/50 border-gray-700">
						<CardContent className="text-center py-12">
							<FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
							<p className="text-gray-400">
								No posts yet. Create your first post!
							</p>
						</CardContent>
					</Card>
				) : (
					posts.map((post: any) => (
						<Card key={post.id} className="bg-gray-900/50 border-gray-700">
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-white mb-2">
											{post.title}
										</h3>
										<p className="text-gray-400 mb-4">{post.excerpt}</p>
										<div className="flex items-center space-x-4 text-sm text-gray-500">
											<span>
												Created: {new Date(post.createdAt).toLocaleDateString()}
											</span>
											{post.publishedAt && (
												<span>
													Published:{" "}
													{new Date(post.publishedAt).toLocaleDateString()}
												</span>
											)}
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Badge
											className={
												post.isPublished
													? "bg-green-500/20 text-green-400"
													: "bg-gray-500/20 text-gray-400"
											}
										>
											{post.isPublished ? "Published" : "Draft"}
										</Badge>
										<Button size="sm" variant="outline">
											<Edit className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
};

// Projects Management Component
const AdminProjects = ({ apiCall }: { apiCall: any }) => {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadProjects();
	}, []);

	const loadProjects = async () => {
		try {
			const response = await apiCall("/projects");
			const data = await response.json();
			if (data.success) {
				setProjects(data.projects);
			}
		} catch (error) {
			console.error("Error loading projects:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
					PROJECTS_MANAGEMENT
				</h1>
				<Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
					<Plus className="w-4 h-4 mr-2" />
					Add Project
				</Button>
			</div>

			{/* Projects Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{loading ? (
					<div className="col-span-full flex items-center justify-center py-12">
						<div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : projects.length === 0 ? (
					<Card className="col-span-full bg-gray-900/50 border-gray-700">
						<CardContent className="text-center py-12">
							<Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
							<p className="text-gray-400">
								No projects yet. Add your first project!
							</p>
						</CardContent>
					</Card>
				) : (
					projects.map((project: any) => (
						<Card key={project.id} className="bg-gray-900/50 border-gray-700">
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-4">
									<h3 className="text-lg font-semibold text-white">
										{project.title}
									</h3>
									<div className="flex items-center space-x-2">
										{project.featured && (
											<Badge className="bg-yellow-500/20 text-yellow-400">
												<Star className="w-3 h-3 mr-1" />
												Featured
											</Badge>
										)}
										<Badge
											className={
												project.isPublished
													? "bg-green-500/20 text-green-400"
													: "bg-gray-500/20 text-gray-400"
											}
										>
											{project.isPublished ? "Published" : "Draft"}
										</Badge>
									</div>
								</div>
								<p className="text-gray-400 mb-4">{project.description}</p>
								<div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
									{project.githubUrl && (
										<a
											href={project.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center space-x-1 hover:text-cyan-400"
										>
											<GitHub className="w-4 h-4" />
											<span>GitHub</span>
										</a>
									)}
									{project.liveUrl && (
										<a
											href={project.liveUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center space-x-1 hover:text-purple-400"
										>
											<Globe className="w-4 h-4" />
											<span>Live Demo</span>
										</a>
									)}
								</div>
								<div className="flex items-center justify-between">
									<div className="flex flex-wrap gap-2">
										{project.technologies &&
											JSON.parse(project.technologies)
												.slice(0, 3)
												.map((tech: string) => (
													<Badge
														key={tech}
														variant="outline"
														className="text-xs"
													>
														{tech}
													</Badge>
												))}
									</div>
									<Button size="sm" variant="outline">
										<Edit className="w-4 h-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
};

// GitHub Sync Component
const AdminGitHub = ({ apiCall }: { apiCall: any }) => {
	const [syncStatus, setSyncStatus] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		loadSyncStatus();
	}, []);

	const loadSyncStatus = async () => {
		try {
			const response = await apiCall("/github/status");
			const data = await response.json();
			if (data.success) {
				setSyncStatus(data.status);
			}
		} catch (error) {
			console.error("Error loading sync status:", error);
		} finally {
			setLoading(false);
		}
	};

	const triggerSync = async () => {
		setSyncing(true);
		try {
			const response = await apiCall("/github/sync", { method: "POST" });
			const data = await response.json();
			if (data.success) {
				toast({
					title: "Sync started",
					description: "GitHub content sync has been initiated.",
				});
				loadSyncStatus();
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast({
				title: "Sync failed",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setSyncing(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
					GITHUB_SYNC
				</h1>
				<Button
					onClick={triggerSync}
					disabled={syncing}
					className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
				>
					{syncing ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
							Syncing...
						</>
					) : (
						<>
							<RefreshCw className="w-4 h-4 mr-2" />
							Sync Now
						</>
					)}
				</Button>
			</div>

			{/* Sync Status */}
			<Card className="bg-gray-900/50 border-gray-700">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<GitHub className="w-5 h-5 text-white" />
						<span>Sync Status</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">Connection Status</span>
								<Badge className="bg-green-500/20 text-green-400">
									Connected
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">Last Sync</span>
								<span className="text-sm text-gray-300">
									{syncStatus?.lastSyncAt
										? new Date(syncStatus.lastSyncAt).toLocaleString()
										: "Never"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-400">Auto Sync</span>
								<Switch checked={syncStatus?.autoSync || false} />
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sync History */}
			<Card className="bg-gray-900/50 border-gray-700">
				<CardHeader>
					<CardTitle>Recent Sync Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{syncStatus?.history?.length > 0 ? (
							syncStatus.history.map((entry: any, index: number) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
								>
									<div className="flex items-center space-x-3">
										<div
											className={`w-2 h-2 rounded-full ${
												entry.success ? "bg-green-400" : "bg-red-400"
											}`}
										></div>
										<span className="text-sm">{entry.message}</span>
									</div>
									<span className="text-xs text-gray-500">
										{new Date(entry.timestamp).toLocaleString()}
									</span>
								</div>
							))
						) : (
							<p className="text-gray-400 text-center py-8">
								No sync history available
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

// Settings Component
const AdminSettings = ({ apiCall, user }: { apiCall: any; user: User }) => {
	const [settings, setSettings] = useState({
		username: user.username,
		email: user.email,
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleSave = async () => {
		setLoading(true);
		try {
			const response = await apiCall("/settings", {
				method: "PUT",
				body: JSON.stringify(settings),
			});
			const data = await response.json();
			if (data.success) {
				toast({
					title: "Settings saved",
					description: "Your settings have been updated successfully.",
				});
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast({
				title: "Save failed",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
				SETTINGS
			</h1>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Account Settings */}
				<Card className="bg-gray-900/50 border-gray-700">
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								value={settings.username}
								onChange={(e) =>
									setSettings((prev) => ({ ...prev, username: e.target.value }))
								}
								className="bg-gray-800/50 border-gray-600"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={settings.email}
								onChange={(e) =>
									setSettings((prev) => ({ ...prev, email: e.target.value }))
								}
								className="bg-gray-800/50 border-gray-600"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Password Change */}
				<Card className="bg-gray-900/50 border-gray-700">
					<CardHeader>
						<CardTitle>Change Password</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="currentPassword">Current Password</Label>
							<Input
								id="currentPassword"
								type="password"
								value={settings.currentPassword}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										currentPassword: e.target.value,
									}))
								}
								className="bg-gray-800/50 border-gray-600"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newPassword">New Password</Label>
							<Input
								id="newPassword"
								type="password"
								value={settings.newPassword}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										newPassword: e.target.value,
									}))
								}
								className="bg-gray-800/50 border-gray-600"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm New Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={settings.confirmPassword}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
								className="bg-gray-800/50 border-gray-600"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end">
				<Button
					onClick={handleSave}
					disabled={loading}
					className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
				>
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
							Saving...
						</>
					) : (
						"Save Settings"
					)}
				</Button>
			</div>
		</div>
	);
};

// Main Admin Component
export default function Admin() {
	const [auth, setAuth] = useState<AuthState>({
		isAuthenticated: false,
		user: null,
		accessToken: null,
		refreshToken: null,
	});
	const [loading, setLoading] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [location, setLocation] = useLocation();
	const { toast } = useToast();
	const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
	const [loginUrl, setLoginUrl] = useState("");

	// Check for existing authentication on mount
	useEffect(() => {
		const checkAuth = () => {
			try {
				const token = localStorage.getItem("admin_token");
				const refreshToken = localStorage.getItem("admin_refresh_token");

				if (token && refreshToken) {
					// TODO: Validate token with server
					setAuth({
						isAuthenticated: true,
						user: {
							id: 1,
							username: "admin",
							email: "admin@example.com",
							lastLoginAt: null,
						},
						accessToken: token,
						refreshToken: refreshToken,
					});
				}
			} catch (error) {
				console.error("Error checking auth:", error);
				localStorage.removeItem("admin_token");
				localStorage.removeItem("admin_refresh_token");
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Handle logout
	const handleLogout = async () => {
		try {
			await fetch("/api/admin/auth/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				},
				body: JSON.stringify({ refreshToken: auth.refreshToken }),
			});
		} catch (error) {
			console.error("Logout error:", error);
		}

		// Get dynamic login URL for later use
		try {
			const urlResponse = await fetch(
				"/api/admin/urls?key=cyberpunk-portfolio-admin"
			);
			const urlData = await urlResponse.json();
			const finalUrl = urlData.success ? urlData.urls.login : "/admin-login";
			setLoginUrl(finalUrl);
		} catch (error) {
			setLoginUrl("/admin-login");
		}

		// Show neural link disconnection animation
		setShowLogoutAnimation(true);
	};

	const handleLogoutComplete = () => {
		// Clear auth state and redirect after animation
		setAuth({
			isAuthenticated: false,
			user: null,
			accessToken: null,
			refreshToken: null,
		});
		localStorage.removeItem("admin_token");
		localStorage.removeItem("admin_refresh_token");

		toast({
			title: "Neural Link Terminated",
			description: "You have been securely disconnected from the system.",
		});

		setLocation(loginUrl);
	};

	// API helper with authentication
	const apiCall = async (endpoint: string, options: RequestInit = {}) => {
		const response = await fetch(`/api/admin${endpoint}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${auth.accessToken}`,
				...options.headers,
			},
		});

		if (response.status === 401) {
			handleLogout();
			throw new Error("Session expired. Please log in again.");
		}

		return response;
	};

	// Navigation items
	const navItems = [
		{
			href: "/admin/dashboard",
			icon: Home,
			label: "Dashboard",
			description: "Overview and statistics",
		},
		{
			href: "/admin/posts",
			icon: FileText,
			label: "Posts",
			description: "Manage blog posts",
		},
		{
			href: "/admin/projects",
			icon: Folder,
			label: "Projects",
			description: "Manage portfolio projects",
		},
		{
			href: "/admin/github",
			icon: GitHub,
			label: "GitHub Sync",
			description: "Sync content from GitHub",
		},
		{
			href: "/admin/settings",
			icon: Settings,
			label: "Settings",
			description: "Account and system settings",
		},
	];

	useEffect(() => {
		if (!auth.isAuthenticated && !loading) {
			const redirectToLogin = async () => {
				try {
					const token = localStorage.getItem("admin_token");
					const headers: HeadersInit = {};
					if (token) {
						headers["Authorization"] = `Bearer ${token}`;
					}

					const urlResponse = await fetch(
						"/api/admin/urls?key=cyberpunk-portfolio-admin",
						{ headers }
					);
					const urlData = await urlResponse.json();
					if (urlData.success) {
						setLocation(urlData.urls.login);
					} else {
						setLocation("/admin-login");
					}
				} catch (error) {
					setLocation("/admin-login");
				}
			};
			redirectToLogin();
		}
	}, [auth.isAuthenticated, loading, setLocation]);

	// Sidebar component
	const Sidebar = () => (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			exit={{ x: -300 }}
			className="fixed left-0 top-0 z-50 h-full w-80 bg-gray-950/95 backdrop-blur-md border-r border-cyan-500/20 overflow-y-auto"
		>
			<div className="p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
							<Terminal className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
								ADMIN_PORTAL
							</h1>
							<p className="text-sm text-gray-400">Cyberpunk Dashboard</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSidebarOpen(false)}
						className="md:hidden text-gray-400 hover:text-cyan-400"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* User info */}
				<Card className="bg-gray-900/50 border-cyan-500/20 mb-6">
					<CardContent className="p-4">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center">
								<span className="text-sm font-semibold text-white">
									{auth.user?.username?.[0]?.toUpperCase()}
								</span>
							</div>
							<div>
								<p className="font-medium text-white">{auth.user?.username}</p>
								<p className="text-sm text-gray-400">{auth.user?.email}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Navigation */}
				<nav className="space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = location === item.href;

						return (
							<Link key={item.href} href={item.href}>
								<motion.a
									whileHover={{ x: 4 }}
									className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer
                    ${
											isActive
												? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400"
												: "text-gray-300 hover:bg-gray-800/50 hover:text-cyan-400"
										}
                  `}
									onClick={() => setSidebarOpen(false)}
								>
									<Icon className="w-5 h-5" />
									<div>
										<p className="font-medium">{item.label}</p>
										<p className="text-xs opacity-70">{item.description}</p>
									</div>
									{isActive && (
										<motion.div
											layoutId="activeTab"
											className="ml-auto w-2 h-2 bg-cyan-400 rounded-full"
										/>
									)}
								</motion.a>
							</Link>
						);
					})}
				</nav>

				{/* Logout button */}
				<div className="absolute bottom-6 left-6 right-6">
					<Button
						onClick={handleLogout}
						variant="outline"
						className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
					>
						<LogOut className="w-4 h-4 mr-2" />
						Logout
					</Button>
				</div>
			</div>
		</motion.div>
	);

	// Loading screen
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-950 flex items-center justify-center">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
				/>
			</div>
		);
	}

	if (!auth.isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-950 flex items-center justify-center">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
				/>
			</div>
		);
	}

	// Show logout animation if logging out
	if (showLogoutAnimation) {
		return (
			<NeuralLinkAnimation
				type="disconnecting"
				onComplete={handleLogoutComplete}
				duration={3500}
			/>
		);
	}

	// Main admin interface
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			{/* Mobile header */}
			<div className="md:hidden flex items-center justify-between p-4 bg-gray-900/50 border-b border-cyan-500/20">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setSidebarOpen(true)}
					className="text-gray-400 hover:text-cyan-400"
				>
					<Menu className="w-5 h-5" />
				</Button>
				<h1 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
					ADMIN_PORTAL
				</h1>
				<Button
					onClick={handleLogout}
					variant="ghost"
					size="sm"
					className="text-red-400 hover:text-red-300"
				>
					<LogOut className="w-5 h-5" />
				</Button>
			</div>

			{/* Sidebar */}
			<AnimatePresence>
				{(sidebarOpen ||
					(typeof window !== "undefined" && window.innerWidth >= 768)) && (
					<Sidebar />
				)}
			</AnimatePresence>

			{/* Sidebar overlay for mobile */}
			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 z-40 md:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Main content */}
			<div className="md:ml-80 min-h-screen">
				<div className="p-6">
					<Route
						path="/admin"
						component={() => <AdminDashboard apiCall={apiCall} />}
					/>
					<Route
						path="/admin/dashboard"
						component={() => <AdminDashboard apiCall={apiCall} />}
					/>
					<Route
						path="/admin/posts"
						component={() => <AdminPosts apiCall={apiCall} />}
					/>
					<Route
						path="/admin/projects"
						component={() => <AdminProjects apiCall={apiCall} />}
					/>
					<Route
						path="/admin/github"
						component={() => <AdminGitHub apiCall={apiCall} />}
					/>
					<Route
						path="/admin/settings"
						component={() => (
							<AdminSettings apiCall={apiCall} user={auth.user!} />
						)}
					/>
				</div>
			</div>
		</div>
	);
}
