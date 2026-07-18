import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Eye, EyeOff, Lock, User, Terminal, Zap } from "lucide-react";
import NeuralLinkAnimation from "../components/NeuralLinkAnimation";

export default function Login() {
	const [, setLocation] = useLocation();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [glitchText, setGlitchText] = useState("ADMIN ACCESS");
	const [showNeuralLink, setShowNeuralLink] = useState(false);
	const [dashboardUrl, setDashboardUrl] = useState("");
	const [shakeCard, setShakeCard] = useState(false);

	// Fetch dashboard URL on mount
	useEffect(() => {
		const fetchDashboardUrl = async () => {
			try {
				const response = await fetch("/api/admin/urls");
				const data = await response.json();
				if (data.success && data.urls?.dashboard) {
					setDashboardUrl(data.urls.dashboard);
				}
			} catch (error) {
				console.error("Error fetching dashboard URL:", error);
			}
		};
		fetchDashboardUrl();
	}, []);

	// Cyberpunk glitch effect for title
	useEffect(() => {
		const glitchTexts = [
			"ADMIN ACCESS",
			"A̸D̸M̸I̸N̸ ̸A̸C̸C̸E̸S̸S̸",
			"ADMIN_ACCESS",
			"ȺĐMŁ₦ ₳₵₵Ɇ₴₴",
			"ADMIN ACCESS",
		];

		const interval = setInterval(() => {
			const randomIndex = Math.floor(Math.random() * glitchTexts.length);
			setGlitchText(glitchTexts[randomIndex]);

			setTimeout(() => {
				setGlitchText("ADMIN ACCESS");
			}, 150);
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/admin/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("admin_token", data.accessToken);
				localStorage.setItem("admin_refresh_token", data.refreshToken);

				// Ensure we have dashboard URL before showing animation
				if (!dashboardUrl) {
					try {
						const urlResponse = await fetch("/api/admin/urls");
						const urlData = await urlResponse.json();
						if (urlData.success && urlData.urls?.dashboard) {
							setDashboardUrl(urlData.urls.dashboard);
						}
					} catch (error) {
						console.error("Error fetching dashboard URL:", error);
					}
				}

				// Show neural link animation
				setShowNeuralLink(true);
			} else {
				setShakeCard(true);
				setError("Authentication failed");
				setTimeout(() => setShakeCard(false), 500);
			}
		} catch (error) {
			setShakeCard(true);
			setError("Connection failed. Please try again.");
			setTimeout(() => setShakeCard(false), 500);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNeuralLinkComplete = () => {
		// Fallback to fetching URL if not loaded yet
		if (dashboardUrl) {
			setLocation(dashboardUrl);
		} else {
			// Fetch URL and redirect
			fetch("/api/admin/urls")
				.then((res) => res.json())
				.then((data) => {
					if (data.success && data.urls?.dashboard) {
						setLocation(data.urls.dashboard);
					} else {
						console.error("Failed to get dashboard URL");
						setError("Failed to redirect to dashboard");
						setShowNeuralLink(false);
					}
				})
				.catch((error) => {
					console.error("Error fetching dashboard URL:", error);
					setError("Failed to redirect to dashboard");
					setShowNeuralLink(false);
				});
		}
	};

	// Show neural link animation if login successful
	if (showNeuralLink) {
		return (
			<NeuralLinkAnimation
				type="connecting"
				onComplete={handleNeuralLinkComplete}
				duration={5000}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
			{/* Cyberpunk grid background */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute inset-0 bg-black bg-opacity-50"></div>
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
							'<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>'
						)}")`,
						backgroundSize: "40px 40px",
					}}
				></div>
			</div>

			{/* Animated neon lines */}
			<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
			<div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-pink-400 to-transparent animate-pulse"></div>
			<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse"></div>
			<div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse"></div>

			<Card
				className={`w-full max-w-md relative bg-gray-900/80 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20 transition-all duration-100 ${
					shakeCard ? "animate-shake" : ""
				}`}
			>
				<CardHeader className="space-y-1 text-center">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<Terminal className="w-8 h-8 text-cyan-400" />
						<Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
					</div>
					<CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono tracking-wider">
						{glitchText}
					</CardTitle>
					<p className="text-gray-400 text-sm font-mono">
						Enter your credentials to access the cyberpunk dashboard
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					{error && (
						<Alert className="border-red-500/50 bg-red-900/30 text-red-300 backdrop-blur-sm animate-pulse">
							<AlertDescription className="font-mono text-sm flex items-center">
								<span className="mr-2">⚠</span>
								{error}
							</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="username"
								className="text-cyan-300 font-mono text-sm"
							>
								Username
							</Label>
							<div className="relative">
								<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
								<Input
									id="username"
									type="text"
									placeholder="Enter username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20 font-mono"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-cyan-300 font-mono text-sm"
							>
								Password
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20 font-mono"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-cyan-400 transition-colors"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-mono font-bold py-3 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
						>
							{isLoading ? (
								<div className="flex items-center space-x-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span>ACCESSING...</span>
								</div>
							) : (
								"ENTER SYSTEM"
							)}
						</Button>
					</form>

					<div className="text-center text-xs text-gray-500 font-mono">
						<p>AUTHORIZED PERSONNEL ONLY</p>
						<p className="text-cyan-400 mt-1">
							SYSTEM SECURED • NIGHT CITY NET
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
