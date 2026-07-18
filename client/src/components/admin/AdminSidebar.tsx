import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
	Shield,
	Home,
	FileText,
	Folder,
	LogOut,
	Settings,
	X,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
	id: number;
	username: string;
	email: string;
	lastLoginAt: string | null;
}

interface AdminSidebarProps {
	user: User;
	isOpen: boolean;
	onClose: () => void;
	onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
	user,
	isOpen,
	onClose,
	onLogout,
}) => {
	const [location] = useLocation();

	// Get the base path from current location (e.g., /dashboard-xyz123)
	const basePath = `/${location.split("/")[1]}`; // Gets '/dashboard-xyz123' from '/dashboard-xyz123/posts'

	const navItems = [
		{
			href: basePath,
			icon: Home,
			label: "Dashboard",
			description: "Overview",
		},
		{
			href: `${basePath}/posts`,
			icon: FileText,
			label: "Posts",
			description: "Blog management",
		},
		{
			href: `${basePath}/projects`,
			icon: Folder,
			label: "Projects",
			description: "Portfolio items",
		},
		{
			href: `${basePath}/github`,
			icon: SiGithub,
			label: "GitHub",
			description: "Sync content",
		},
		{
			href: `${basePath}/settings`,
			icon: Settings,
			label: "Settings",
			description: "Configuration",
		},
	];

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			exit={{ x: -300 }}
			transition={{ type: "spring", damping: 20 }}
			className="fixed top-0 left-0 h-full w-80 backdrop-blur-xl border-r-2 z-50 overflow-y-auto shadow-2xl"
			style={{
				background:
					"linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))",
				borderColor: "var(--color-border-primary)",
				boxShadow: "0 0 40px var(--color-electric-city-cyan)1A",
			}}
		>
			<div
				className="absolute top-20 right-0 w-40 h-40 rounded-full blur-3xl"
				style={{ backgroundColor: "var(--color-electric-city-cyan)0D" }}
			></div>
			<div
				className="absolute bottom-20 left-0 w-40 h-40 rounded-full blur-3xl"
				style={{ backgroundColor: "var(--color-tech-noir-purple)0D" }}
			></div>
			<div className="relative p-6 z-10">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center space-x-3">
						<div
							className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
							style={{
								background:
									"linear-gradient(135deg, var(--color-electric-city-cyan), var(--color-tech-noir-purple))",
								boxShadow: "0 0 20px var(--color-electric-city-cyan)33",
							}}
						>
							<Shield className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1
								className="text-xl font-bold bg-clip-text text-transparent font-mono"
								style={{
									backgroundImage:
										"linear-gradient(to right, var(--color-electric-city-cyan), var(--color-tech-noir-purple))",
								}}
							>
								ADMIN_PORTAL
							</h1>
							<p
								className="text-sm"
								style={{ color: "var(--color-text-tertiary)" }}
							>
								Cyberpunk Dashboard
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="md:hidden hover:bg-transparent"
						style={{ color: "var(--color-text-tertiary)" }}
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				<Card
					className="relative overflow-hidden border-2 mb-6 backdrop-blur-xl shadow-lg transition-all duration-300 group"
					style={{
						background:
							"linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary))",
						borderColor: "var(--color-border-primary)",
						boxShadow: "0 4px 6px var(--color-electric-city-cyan)1A",
					}}
				>
					<CardContent className="relative p-4 z-10">
						<div className="flex items-center space-x-3">
							<div className="relative">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
									style={{
										background:
											"linear-gradient(135deg, var(--color-electric-city-cyan), var(--color-tech-noir-purple), var(--color-neon-pulse-magenta))",
										boxShadow: "0 0 20px var(--color-electric-city-cyan)33",
									}}
								>
									<span className="text-lg font-bold text-white font-mono">
										{user.username?.[0]?.toUpperCase()}
									</span>
								</div>
								<div
									className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 animate-pulse"
									style={{
										backgroundColor: "var(--color-status-success)",
										borderColor: "var(--color-bg-primary)",
									}}
								></div>
							</div>
							<div className="flex-1">
								<p
									className="font-semibold font-mono"
									style={{ color: "var(--color-text-primary)" }}
								>
									{user.username}
								</p>
								<p
									className="text-xs truncate"
									style={{ color: "var(--color-text-tertiary)" }}
								>
									{user.email}
								</p>
								<p
									className="text-xs font-mono mt-0.5"
									style={{ color: "var(--color-status-success)" }}
								>
									● ONLINE
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<nav className="space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = location === item.href;

						return (
							<Link key={item.href} href={item.href}>
								<motion.a
									whileHover={{ x: 4 }}
									className="flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer border"
									style={{
										background: isActive
											? "linear-gradient(to right, var(--color-electric-city-cyan)1A, var(--color-tech-noir-purple)1A)"
											: "transparent",
										borderColor: isActive
											? "var(--color-border-primary)"
											: "transparent",
										color: isActive
											? "var(--color-electric-city-cyan)"
											: "var(--color-text-secondary)",
									}}
									onClick={onClose}
									onMouseEnter={(e) => {
										if (!isActive) {
											e.currentTarget.style.backgroundColor =
												"var(--color-bg-hover)";
											e.currentTarget.style.color =
												"var(--color-electric-city-cyan)";
										}
									}}
									onMouseLeave={(e) => {
										if (!isActive) {
											e.currentTarget.style.backgroundColor = "transparent";
											e.currentTarget.style.color =
												"var(--color-text-secondary)";
										}
									}}
								>
									<Icon className="w-5 h-5" />
									<div>
										<p className="font-medium">{item.label}</p>
										<p className="text-xs opacity-70">{item.description}</p>
									</div>
									{isActive && (
										<motion.div
											layoutId="activeTab"
											className="ml-auto w-2 h-2 rounded-full"
											style={{
												backgroundColor: "var(--color-electric-city-cyan)",
											}}
										/>
									)}
								</motion.a>
							</Link>
						);
					})}
				</nav>

				<div
					className="mt-8 pt-4 space-y-3"
					style={{ borderTop: "1px solid var(--color-border-primary)" }}
				>
					<ThemeToggle />
					<Button
						onClick={onLogout}
						variant="outline"
						className="w-full border-2 transition-all duration-300 font-mono"
						style={{
							borderColor: "var(--color-status-error)66",
							color: "var(--color-status-error)",
							backgroundColor: "transparent",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor =
								"var(--color-status-error)1A";
							e.currentTarget.style.borderColor = "var(--color-status-error)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
							e.currentTarget.style.borderColor = "var(--color-status-error)66";
						}}
					>
						<LogOut className="w-4 h-4 mr-2" />
						LOGOUT
					</Button>
				</div>
			</div>
		</motion.div>
	);
};

export default AdminSidebar;
