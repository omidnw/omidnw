import React, { useState, useEffect } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";

interface SuccessRecoveryOverlayProps {
	show: boolean;
	onComplete: () => void;
}

export default function SuccessRecoveryOverlay({
	show,
	onComplete,
}: SuccessRecoveryOverlayProps) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (!show) return;

		// Simulate recovery progress
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setTimeout(() => {
						onComplete();
						// Refresh the page after recovery completes
						setTimeout(() => {
							console.log(
								"🔄 Recovery complete - refreshing page to ensure clean state"
							);
							window.location.reload();
						}, 1000);
					}, 1000); // Wait 1 second then complete
					return 100;
				}
				return prev + 2; // Increase by 2% every 50ms (2.5 seconds total)
			});
		}, 50);

		return () => clearInterval(interval);
	}, [show, onComplete]);

	if (!show) return null;

	return (
		<LazyMotion features={domMax}>
			<AnimatePresence>
				{show && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center"
					>
						<m.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.8, opacity: 0 }}
							className="bg-black border border-green-500/50 p-8 max-w-md w-full mx-4"
						>
							<div className="text-center">
								<m.div
									animate={{
										textShadow: [
											"0 0 5px #00ff00",
											"0 0 20px #00ff00",
											"0 0 5px #00ff00",
										],
									}}
									transition={{ duration: 0.5, repeat: Infinity }}
									className="text-4xl font-mono text-green-500 mb-4 font-bold"
								>
									🎉 SYSTEM RECOVERY 🎉
								</m.div>

								<div className="text-lg font-mono text-green-400 mb-6">
									NetworkManager service restored successfully
								</div>

								{/* Progress Bar */}
								<div className="w-full bg-gray-800 border border-green-500/30 mb-4">
									<m.div
										initial={{ width: 0 }}
										animate={{ width: `${progress}%` }}
										className="h-4 bg-gradient-to-r from-green-600 to-green-400 border-r border-green-300"
									/>
								</div>

								<div className="text-sm font-mono text-green-300 mb-4">
									Recovery Progress: {progress}%
								</div>

								<div className="text-xs font-mono text-green-200 space-y-1">
									<div>✅ Network connectivity restored</div>
									<div>✅ All services operational</div>
									<div>✅ System returning to normal mode</div>
									{progress >= 90 && (
										<m.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="text-green-400 font-bold mt-4"
										>
											🌐 WELCOME BACK TO THE MATRIX 🌐
										</m.div>
									)}
									{progress === 100 && (
										<m.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.5 }}
											className="text-blue-400 font-mono text-sm mt-3"
										>
											🔄 Refreshing system interface...
										</m.div>
									)}
								</div>
							</div>
						</m.div>
					</m.div>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
