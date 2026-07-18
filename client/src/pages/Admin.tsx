import React, { useState, useEffect } from "react";
import { Route, useLocation } from "wouter";
import { motion } from "framer-motion";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import PostsList from "@/components/posts/PostsList";
import ProjectsList from "@/components/projects/ProjectsList";
import CreatePostForm from "@/components/posts/CreatePostForm";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import GitHubSyncPage from "@/components/github/GitHubSyncPage";
import { usePostsData } from "@/hooks/admin/usePostsData";
import { useProjectsData } from "@/hooks/admin/useProjectsData";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NeuralLinkAnimation from "@/components/NeuralLinkAnimation";

const AdminSettings: React.FC = () => {
	const { auth, apiCall } = useAdmin();
	const [settings, setSettings] = useState({
		username: auth.user?.username || "",
		email: auth.user?.email || "",
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
		<div className="space-y-6 relative">
			{/* Background effects */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
			</div>

			{/* Header */}
			<div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90 border border-cyan-500/20 backdrop-blur-xl">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent rounded-2xl"></div>
				<div className="relative z-10">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono mb-2">
						SETTINGS
					</h1>
					<p className="text-gray-400 font-mono text-sm tracking-wide">
						Manage your account and preferences
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="group relative border-2 border-cyan-500/30 bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90 backdrop-blur-xl overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					<div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
					<CardContent className="relative p-6 z-10">
						<h3 className="text-xl font-bold text-cyan-400 mb-6 font-mono">
							Account Information
						</h3>
						<div className="space-y-2.5">
							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									value={settings.username}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											username: e.target.value,
										}))
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
						</div>
					</CardContent>
				</Card>

				<Card className="group relative border-2 border-purple-500/30 bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-gray-900/90 backdrop-blur-xl overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					<div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
					<CardContent className="relative p-6 z-10">
						<h3 className="text-xl font-bold text-purple-400 mb-6 font-mono">
							Change Password
						</h3>
						<div className="space-y-2.5">
							<div className="space-y-2">
								<Label htmlFor="current-password">Current Password</Label>
								<Input
									id="current-password"
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
								<Label htmlFor="new-password">New Password</Label>
								<Input
									id="new-password"
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
								<Label htmlFor="confirm-password">Confirm Password</Label>
								<Input
									id="confirm-password"
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
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end">
				<Button
					onClick={handleSave}
					disabled={loading}
					className="relative bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] border-0 overflow-hidden font-mono px-8"
				>
					<span className="relative z-10">
						{loading ? "Saving..." : "Save Changes"}
					</span>
					<div className="absolute inset-0 bg-black/20"></div>
				</Button>
			</div>
		</div>
	);
};

const AdminPostsPage: React.FC = () => {
	const { apiCall } = useAdmin();
	const { posts, loading, refetch } = usePostsData(apiCall);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingPost, setEditingPost] = useState<any | null>(null);

	return (
		<>
			<PostsList
				posts={posts}
				loading={loading}
				onCreateClick={() => {
					setEditingPost(null);
					setShowCreateForm(true);
				}}
				onEditPost={(post) => {
					setEditingPost(post);
					setShowCreateForm(true);
				}}
			/>
			{showCreateForm && (
				<CreatePostForm
					editPost={editingPost}
					onClose={() => {
						setShowCreateForm(false);
						setEditingPost(null);
					}}
					onSuccess={() => {
						setShowCreateForm(false);
						setEditingPost(null);
						refetch();
					}}
				/>
			)}
		</>
	);
};

const AdminProjectsPage: React.FC = () => {
	const { apiCall } = useAdmin();
	const { projects, loading, refetch } = useProjectsData(apiCall);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingProject, setEditingProject] = useState<any | null>(null);

	return (
		<>
			<ProjectsList
				projects={projects}
				loading={loading}
				onCreateClick={() => {
					setEditingProject(null);
					setShowCreateForm(true);
				}}
				onEditProject={(project) => {
					setEditingProject(project);
					setShowCreateForm(true);
				}}
			/>
			{showCreateForm && (
				<CreateProjectForm
					editProject={editingProject}
					onClose={() => {
						setShowCreateForm(false);
						setEditingProject(null);
					}}
					onSuccess={() => {
						setShowCreateForm(false);
						setEditingProject(null);
						refetch();
					}}
				/>
			)}
		</>
	);
};

const AdminGitHubPage: React.FC = () => {
	const { apiCall, githubToken, setGithubToken } = useAdmin();
	return (
		<GitHubSyncPage
			apiCall={apiCall}
			savedToken={githubToken}
			onTokenSave={setGithubToken}
		/>
	);
};

const AdminContent: React.FC = () => {
	const { auth, loading, logout } = useAdmin();
	const [location] = useLocation();
	const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
	const [loginUrl, setLoginUrl] = useState("");

	useEffect(() => {
		const fetchLoginUrl = async () => {
			try {
				const response = await fetch("/api/admin/urls");
				const data = await response.json();
				if (data.success && data.urls?.login) {
					setLoginUrl(data.urls.login);
				}
			} catch (error) {
				console.error("Error fetching login URL:", error);
			}
		};
		fetchLoginUrl();
	}, []);

	const handleLogout = () => {
		setShowLogoutAnimation(true);
	};

	const handleLogoutComplete = () => {
		logout();
	};

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

	if (showLogoutAnimation) {
		return (
			<NeuralLinkAnimation
				type="disconnecting"
				onComplete={handleLogoutComplete}
				duration={3500}
			/>
		);
	}

	// Get the base path from current location (e.g., /dashboard-xyz123)
	const basePath = location.split("/")[1]; // Gets 'dashboard-xyz123' from '/dashboard-xyz123/posts'
	const baseRoute = `/${basePath}`;

	return (
		<AdminLayout user={auth.user!} onLogout={handleLogout}>
			<Route path={baseRoute} component={Dashboard} />
			<Route path={`${baseRoute}/dashboard`} component={Dashboard} />
			<Route path={`${baseRoute}/posts`} component={AdminPostsPage} />
			<Route path={`${baseRoute}/projects`} component={AdminProjectsPage} />
			<Route path={`${baseRoute}/github`} component={AdminGitHubPage} />
			<Route path={`${baseRoute}/settings`} component={AdminSettings} />
		</AdminLayout>
	);
};

export default function Admin() {
	const [loginUrl, setLoginUrl] = useState("");

	useEffect(() => {
		const fetchLoginUrl = async () => {
			try {
				const response = await fetch("/api/admin/urls");
				const data = await response.json();
				if (data.success && data.urls?.login) {
					setLoginUrl(data.urls.login);
				}
			} catch (error) {
				console.error("Error fetching login URL:", error);
			}
		};
		fetchLoginUrl();
	}, []);

	return (
		<AdminProvider loginUrl={loginUrl}>
			<AdminContent />
		</AdminProvider>
	);
}
