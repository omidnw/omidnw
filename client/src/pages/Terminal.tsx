import React, { useEffect } from "react";
import { useLocation } from "wouter";
import CyberpunkTerminal from "@/components/CyberpunkTerminal";

export default function Terminal() {
	const [, navigate] = useLocation();

	// Redirect to home when terminal closes
	const handleClose = () => {
		navigate("/");
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<CyberpunkTerminal isOpen={true} onClose={handleClose} />

			{/* Background content when terminal is open */}
			<div className="text-center space-y-4 opacity-50">
				<h1 className="text-4xl font-heading font-bold text-primary neon-glow">
					Terminal Interface
				</h1>
				<p className="text-lg text-muted-foreground font-mono">
					Accessing cyberpunk terminal...
				</p>
				<div className="flex justify-center space-x-2">
					<div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
					<div
						className="w-2 h-2 bg-primary rounded-full animate-pulse"
						style={{ animationDelay: "0.2s" }}
					/>
					<div
						className="w-2 h-2 bg-primary rounded-full animate-pulse"
						style={{ animationDelay: "0.4s" }}
					/>
				</div>
			</div>
		</div>
	);
}
