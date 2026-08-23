import React from "react";
import { useLocation } from "wouter";
import CyberpunkTerminal from "@/components/CyberpunkTerminal";
import { useSEO } from "@/lib/seo";

export default function Terminal() {
	// SEO optimization for terminal page
	useSEO("terminal");

	const [, navigate] = useLocation();

	// Redirect to home when terminal closes
	const handleClose = () => {
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-background" aria-label="Terminal page">
			<CyberpunkTerminal isOpen={true} onClose={handleClose} />
			<h1 className="sr-only">Cyberpunk Terminal</h1>
		</div>
	);
}
