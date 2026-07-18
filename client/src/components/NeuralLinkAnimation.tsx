import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Terminal,
	Zap,
	Activity,
	Wifi,
	CheckCircle,
	XCircle,
} from "lucide-react";

interface NeuralLinkAnimationProps {
	type: "connecting" | "disconnecting";
	onComplete: () => void;
	duration?: number;
}

export default function NeuralLinkAnimation({
	type,
	onComplete,
	duration = 5000,
}: NeuralLinkAnimationProps) {
	const [currentPhase, setCurrentPhase] = useState(0);
	const [matrixChars, setMatrixChars] = useState<string[]>([]);
	const [terminalLines, setTerminalLines] = useState<string[]>([]);
	const [progress, setProgress] = useState(0);
	const [connectedStatus, setConnectedStatus] = useState({
		connection: type === "disconnecting" ? true : false,
		neuralSync: type === "disconnecting" ? true : false,
		authStatus: type === "disconnecting" ? true : false,
	});

	const connectingPhases = [
		"INITIALIZING NEURAL INTERFACE...",
		"SCANNING BIOMETRIC DATA...",
		"ESTABLISHING SECURE CONNECTION...",
		"SYNCHRONIZING NEURAL PATTERNS...",
		"AUTHENTICATING CREDENTIALS...",
		"NEURAL LINK ESTABLISHED",
		"WELCOME TO THE MATRIX",
	];

	const disconnectingPhases = [
		"TERMINATING NEURAL LINK...",
		"CLEARING MEMORY CACHE...",
		"CLOSING SECURE CHANNELS...",
		"DISCONNECTION COMPLETE",
		"NEURAL INTERFACE OFFLINE",
	];

	const phases = type === "connecting" ? connectingPhases : disconnectingPhases;

	// Matrix rain effect
	useEffect(() => {
		const chars = "0123456789ABCDEFabcdef";
		const interval = setInterval(() => {
			const newChars = Array.from(
				{ length: 50 },
				() => chars[Math.floor(Math.random() * chars.length)]
			);
			setMatrixChars(newChars);
		}, 100);

		return () => clearInterval(interval);
	}, []);

	// Main animation controller
	useEffect(() => {
		const startTime = Date.now();
		let animationFrame: number;
		let lastPhase = -1;
		const statusFlags = {
			connection: type === "disconnecting",
			neuralSync: type === "disconnecting",
			authStatus: type === "disconnecting",
		};

		const animationLoop = () => {
			const elapsed = Date.now() - startTime;
			const currentProgressPercentage = Math.min(
				(elapsed / duration) * 100,
				100
			);

			// Smooth progress update - always increasing
			setProgress(currentProgressPercentage);

			// Update phase based on progress
			const newPhase = Math.floor((elapsed / duration) * phases.length);
			if (newPhase < phases.length && newPhase !== lastPhase) {
				lastPhase = newPhase;
				setCurrentPhase(newPhase);
				setTerminalLines((prev) => [...prev, phases[newPhase]]);
			}

			// Sequential status indicator animation with smooth transitions
			if (type === "connecting") {
				if (currentProgressPercentage >= 30 && !statusFlags.connection) {
					statusFlags.connection = true;
					setConnectedStatus((prev) => ({ ...prev, connection: true }));
				}
				if (currentProgressPercentage >= 55 && !statusFlags.neuralSync) {
					statusFlags.neuralSync = true;
					setConnectedStatus((prev) => ({ ...prev, neuralSync: true }));
				}
				if (currentProgressPercentage >= 75 && !statusFlags.authStatus) {
					statusFlags.authStatus = true;
					setConnectedStatus((prev) => ({ ...prev, authStatus: true }));
				}
			} else if (type === "disconnecting") {
				// For disconnecting, reverse the status indicators
				if (currentProgressPercentage >= 25 && statusFlags.authStatus) {
					statusFlags.authStatus = false;
					setConnectedStatus((prev) => ({ ...prev, authStatus: false }));
				}
				if (currentProgressPercentage >= 50 && statusFlags.neuralSync) {
					statusFlags.neuralSync = false;
					setConnectedStatus((prev) => ({ ...prev, neuralSync: false }));
				}
				if (currentProgressPercentage >= 75 && statusFlags.connection) {
					statusFlags.connection = false;
					setConnectedStatus((prev) => ({ ...prev, connection: false }));
				}
			}

			// Continue animation or complete
			if (elapsed < duration) {
				animationFrame = requestAnimationFrame(animationLoop);
			} else {
				setProgress(100);
				// Add a small delay before completing to ensure all animations finish
				setTimeout(() => {
					onComplete();
				}, 500);
			}
		};

		animationFrame = requestAnimationFrame(animationLoop);

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [duration, onComplete, type, phases.length]);

	return (
		<div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
			{/* Matrix rain background */}
			<div className="absolute inset-0 opacity-20">
				{Array.from({ length: 20 }).map((_, i) => (
					<motion.div
						key={i}
						className="absolute text-green-400 font-mono text-sm"
						style={{
							left: `${(i * 5) % 100}%`,
							top: "-10%",
						}}
						animate={{
							y: ["0vh", "110vh"],
						}}
						transition={{
							duration: 2 + Math.random() * 3,
							repeat: Infinity,
							ease: "linear",
							delay: Math.random() * 2,
						}}
					>
						{matrixChars.slice(i * 2, i * 2 + 10).join("")}
					</motion.div>
				))}
			</div>

			{/* Neural network visualization */}
			<div className="absolute inset-0">
				<svg className="w-full h-full">
					{/* Neural nodes */}
					{Array.from({ length: 8 }).map((_, i) => {
						const angle = (i / 8) * Math.PI * 2;
						const radius = 200;
						const screenWidth =
							typeof window !== "undefined" ? window.innerWidth : 1920;
						const screenHeight =
							typeof window !== "undefined" ? window.innerHeight : 1080;
						const x = 50 + Math.cos(angle) * ((radius / screenWidth) * 100);
						const y = 50 + Math.sin(angle) * ((radius / screenHeight) * 100);

						return (
							<motion.circle
								key={i}
								cx={`${x}%`}
								cy={`${y}%`}
								r="4"
								fill="#00ffff"
								initial={{ opacity: 0, scale: 0 }}
								animate={{
									opacity: [0, 1, 0.5],
									scale: [0, 1.5, 1],
									fill: type === "connecting" ? "#00ffff" : "#ff0066",
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: i * 0.2,
								}}
							/>
						);
					})}

					{/* Neural connections */}
					{Array.from({ length: 6 }).map((_, i) => {
						const startAngle = (i / 6) * Math.PI * 2;
						const endAngle = ((i + 2) / 6) * Math.PI * 2;
						const radius = 200;
						const screenWidth =
							typeof window !== "undefined" ? window.innerWidth : 1920;
						const screenHeight =
							typeof window !== "undefined" ? window.innerHeight : 1080;
						const x1 =
							50 + Math.cos(startAngle) * ((radius / screenWidth) * 100);
						const y1 =
							50 + Math.sin(startAngle) * ((radius / screenHeight) * 100);
						const x2 = 50 + Math.cos(endAngle) * ((radius / screenWidth) * 100);
						const y2 =
							50 + Math.sin(endAngle) * ((radius / screenHeight) * 100);

						return (
							<motion.line
								key={i}
								x1={`${x1}%`}
								y1={`${y1}%`}
								x2={`${x2}%`}
								y2={`${y2}%`}
								stroke={type === "connecting" ? "#00ffff" : "#ff0066"}
								strokeWidth="2"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{
									pathLength: 1,
									opacity: [0, 0.8, 0.3],
								}}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									delay: i * 0.3,
								}}
							/>
						);
					})}
				</svg>
			</div>

			{/* Central interface */}
			<div className="relative z-10 text-center">
				{/* Status text */}
				<motion.h1
					className={`text-4xl font-bold font-mono mb-8 ${
						type === "connecting"
							? "bg-gradient-to-r from-cyan-400 to-green-400"
							: "bg-gradient-to-r from-red-400 to-pink-400"
					} bg-clip-text text-transparent`}
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				>
					{type === "connecting" ? "NEURAL LINK" : "DISCONNECTING"}
				</motion.h1>

				{/* Enhanced Progress Bar */}
				<div className="w-96 mx-auto mb-8">
					<div className="flex items-center justify-between mb-3">
						<span className="text-lg font-mono text-gray-400 tracking-wider">
							{type === "connecting" ? "PROGRESS" : "DISCONNECTING"}
						</span>
						<motion.span
							className={`text-xl font-mono font-bold tabular-nums ${
								type === "connecting" ? "text-cyan-400" : "text-red-400"
							}`}
							key={Math.floor(progress)}
							initial={{ scale: 1.2, opacity: 0.5 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.2 }}
						>
							{Math.floor(progress)}%
						</motion.span>
					</div>
					<div className="relative">
						<div
							className={`w-full h-5 bg-gray-900 rounded-full overflow-hidden border-2 shadow-inner ${
								type === "connecting"
									? "border-cyan-500/40"
									: "border-red-500/40"
							}`}
						>
							<motion.div
								className={`h-full relative ${
									type === "connecting"
										? "bg-gradient-to-r from-cyan-500 via-blue-500 to-green-500"
										: "bg-gradient-to-r from-red-500 via-pink-500 to-orange-500"
								}`}
								style={{ width: `${progress}%` }}
								transition={{ type: "tween", ease: "linear", duration: 0.1 }}
							>
								{/* Animated shine effect */}
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
									animate={{
										x: ["-100%", "200%"],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "linear",
										repeatDelay: 0.5,
									}}
								/>
								{/* Pulsing edge */}
								<motion.div
									className="absolute right-0 top-0 bottom-0 w-1 bg-white"
									animate={{
										opacity: [0.5, 1, 0.5],
									}}
									transition={{
										duration: 0.8,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								/>
							</motion.div>
						</div>
						{/* Progress bar glow */}
						<motion.div
							className={`absolute top-0 left-0 w-full h-5 rounded-full blur-md -z-10 ${
								type === "connecting"
									? "bg-gradient-to-r from-cyan-500/60 via-blue-500/60 to-green-500/60"
									: "bg-gradient-to-r from-red-500/60 via-pink-500/60 to-orange-500/60"
							}`}
							style={{ width: `${progress}%` }}
							transition={{ type: "tween", ease: "linear", duration: 0.1 }}
						/>
					</div>
					{/* Progress milestones */}
					<div className="flex justify-between mt-2 px-1">
						{[0, 25, 50, 75, 100].map((milestone) => (
							<motion.div
								key={milestone}
								className={`text-xs font-mono transition-colors duration-300 ${
									progress >= milestone
										? type === "connecting"
											? "text-cyan-400"
											: "text-red-400"
										: "text-gray-600"
								}`}
								animate={{
									scale: progress >= milestone ? [1, 1.2, 1] : 1,
								}}
								transition={{ duration: 0.3 }}
							>
								{milestone}
							</motion.div>
						))}
					</div>
				</div>

				{/* Status indicators - Sequential Animation */}
				<div className="flex justify-center space-x-8 mb-8">
					{[
						{
							icon: Wifi,
							label: "CONNECTION",
							active: connectedStatus.connection,
						},
						{
							icon: Activity,
							label: "NEURAL_SYNC",
							active: connectedStatus.neuralSync,
						},
						{
							icon: Zap,
							label: "AUTH_STATUS",
							active: connectedStatus.authStatus,
						},
					].map((indicator, index) => {
						const Icon = indicator.icon;

						// For connecting: show as active when indicator.active is true
						// For disconnecting: show as inactive (red) when indicator.active is false
						const isActive =
							type === "connecting" ? indicator.active : indicator.active; // Keep original state for disconnecting

						// Show check mark when connecting and active
						// Show X mark when disconnecting and inactive
						const shouldShowIcon =
							type === "connecting" ? indicator.active : !indicator.active;

						return (
							<motion.div
								key={indicator.label}
								className="flex flex-col items-center"
								initial={{ opacity: 0.3, scale: 0.8 }}
								animate={{
									opacity:
										type === "connecting"
											? indicator.active
												? 1
												: 0.3
											: indicator.active
											? 0.3
											: 1,
									scale:
										type === "connecting"
											? indicator.active
												? 1.1
												: 0.8
											: indicator.active
											? 0.8
											: 1.1,
								}}
								transition={{
									duration: 0.5,
									type: "spring",
									stiffness: 200,
								}}
							>
								<motion.div className="relative mb-2">
									<motion.div
										animate={{
											color:
												type === "connecting"
													? indicator.active
														? "#00ffff"
														: "#666666"
													: indicator.active
													? "#666666"
													: "#ff0066",
										}}
										transition={{ duration: 0.3 }}
									>
										<Icon className="w-8 h-8" />
									</motion.div>
									{((type === "connecting" && indicator.active) ||
										(type === "disconnecting" && !indicator.active)) && (
										<motion.div
											className={`absolute inset-0 border-2 rounded-full ${
												type === "connecting"
													? "border-cyan-400"
													: "border-red-400"
											}`}
											initial={{ scale: 1, opacity: 0 }}
											animate={{
												scale: [1, 1.8, 1],
												opacity: [0.8, 0, 0.8],
											}}
											transition={{
												duration: 1.5,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										/>
									)}
								</motion.div>
								<span
									className={`text-sm font-mono mb-2 transition-colors duration-300 ${
										type === "connecting"
											? indicator.active
												? "text-cyan-400"
												: "text-gray-600"
											: indicator.active
											? "text-gray-600"
											: "text-red-400"
									}`}
								>
									{indicator.label}
								</span>
								<motion.div
									className="w-12 h-2 rounded-full"
									animate={{
										backgroundColor:
											type === "connecting"
												? indicator.active
													? "#00ffff"
													: "#333333"
												: indicator.active
												? "#333333"
												: "#ff0066",
										boxShadow:
											type === "connecting"
												? indicator.active
													? "0 0 15px #00ffff"
													: "none"
												: indicator.active
												? "none"
												: "0 0 15px #ff0066",
									}}
									transition={{ duration: 0.3 }}
								/>
								<AnimatePresence mode="wait">
									{shouldShowIcon && (
										<motion.div
											key={`${indicator.label}-${shouldShowIcon}`}
											initial={{ opacity: 0, scale: 0, rotate: -180 }}
											animate={{
												opacity: 1,
												scale: [0, 1.3, 1],
												rotate: 0,
											}}
											exit={{ opacity: 0, scale: 0, rotate: 180 }}
											transition={{
												duration: 0.5,
												type: "spring",
												stiffness: 200,
												damping: 15,
											}}
											className="mt-2"
										>
											{type === "connecting" ? (
												<CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
											) : (
												<XCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>

				{/* Terminal output */}
				<div
					className={`w-96 mx-auto bg-black/50 rounded-lg p-4 border backdrop-blur-sm ${
						type === "connecting" ? "border-cyan-500/30" : "border-red-500/30"
					}`}
				>
					<div className="flex items-center mb-3">
						<Terminal
							className={`w-4 h-4 mr-2 ${
								type === "connecting" ? "text-cyan-400" : "text-red-400"
							}`}
						/>
						<span
							className={`text-xs font-mono ${
								type === "connecting" ? "text-cyan-400" : "text-red-400"
							}`}
						>
							NEURAL_INTERFACE_v2.1
						</span>
					</div>
					<div className="space-y-1 max-h-32 overflow-hidden">
						<AnimatePresence>
							{terminalLines.map((line, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0 }}
									className={`text-sm font-mono flex items-center ${
										type === "connecting" ? "text-green-400" : "text-red-400"
									}`}
								>
									<span
										className={`mr-2 ${
											type === "connecting" ? "text-cyan-400" : "text-red-400"
										}`}
									>
										{">"}
									</span>
									<span className="flex-1">{line}</span>
									{index === currentPhase && (
										<motion.div
											className={`w-2 h-4 ml-2 ${
												type === "connecting" ? "bg-green-400" : "bg-red-400"
											}`}
											animate={{ opacity: [0, 1, 0] }}
											transition={{ duration: 0.8, repeat: Infinity }}
										/>
									)}
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>

				{/* Final status */}
				{currentPhase >= phases.length - 1 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.5 }}
						className="mt-8 flex items-center justify-center"
					>
						{type === "connecting" ? (
							<CheckCircle className="w-8 h-8 text-green-400 mr-3" />
						) : (
							<XCircle className="w-8 h-8 text-red-400 mr-3" />
						)}
						<span
							className={`text-xl font-mono font-bold ${
								type === "connecting" ? "text-green-400" : "text-red-400"
							}`}
						>
							{type === "connecting"
								? "CONNECTION ESTABLISHED"
								: "NEURAL LINK TERMINATED"}
						</span>
					</motion.div>
				)}
			</div>

			{/* Glitch effect overlay */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"
				animate={{
					x: ["-100%", "100%"],
					opacity: [0, 0.3, 0],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					repeatDelay: 3,
				}}
			/>
		</div>
	);
}
