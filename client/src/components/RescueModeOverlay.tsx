import React, { useState, useEffect } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import CyberpunkTerminal from "./CyberpunkTerminal";
import SuccessRecoveryOverlay from "./SuccessRecoveryOverlay";
import { useRescueMode } from "@/contexts/RescueModeContext";

export default function RescueModeOverlay() {
	const { isRescueMode, rescueStartTime } = useRescueMode();
	const [terminalOpen, setTerminalOpen] = useState(false);
	const [glitchText, setGlitchText] = useState("SYSTEM FAILURE");
	const [showRecovery, setShowRecovery] = useState(false);
	const [wasInRescueMode, setWasInRescueMode] = useState(false);

	// Track rescue mode changes
	useEffect(() => {
		if (isRescueMode) {
			setWasInRescueMode(true);
			// Delay opening terminal for dramatic effect
			if (!terminalOpen) {
				const timer = setTimeout(() => {
					setTerminalOpen(true);
				}, 2000);
				return () => clearTimeout(timer);
			}
		} else if (wasInRescueMode && !isRescueMode) {
			// Just exited rescue mode - show recovery
			setTerminalOpen(false);
			setShowRecovery(true);
		}
	}, [isRescueMode, terminalOpen, wasInRescueMode]);

	// Glitch text effect
	useEffect(() => {
		if (!isRescueMode) return;

		const glitchTexts = [
			"SYSTEM FAILURE",
			"NETWORK ERROR",
			"CONNECTION LOST",
			"EMERGENCY MODE",
			"CRITICAL ERROR",
			"SERVICE DOWN",
		];

		const interval = setInterval(() => {
			setGlitchText(
				glitchTexts[Math.floor(Math.random() * glitchTexts.length)]
			);
		}, 300);

		return () => clearInterval(interval);
	}, [isRescueMode]);

	const handleRecoveryComplete = () => {
		setShowRecovery(false);
		setWasInRescueMode(false);
	};

	// Don't render anything if not in rescue mode and not showing recovery
	if (!isRescueMode && !showRecovery) return null;

	const elapsedTime = rescueStartTime
		? Math.floor((new Date().getTime() - rescueStartTime.getTime()) / 1000)
		: 0;

	return (
		<LazyMotion features={domMax}>
			<AnimatePresence>
				{isRescueMode && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black screen-distortion"
					>
						{/* Background Effects */}
						<div className="absolute inset-0">
							{/* Red alert overlay */}
							<div className="absolute inset-0 bg-red-900/20 animate-pulse" />

							{/* Glitch Background */}
							<div className="absolute inset-0 bg-black glitch-bg" />

							{/* Scan lines */}
							<div className="absolute inset-0 opacity-30">
								<div
									className="w-full h-full animate-pulse"
									style={{
										backgroundImage: `
											linear-gradient(0deg, transparent 98%, rgba(255, 0, 0, 0.3) 100%),
											linear-gradient(90deg, transparent 98%, rgba(255, 0, 0, 0.3) 100%)
										`,
										backgroundSize: "100% 4px, 4px 100%",
									}}
								/>
							</div>

							{/* Matrix rain effect */}
							<div className="absolute inset-0 opacity-10">
								<div className="matrix-rain" />
							</div>

							{/* Glitch Layers */}
							<div className="absolute inset-0 glitch-layer-1" />
							<div className="absolute inset-0 glitch-layer-2" />
							<div className="absolute inset-0 glitch-layer-3" />
						</div>

						{/* Error Message */}
						<m.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.5 }}
							className="absolute inset-0 flex items-center justify-center"
						>
							<div className="text-center p-8 border border-red-500/50 bg-black/80 backdrop-blur-sm glitch-container">
								<m.div
									animate={{
										textShadow: [
											"0 0 5px #ff0000",
											"0 0 20px #ff0000",
											"0 0 5px #ff0000",
										],
									}}
									transition={{ duration: 0.5, repeat: Infinity }}
									className="text-6xl font-mono text-red-500 mb-4 font-bold glitch-text"
									data-text={`🚨 ${glitchText} 🚨`}
								>
									🚨 {glitchText} 🚨
								</m.div>

								<div
									className="text-2xl font-mono text-red-400 mb-6 glitch-text-small"
									data-text="HTTP ERROR 503 - SERVICE TEMPORARILY UNAVAILABLE"
								>
									HTTP ERROR 503 - SERVICE TEMPORARILY UNAVAILABLE
								</div>

								<div className="text-lg font-mono text-red-300 mb-4">
									NetworkManager service has failed
								</div>

								<div className="text-sm font-mono text-red-200 mb-6">
									Downtime: {elapsedTime}s | Status: CRITICAL
								</div>

								<div className="border border-red-500/30 p-4 bg-red-900/20 glitch-container">
									<div
										className="text-red-400 font-mono text-sm mb-2 glitch-text-small"
										data-text="🆘 EMERGENCY RECOVERY REQUIRED:"
									>
										🆘 EMERGENCY RECOVERY REQUIRED:
									</div>
									<div
										className="text-red-300 font-mono font-bold glitch-text-small"
										data-text="systemctl start NetworkManager"
									>
										systemctl start NetworkManager
									</div>
								</div>

								{!terminalOpen && (
									<m.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 1 }}
										className="mt-6 text-red-300 font-mono text-sm animate-pulse"
									>
										Opening emergency terminal...
									</m.div>
								)}
							</div>
						</m.div>

						{/* Auto-opened Terminal */}
						<CyberpunkTerminal
							isOpen={terminalOpen}
							onClose={() => {}} // Prevent manual closing in rescue mode
						/>

						{/* Corner Status */}
						<div
							className="absolute top-4 right-4 text-red-500 font-mono text-sm glitch-text-small"
							data-text="RESCUE MODE ACTIVE"
						>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse glitch-bg" />
								RESCUE MODE ACTIVE
							</div>
						</div>

						{/* Bottom Status Bar */}
						<div className="absolute bottom-4 left-4 right-4 text-red-400 font-mono text-xs">
							<div className="flex justify-between items-center">
								<div
									className="glitch-text-small"
									data-text="System Status: CRITICAL | Network: DISCONNECTED"
								>
									System Status: CRITICAL | Network: DISCONNECTED
								</div>
								<div
									className="glitch-text-small"
									data-text={`Emergency Mode | PID: ${
										Math.floor(Math.random() * 9000) + 1000
									}`}
								>
									Emergency Mode | PID:{" "}
									{Math.floor(Math.random() * 9000) + 1000}
								</div>
							</div>
						</div>
					</m.div>
				)}
			</AnimatePresence>

			{/* Success Recovery Overlay */}
			<SuccessRecoveryOverlay
				show={showRecovery}
				onComplete={handleRecoveryComplete}
			/>
		</LazyMotion>
	);
}
