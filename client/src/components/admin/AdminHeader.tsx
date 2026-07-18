import React from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminHeaderProps {
	onMenuClick: () => void;
	onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, onLogout }) => {
	return (
		<div className="relative md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-900/90 border-b-2 border-cyan-500/30 backdrop-blur-xl shadow-lg shadow-cyan-500/5">
			<Button
				variant="ghost"
				size="sm"
				onClick={onMenuClick}
				className="relative z-10 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all duration-300"
			>
				<Menu className="w-5 h-5" />
			</Button>
			<h1 className="relative z-10 text-lg font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
				ADMIN_PORTAL
			</h1>
			<div className="flex items-center space-x-2">
				<ThemeToggle />
				<Button
					onClick={onLogout}
					variant="ghost"
					size="sm"
					className="relative z-10 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all duration-300"
				>
					<LogOut className="w-5 h-5" />
				</Button>
			</div>
		</div>
	);
};

export default AdminHeader;
