import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface LoadingProps {
	message?: string;
	size?: "sm" | "md" | "lg";
	variant?: "inline" | "fullscreen";
}

const Loading: React.FC<LoadingProps> = ({
	message = "Initializing system...",
	size = "md",
	variant = "inline",
}) => {
	const sizeClasses = {
		sm: "w-6 h-6",
		md: "w-8 h-8",
		lg: "w-12 h-12",
	};

	const containerClasses = {
		inline: "flex items-center justify-center p-8",
		fullscreen: "min-h-screen flex items-center justify-center bg-background",
	};

	const LoadingSpinner = () => (
		<motion.div
			className="relative"
			animate={{ rotate: 360 }}
			transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
		>
			<Terminal className={`${sizeClasses[size]} text-primary neon-glow`} />
		</motion.div>
	);

	const LoadingDots = () => (
		<div className="flex space-x-1">
			{[0, 1, 2].map((i) => (
				<motion.div
					key={i}
					className="w-2 h-2 bg-primary rounded-full"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 1.5,
						repeat: Infinity,
						delay: i * 0.2,
					}}
				/>
			))}
		</div>
	);

	const MatrixNumbers = () => (
		<div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
			{Array.from({ length: 10 }).map((_, i) => (
				<motion.div
					key={i}
					className="absolute text-primary font-mono text-xs"
					style={{
						left: `${Math.random() * 100}%`,
						top: `${Math.random() * 100}%`,
					}}
					animate={{
						y: [0, -20, 0],
						opacity: [0, 1, 0],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						delay: Math.random() * 2,
					}}
				>
					{Math.floor(Math.random() * 2)}
				</motion.div>
			))}
		</div>
	);

	if (variant === "fullscreen") {
		return (
			<div className={containerClasses[variant]}>
				<Card variant="cyberpunk" className="p-8 relative overflow-hidden">
					<MatrixNumbers />
					<div className="relative z-10 text-center space-y-4">
						<LoadingSpinner />
						<motion.p
							className="font-mono text-muted-foreground"
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							{message}
						</motion.p>
						<LoadingDots />
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div
			className={containerClasses[variant]}
			role="status"
			aria-label={message}
		>
			<div className="text-center space-y-4">
				<LoadingSpinner />
				<motion.p
					className="font-mono text-muted-foreground text-sm"
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					{message}
				</motion.p>
				<LoadingDots />
			</div>
		</div>
	);
};

export default Loading;
