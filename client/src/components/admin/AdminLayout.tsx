import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useTheme } from "@/contexts/ThemeContext";

interface User {
	id: number;
	username: string;
	email: string;
	lastLoginAt: string | null;
}

interface AdminLayoutProps {
	user: User;
	onLogout: () => void;
	children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
	user,
	onLogout,
	children,
}) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { colors } = useTheme();

	return (
		<ErrorBoundary>
			<div
				className="relative min-h-screen overflow-x-hidden"
				style={{
					backgroundColor: colors.background.primary,
					color: colors.text.primary,
				}}
			>
				{/* Subtle background effects - optional decorative elements */}
				<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
					<div
						className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
						style={{ backgroundColor: "var(--color-electric-city-cyan)0D" }}
					></div>
					<div
						className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
						style={{ backgroundColor: "var(--color-tech-noir-purple)0D" }}
					></div>
				</div>
				<AdminHeader
					onMenuClick={() => setSidebarOpen(true)}
					onLogout={onLogout}
				/>

				<AnimatePresence>
					{(sidebarOpen ||
						(typeof window !== "undefined" && window.innerWidth >= 768)) && (
						<AdminSidebar
							user={user}
							isOpen={sidebarOpen}
							onClose={() => setSidebarOpen(false)}
							onLogout={onLogout}
						/>
					)}
				</AnimatePresence>

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

				<div className="md:ml-80 min-h-screen">
					<div className="p-6">{children}</div>
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default AdminLayout;
