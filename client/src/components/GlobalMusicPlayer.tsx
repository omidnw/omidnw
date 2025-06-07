import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	Repeat,
	Loader2,
	AlertTriangle,
	Music2,
	ChevronUp,
	ChevronDown,
	Settings,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const formatTime = (timeInSeconds: number): string => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds % 60);
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
		2,
		"0"
	)}`;
};

export default function GlobalMusicPlayer() {
	const {
		isPlaying,
		togglePlayPause,
		currentTime,
		duration,
		volume,
		setVolume,
		seek,
		isLoading,
		error,
		clearError,
		audioSrc,
		isMuted,
		toggleMute,
		loop,
		toggleLoop,
		autoPlay,
		toggleAutoPlay,
		attemptAutoplay,
		isAutoplaySupported,
	} = useMusicPlayer();

	const [isExpanded, setIsExpanded] = useState(false);
	const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
	const [autoplayStatus, setAutoplayStatus] = useState<string>("unknown");
	const playerRef = useRef<HTMLDivElement>(null);

	// Check autoplay support on mount
	useEffect(() => {
		isAutoplaySupported().then((status) => {
			setAutoplayStatus(status);
			console.log("🎵 Autoplay Policy:", status);
		});
	}, [isAutoplaySupported]);

	// Enhanced auto-play with bypass strategies
	useEffect(() => {
		if (
			!hasAutoPlayed &&
			autoPlay &&
			duration > 0 &&
			!isLoading &&
			!error &&
			!isPlaying
		) {
			const attemptPlay = async () => {
				try {
					console.log("🎵 Attempting advanced autoplay...");
					const success = await attemptAutoplay();

					if (success) {
						console.log("✅ Advanced autoplay succeeded!");
						setHasAutoPlayed(true);
					} else {
						console.log("⏸️ Autoplay blocked - waiting for user interaction");
						// Fallback to traditional method
						setTimeout(() => {
							togglePlayPause();
							setHasAutoPlayed(true);
						}, 500);
					}
				} catch (error) {
					console.warn("❌ Autoplay failed:", error);
					// Final fallback
					setTimeout(() => {
						togglePlayPause();
						setHasAutoPlayed(true);
					}, 500);
				}
			};

			// Small delay to ensure everything is ready
			const autoPlayTimer = setTimeout(attemptPlay, 300);
			return () => clearTimeout(autoPlayTimer);
		}
	}, [
		duration,
		isLoading,
		error,
		isPlaying,
		hasAutoPlayed,
		togglePlayPause,
		autoPlay,
		attemptAutoplay,
	]);

	const handleClick = () => {
		if (error) {
			clearError();
		}
		if (!isExpanded) {
			togglePlayPause();
		}
	};

	const handleSeek = (value: number[]) => {
		seek(value[0]);
	};

	const handleVolumeChange = (value: number[]) => {
		setVolume(value[0]);
	};

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	// Handle click outside to close expanded player
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isExpanded &&
				playerRef.current &&
				!playerRef.current.contains(event.target as Node)
			) {
				setIsExpanded(false);
			}
		};

		if (isExpanded) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isExpanded]);

	return (
		<div className="relative" ref={playerRef}>
			{/* Main Button */}
			<Button
				variant="ghost"
				size="icon"
				onClick={handleClick}
				className={cn(
					"relative transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10",
					isPlaying && !isLoading && !error
						? "text-primary hover:text-primary/80"
						: "text-muted-foreground hover:text-primary"
				)}
				aria-label={`Music Player - ${
					isLoading
						? "Loading"
						: error
						? "Error"
						: isPlaying
						? "Playing"
						: "Paused"
				}`}
			>
				{isLoading ? (
					<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
				) : error ? (
					<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
				) : isPlaying ? (
					<Pause className="w-4 h-4 sm:w-5 sm:h-5" />
				) : (
					<Play className="w-4 h-4 sm:w-5 sm:h-5" />
				)}

				{/* Playing indicator dot */}
				{isPlaying && !isLoading && !error && (
					<motion.div
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"
					/>
				)}
			</Button>

			{/* Expand/Collapse Button */}
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleExpanded}
				className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground hover:text-primary transition-colors"
				aria-label={isExpanded ? "Collapse player" : "Expand player"}
			>
				{isExpanded ? (
					<ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
				) : (
					<ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
				)}
			</Button>

			{/* Expandable Mini Player */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-w-[95vw] z-50"
					>
						<Card
							variant="cyberpunk"
							className="p-3 sm:p-4 shadow-2xl border-primary/50"
						>
							{/* Header */}
							<div className="flex items-center gap-2 mb-3">
								<Music2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
								<p className="text-xs font-mono text-primary truncate flex-1">
									{audioSrc.split("/").pop()?.replace(".mp3", "") ||
										"Cyberpunk Beats"}
								</p>
							</div>

							{/* Progress Bar */}
							<div className="mb-3">
								<Slider
									value={[currentTime]}
									max={duration || 100}
									step={0.1}
									onValueChange={handleSeek}
									onValueCommit={handleSeek}
									className="w-full h-1 [&>span:first-child]:h-1 [&>span:first-child>span]:h-4 [&>span:first-child>span]:w-4 [&>span:first-child>span]:border-2 touch-manipulation hover:cursor-pointer"
									aria-label="Track progress - Click or drag to seek"
								/>
								<div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
									<span>{formatTime(currentTime)}</span>
									<span>{formatTime(duration)}</span>
								</div>
							</div>

							{/* Controls */}
							<div className="flex items-center justify-between mb-3">
								{/* Volume Control */}
								<div className="flex items-center gap-1 sm:gap-2 flex-1 mr-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={toggleMute}
										className="w-7 h-7 sm:w-8 sm:h-8 text-primary hover:text-accent flex-shrink-0"
										aria-label={isMuted ? "Unmute" : "Mute"}
									>
										{isMuted || volume === 0 ? (
											<VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
										) : (
											<Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
										)}
									</Button>
									<Slider
										value={[isMuted ? 0 : volume]}
										max={1}
										step={0.01}
										onValueChange={handleVolumeChange}
										className="flex-1 h-1 [&>span:first-child]:h-1 [&>span:first-child>span]:h-3 [&>span:first-child>span]:w-3 touch-manipulation"
										aria-label="Volume"
									/>
								</div>

								{/* Play/Pause */}
								<Button
									variant="neon"
									size="icon"
									onClick={() => {
										if (error) clearError();
										togglePlayPause();
									}}
									className="w-9 h-9 sm:w-10 sm:h-10 rounded-full mx-2 flex-shrink-0"
									aria-label={isPlaying ? "Pause" : "Play"}
								>
									{isLoading ? (
										<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
									) : isPlaying ? (
										<Pause className="w-4 h-4 sm:w-5 sm:h-5" />
									) : (
										<Play className="w-4 h-4 sm:w-5 sm:h-5" />
									)}
								</Button>

								{/* Loop */}
								<Button
									variant="ghost"
									size="icon"
									onClick={toggleLoop}
									className={cn(
										"w-7 h-7 sm:w-8 sm:h-8 relative flex-shrink-0",
										loop
											? "text-primary bg-primary/20 border border-primary/50"
											: "text-muted-foreground hover:text-primary"
									)}
									aria-label={loop ? "Disable repeat" : "Enable repeat"}
								>
									<Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
									<span
										className={cn(
											"absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-xs font-bold rounded-full flex items-center justify-center",
											loop
												? "bg-primary text-primary-foreground"
												: "bg-muted-foreground text-background"
										)}
									>
										1
									</span>
								</Button>
							</div>

							{/* Settings Section */}
							<div className="border-t border-primary/20 pt-3">
								<div className="flex items-center gap-2 mb-2">
									<Settings className="w-3 h-3 text-primary" />
									<span className="text-xs font-mono text-primary">
										Player Settings
									</span>
								</div>

								{/* AutoPlay Toggle */}
								<div className="flex items-start justify-between py-2 gap-3">
									<div className="flex-1 min-w-0">
										<label className="text-xs font-mono text-foreground cursor-pointer block">
											Auto-play
											{autoplayStatus !== "unknown" && (
												<span
													className={cn(
														"ml-2 px-1.5 py-0.5 rounded text-xs font-bold",
														autoplayStatus === "allowed"
															? "bg-green-500/20 text-green-400 border border-green-500/30"
															: autoplayStatus === "allowed-muted"
															? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
															: "bg-red-500/20 text-red-400 border border-red-500/30"
													)}
												>
													{autoplayStatus === "allowed"
														? "✓ ALLOWED"
														: autoplayStatus === "allowed-muted"
														? "🔇 MUTED ONLY"
														: "✗ BLOCKED"}
												</span>
											)}
										</label>
										<p className="text-xs text-muted-foreground mt-0.5 leading-tight">
											{autoplayStatus === "allowed"
												? "Browser allows audio autoplay! Music will start automatically."
												: autoplayStatus === "allowed-muted"
												? "Browser allows muted autoplay. Audio will start silently then unmute."
												: autoplayStatus === "disallowed"
												? "Browser blocks autoplay. Music will start after first interaction."
												: "Auto-resume after page refresh. May be blocked by browser policies."}
										</p>
									</div>
									<Switch
										checked={autoPlay}
										onCheckedChange={toggleAutoPlay}
										className="flex-shrink-0 mt-0.5"
										aria-label="Toggle auto-play"
									/>
								</div>
							</div>

							{/* Error display */}
							{error && (
								<div className="mt-2 text-xs text-destructive font-mono bg-destructive/10 p-2 rounded leading-relaxed">
									{error}
								</div>
							)}
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
