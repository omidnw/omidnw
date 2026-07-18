import React, { useState, useEffect } from "react";
import {
	RefreshCw,
	CheckCircle,
	XCircle,
	Eye,
	EyeOff,
	Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SyncResult {
	synced: number;
	errors: string[];
}

interface GitHubSyncPageProps {
	apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
	savedToken?: string | null;
	onTokenSave?: (token: string | null) => void;
}

const GitHubSyncPage: React.FC<GitHubSyncPageProps> = ({
	apiCall,
	savedToken,
	onTokenSave,
}) => {
	const [githubToken, setGithubToken] = useState(savedToken || "");
	const [showToken, setShowToken] = useState(false);
	const [testing, setTesting] = useState(false);
	const [savingToken, setSavingToken] = useState(false);
	const [hasSavedToken, setHasSavedToken] = useState(false);

	// Load settings on mount
	useEffect(() => {
		const loadSettings = async () => {
			try {
				const response = await apiCall("/github/settings");
				const data = await response.json();
				if (data.success) {
					setHasSavedToken(data.hasToken);
				}
			} catch (error) {
				console.error("Failed to load GitHub settings", error);
			}
		};
		loadSettings();
	}, [apiCall]);

	const [syncing, setSyncing] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<{
		tested: boolean;
		connected: boolean;
		error?: string;
	}>({ tested: false, connected: false });
	const [syncResults, setSyncResults] = useState<{
		posts?: SyncResult;
		projects?: SyncResult;
	} | null>(null);
	const { toast } = useToast();

	const saveToken = async () => {
		if (!githubToken.trim()) {
			toast({
				title: "Token Required",
				description: "Please enter your GitHub Personal Access Token",
				variant: "destructive",
			});
			return;
		}

		setSavingToken(true);
		try {
			const response = await apiCall("/github/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ githubToken }),
			});
			const data = await response.json();

			if (data.success) {
				setHasSavedToken(true);
				toast({
					title: "Token Saved",
					description: "GitHub token has been saved successfully.",
				});
			} else {
				throw new Error(data.error || "Failed to save token");
			}
		} catch (error) {
			toast({
				title: "Save Failed",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setSavingToken(false);
		}
	};

	const testConnection = async () => {
		setTesting(true);
		setConnectionStatus({ tested: false, connected: false });

		try {
			const response = await apiCall("/github/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: githubToken ? JSON.stringify({ githubToken }) : undefined,
			});

			const data = await response.json();

			if (data.success && data.github.connected) {
				setConnectionStatus({
					tested: true,
					connected: true,
				});
				toast({
					title: "Connection Successful",
					description: "Successfully connected to GitHub.",
				});
			} else {
				setConnectionStatus({
					tested: true,
					connected: false,
					error:
						data.github.connectionError || data.error || "Connection failed",
				});
				toast({
					title: "Connection Failed",
					description:
						data.github.connectionError ||
						data.error ||
						"Unable to connect to GitHub",
					variant: "destructive",
				});
			}
		} catch (error) {
			setConnectionStatus({
				tested: true,
				connected: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			toast({
				title: "Connection Error",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setTesting(false);
		}
	};

	const triggerSync = async (type: "all" | "posts" | "projects") => {
		setSyncing(true);
		setSyncResults(null);

		try {
			const response = await apiCall("/github/sync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type }),
			});

			const data = await response.json();

			if (data.success) {
				setSyncResults(data.result);
				const totalSynced =
					(data.result.posts?.synced || 0) +
					(data.result.projects?.synced || 0);
				const totalErrors =
					(data.result.posts?.errors?.length || 0) +
					(data.result.projects?.errors?.length || 0);

				toast({
					title: "Sync Completed",
					description: `Synced ${totalSynced} items${
						totalErrors > 0 ? ` with ${totalErrors} errors` : ""
					}`,
				});
			} else {
				throw new Error(data.error || data.message || "Sync failed");
			}
		} catch (error) {
			toast({
				title: "Sync Failed",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setSyncing(false);
		}
	};

	return (
		<div className="space-y-6 relative">
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
			</div>

			<div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90 border border-cyan-500/20 backdrop-blur-xl">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent rounded-2xl"></div>
				<div className="relative z-10">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-mono mb-2">
						GITHUB_SYNC
					</h1>
					<p className="text-gray-400 font-mono text-sm tracking-wide">
						Sync content from your GitHub repository
					</p>
				</div>
			</div>

			<Card className="group relative border-2 border-cyan-500/30 bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90 backdrop-blur-xl overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
				<CardHeader className="relative z-10">
					<CardTitle className="text-cyan-400 font-mono text-xl">
						GitHub Configuration
					</CardTitle>
					<CardDescription className="text-gray-300 font-mono">
						Repository: omidnw/omidnw (master branch)
						{hasSavedToken && (
							<div className="flex items-center gap-2 mt-2 text-xs text-green-400">
								<CheckCircle className="w-3 h-3" />
								<span>Token is saved in database</span>
							</div>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2.5">
					<div className="space-y-2">
						<Label htmlFor="github-token" className="text-cyan-300">
							GitHub Personal Access Token
						</Label>
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Input
									id="github-token"
									type={showToken ? "text" : "password"}
									value={githubToken}
									onChange={(e) => setGithubToken(e.target.value)}
									placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
									className="bg-black/60 border-cyan-500/30 text-white pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowToken(!showToken)}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
								>
									{showToken ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={testConnection}
									disabled={testing}
									variant="outline"
									className="border-2 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/30 font-mono"
								>
									{testing ? (
										<div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
									) : (
										"Test"
									)}
								</Button>
								<Button
									onClick={saveToken}
									disabled={savingToken || !githubToken.trim()}
									className="relative bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] border-0 overflow-hidden font-mono"
								>
									<span className="relative z-10 flex items-center justify-center">
										{savingToken ? (
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										) : (
											<Save className="w-4 h-4 mr-2" />
										)}
										{savingToken ? "Saving..." : "Save Token"}
									</span>
								</Button>
							</div>
						</div>
						<p className="text-xs text-gray-500">
							Need a token?{" "}
							<a
								href="https://github.com/settings/tokens/new?scopes=repo"
								target="_blank"
								rel="noopener noreferrer"
								className="text-cyan-400 hover:underline"
							>
								Create one here
							</a>{" "}
							(requires 'repo' scope)
						</p>
					</div>

					{connectionStatus.tested && (
						<div
							className={`flex items-center gap-2 p-3 rounded-lg ${
								connectionStatus.connected
									? "bg-green-500/10 border border-green-500/30"
									: "bg-red-500/10 border border-red-500/30"
							}`}
						>
							{connectionStatus.connected ? (
								<>
									<CheckCircle className="w-5 h-5 text-green-400" />
									<span className="text-green-400">
										Connected to GitHub successfully
									</span>
								</>
							) : (
								<>
									<XCircle className="w-5 h-5 text-red-400" />
									<span className="text-red-400">
										Connection failed: {connectionStatus.error}
									</span>
								</>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="group relative border-2 border-purple-500/30 bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-gray-900/90 backdrop-blur-xl overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
				<CardHeader className="relative z-10">
					<CardTitle className="text-purple-400 font-mono text-xl">
						Sync Content
					</CardTitle>
					<CardDescription className="text-gray-300 font-mono">
						Sync blogs and projects from your GitHub repository
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="all" className="w-full">
						<TabsList className="grid w-full grid-cols-3 bg-black/60">
							<TabsTrigger value="all">All Content</TabsTrigger>
							<TabsTrigger value="posts">Blogs Only</TabsTrigger>
							<TabsTrigger value="projects">Projects Only</TabsTrigger>
						</TabsList>
						<TabsContent value="all" className="space-y-4">
							<p className="text-sm text-gray-400">
								Sync all blog posts and projects from client/src/blogs and
								client/src/projects
							</p>
							<Button
								onClick={() => triggerSync("all")}
								disabled={syncing}
								className="relative w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] border-0 overflow-hidden font-mono"
							>
								<span className="relative z-10 flex items-center justify-center">
									{syncing ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
											Syncing...
										</>
									) : (
										<>
											<RefreshCw className="w-4 h-4 mr-2" />
											Sync All Content
										</>
									)}
								</span>
							</Button>
						</TabsContent>
						<TabsContent value="posts" className="space-y-4">
							<p className="text-sm text-gray-400">
								Sync only blog posts from client/src/blogs
							</p>
							<Button
								onClick={() => triggerSync("posts")}
								disabled={syncing}
								className="relative w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] border-0 overflow-hidden font-mono"
							>
								<span className="relative z-10 flex items-center justify-center">
									{syncing ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
											Syncing...
										</>
									) : (
										<>
											<RefreshCw className="w-4 h-4 mr-2" />
											Sync Blogs
										</>
									)}
								</span>
							</Button>
						</TabsContent>
						<TabsContent value="projects" className="space-y-4">
							<p className="text-sm text-gray-400">
								Sync only projects from client/src/projects
							</p>
							<Button
								onClick={() => triggerSync("projects")}
								disabled={syncing}
								className="relative w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-0 overflow-hidden font-mono"
							>
								<span className="relative z-10 flex items-center justify-center">
									{syncing ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
											Syncing...
										</>
									) : (
										<>
											<RefreshCw className="w-4 h-4 mr-2" />
											Sync Projects
										</>
									)}
								</span>
							</Button>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{syncResults && (
				<Card className="group relative border-2 border-green-500/30 bg-gradient-to-br from-gray-900/90 via-green-900/10 to-gray-900/90 backdrop-blur-xl overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					<div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
					<CardHeader className="relative z-10">
						<CardTitle className="text-green-400 font-mono text-xl">
							Sync Results
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{syncResults.posts && syncResults.posts.synced > 0 && (
							<div className="space-y-2">
								<h3 className="text-cyan-400 font-semibold">Blog Posts</h3>
								<p className="text-sm text-gray-300">
									✓ Synced {syncResults.posts.synced} blog post(s)
								</p>
								{syncResults.posts.errors.length > 0 && (
									<div className="text-sm text-red-400">
										<p className="font-semibold">Errors:</p>
										<ul className="list-disc list-inside">
											{syncResults.posts.errors.map((error, idx) => (
												<li key={idx}>{error}</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
						{syncResults.projects && syncResults.projects.synced > 0 && (
							<div className="space-y-2">
								<h3 className="text-purple-400 font-semibold">Projects</h3>
								<p className="text-sm text-gray-300">
									✓ Synced {syncResults.projects.synced} project(s)
								</p>
								{syncResults.projects.errors.length > 0 && (
									<div className="text-sm text-red-400">
										<p className="font-semibold">Errors:</p>
										<ul className="list-disc list-inside">
											{syncResults.projects.errors.map((error, idx) => (
												<li key={idx}>{error}</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default GitHubSyncPage;
