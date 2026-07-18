import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import type { CyberpunkTerminalProps } from "./types";
import { detectMacOS, getCurrentDirectory } from "./utils";
import {
	executeCommand,
	handleKeyboardShortcuts,
	initializeFileSystem,
} from "./commands";
import { isSystemInRescueMode } from "@/lib/terminal-commands/systemctl";
import { INITIAL_HISTORY, VERSION } from "./constants";
import {
	useTerminalState,
	useTerminalHistory,
	useCommandAliases,
	useTerminalTheme,
	useAutoComplete,
} from "./hooks";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

import BlogPostModal from "@/components/BlogPostModal";
import ProjectModal from "@/components/ProjectModal";
import { GameModal, GameType } from "@/components/GameModal";

export default function CyberpunkTerminal({
	isOpen,
	onClose,
}: CyberpunkTerminalProps) {
	const [location, navigate] = useLocation();
	const [input, setInput] = useState("");
	const [isMac] = useState(detectMacOS);
	const [isInitialized, setIsInitialized] = useState(false);

	const {
		state: terminalState,
		updateState: setTerminalState,
		setFileSystem,
	} = useTerminalState();

	const {
		history,
		commandHistory,
		addToHistory,
		clearHistory,
		addToCommandHistory,
		navigateHistory,
		getLastCommand,
		initializeHistory,
	} = useTerminalHistory(INITIAL_HISTORY);

	const { aliases, addAlias, removeAlias, listAliases, resolveAlias } =
		useCommandAliases();

	const { currentTheme, changeTheme, listThemes } = useTerminalTheme();

	const { handleTabCompletion } = useAutoComplete(terminalState, isMac);

	const musicPlayer = useMusicPlayer();

	const [blogModalOpen, setBlogModalOpen] = useState(false);
	const [projectModalOpen, setProjectModalOpen] = useState(false);
	const [selectedBlogId, setSelectedBlogId] = useState("");
	const [selectedProjectId, setSelectedProjectId] = useState("");
	const [gameModalOpen, setGameModalOpen] = useState(false);
	const [gameType, setGameType] = useState<GameType>("tetris");

	const inputRef = useRef<HTMLInputElement>(null);
	const terminalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen && !isInitialized) {
			const initFileSystem = async () => {
				try {
					const fileSystem = await initializeFileSystem();
					setFileSystem(fileSystem);

					initializeHistory();
					setIsInitialized(true);
				} catch (error) {
					console.error("Failed to initialize file system:", error);
					setIsInitialized(true);
				}
			};

			initFileSystem();
		}
	}, [isOpen, isInitialized, setFileSystem, initializeHistory]);

	const handleOpenBlogPost = useCallback((blogId: string) => {
		setSelectedBlogId(blogId);
		setBlogModalOpen(true);
	}, []);

	const handleOpenProject = useCallback((projectId: string) => {
		setSelectedProjectId(projectId);
		setProjectModalOpen(true);
	}, []);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, [history]);

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			const handled = handleKeyboardShortcuts(
				e,
				isMac,
				navigate,
				isOpen,
				onClose
			);
			if (handled) {
				e.preventDefault();
			}
		};

		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [isMac, navigate, isOpen, onClose]);

	const handleTabComplete = useCallback(() => {
		const result = handleTabCompletion(input);
		if (result.newInput !== input) {
			setInput(result.newInput);
		}
		if (result.message) {
			const promptPrefix = `user@omidnw:${getCurrentDirectory(
				terminalState.currentPath || []
			)}$ `;
			addToHistory(`${promptPrefix}${input}`);
			addToHistory(result.message);
		}
	}, [input, handleTabCompletion, addToHistory, terminalState]);

	const getMusicPlayerState = useCallback(() => {
		if (!musicPlayer) return null;
		return {
			isPlaying: musicPlayer.isPlaying,
			currentTime: musicPlayer.currentTime,
			duration: musicPlayer.duration,
			volume: musicPlayer.volume,
			isMuted: musicPlayer.isMuted,
			loop: musicPlayer.loop,
			audioSrc: musicPlayer.audioSrc,
		};
	}, [musicPlayer]);

	const executeTerminalCommand = useCallback(
		(cmd: string) => {
			let trimmedCmd = cmd.trim();
			if (!trimmedCmd) return;

			if (trimmedCmd === "!!") {
				const lastCmd = getLastCommand();
				if (!lastCmd) {
					addToHistory(
						"Error: No previous command found. Use arrow keys to navigate history."
					);
					return;
				}
				trimmedCmd = lastCmd;
			}

			const promptPrefix = isSystemInRescueMode()
				? `💀 RESCUE MODE 💀:${getCurrentDirectory(
						terminalState.currentPath || []
				  )}# `
				: `user@omidnw:${getCurrentDirectory(
						terminalState.currentPath || []
				  )}$ `;
			addToHistory(`${promptPrefix}${trimmedCmd}`);

			addToCommandHistory(trimmedCmd);

			try {
				const output = executeCommand(
					trimmedCmd,
					isMac,
					navigate,
					terminalState,
					setTerminalState,
					handleOpenBlogPost,
					handleOpenProject,
					addToHistory,
					resolveAlias,
					getMusicPlayerState
				);

				if (output === "CLEAR_TERMINAL") {
					clearHistory();
					return;
				}

				if (output === "EXIT_TERMINAL") {
					onClose();
					return;
				}

				if (output === "OPEN_TETRIS_MODAL") {
					setGameType("tetris");
					setGameModalOpen(true);
					addToHistory("Opening Cyber Tetris...");
					return;
				}

				if (output === "OPEN_SNAKE_MODAL") {
					setGameType("snake");
					setGameModalOpen(true);
					addToHistory("Opening Cyber Snake...");
					return;
				}

				if (output.startsWith("ALIAS_ADD:")) {
					const parts = output.split(":");
					const result = addAlias(parts[1], parts.slice(2).join(":"));
					addToHistory(result);
					return;
				}

				if (output.startsWith("ALIAS_REMOVE:")) {
					const name = output.split(":")[1];
					const result = removeAlias(name);
					addToHistory(result);
					return;
				}

				if (output === "ALIAS_LIST") {
					addToHistory(listAliases());
					return;
				}

				if (output.startsWith("THEME_CHANGE:")) {
					const themeName = output.split(":")[1];
					const result = changeTheme(themeName);
					addToHistory(result);
					return;
				}

				if (output === "THEME_LIST") {
					addToHistory(listThemes());
					return;
				}

				if (output === "MUSIC_PLAY") {
					if (musicPlayer) {
						if (!musicPlayer.isPlaying) {
							musicPlayer.togglePlayPause();
							addToHistory("▶ Music playback resumed");
						} else {
							addToHistory("Music is already playing");
						}
					} else {
						addToHistory("Error: Music player not available");
					}
					return;
				}

				if (output === "MUSIC_PAUSE") {
					if (musicPlayer) {
						if (musicPlayer.isPlaying) {
							musicPlayer.togglePlayPause();
							addToHistory("⏸ Music paused");
						} else {
							addToHistory("Music is already paused");
						}
					} else {
						addToHistory("Error: Music player not available");
					}
					return;
				}

				if (output === "MUSIC_STOP") {
					if (musicPlayer) {
						if (musicPlayer.isPlaying) {
							musicPlayer.togglePlayPause();
						}
						musicPlayer.seek(0);
						addToHistory("⏹ Music stopped and reset to beginning");
					} else {
						addToHistory("Error: Music player not available");
					}
					return;
				}

				if (output === "MUSIC_MUTE") {
					if (musicPlayer) {
						musicPlayer.toggleMute();
						addToHistory(
							musicPlayer.isMuted ? "🔇 Audio muted" : "🔊 Audio unmuted"
						);
					} else {
						addToHistory("Error: Music player not available");
					}
					return;
				}

				if (output === "MUSIC_LOOP") {
					if (musicPlayer) {
						musicPlayer.toggleLoop();
						addToHistory(
							musicPlayer.loop ? "🔁 Loop enabled" : "Loop disabled"
						);
					} else {
						addToHistory("Error: Music player not available");
					}
					return;
				}

				if (output.startsWith("MUSIC_VOLUME:")) {
					const volume = parseInt(output.split(":")[1]);
					if (musicPlayer) {
						musicPlayer.setVolume(volume / 100);
						addToHistory(`🔊 Volume set to ${volume}%`);
					} else {
						addToHistory("Error: Music player not available");
					}
					return;
				}

				if (output) {
					addToHistory(output);
				}
			} catch (error) {
				console.error("Command execution error:", error);
				addToHistory(
					`Error: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}
		},
		[
			getLastCommand,
			addToHistory,
			terminalState,
			addToCommandHistory,
			isMac,
			navigate,
			setTerminalState,
			handleOpenBlogPost,
			handleOpenProject,
			resolveAlias,
			clearHistory,
			onClose,
			addAlias,
			removeAlias,
			listAliases,
			changeTheme,
			listThemes,
			getMusicPlayerState,
			musicPlayer,
		]
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		executeTerminalCommand(input);
		setInput("");
	};

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				const cmd = navigateHistory("up");
				if (cmd !== "") {
					setInput(cmd);
				}
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				const cmd = navigateHistory("down");
				setInput(cmd);
			} else if (e.key === "Tab") {
				e.preventDefault();
				handleTabComplete();
			} else if (e.key === "l" && e.ctrlKey) {
				e.preventDefault();
				clearHistory();
			}
		},
		[navigateHistory, handleTabComplete, clearHistory]
	);

	const themeStyles = useMemo(
		() => ({
			"--terminal-primary": currentTheme.primary,
			"--terminal-secondary": currentTheme.secondary,
			"--terminal-background": currentTheme.background,
		}),
		[currentTheme]
	);

	if (!isOpen) return null;

	return (
		<LazyMotion features={domMax}>
			<AnimatePresence>
				{isOpen && (
					<>
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
							onClick={onClose}
						/>

						<m.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="fixed inset-4 md:inset-8 lg:inset-16 z-40"
							style={themeStyles as React.CSSProperties}
						>
							<Card
								variant="cyberpunk"
								className="h-full flex flex-col backdrop-blur-md border-primary/50 relative overflow-hidden"
								style={{ background: currentTheme.background }}
							>
								<div className="absolute inset-0 pointer-events-none">
									<div
										className="absolute inset-0"
										style={{
											opacity: isSystemInRescueMode()
												? 0.1
												: parseFloat(currentTheme.matrixOpacity),
										}}
									>
										<div className="matrix-rain" />
									</div>

									{!isSystemInRescueMode() && (
										<div
											className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse"
											style={{
												opacity: parseFloat(currentTheme.scanlineOpacity),
											}}
										/>
									)}

									<div
										className="absolute inset-0"
										style={{
											opacity: isSystemInRescueMode()
												? 0.05
												: parseFloat(currentTheme.gridOpacity),
											backgroundImage: `
												linear-gradient(${currentTheme.primary}33 1px, transparent 1px),
												linear-gradient(90deg, ${currentTheme.primary}33 1px, transparent 1px)
											`,
											backgroundSize: "20px 20px",
										}}
									/>
								</div>

								{/* Header */}
								<div className="flex items-center justify-between p-3 border-b border-primary/30 bg-black/20 relative z-10">
									<div className="flex items-center gap-2">
										<div className="flex gap-1">
											<div className="w-3 h-3 rounded-full bg-red-500/70" />
											<div className="w-3 h-3 rounded-full bg-yellow-500/70" />
											<div className="w-3 h-3 rounded-full bg-green-500/70" />
										</div>
										<span className="font-mono text-primary text-sm font-bold ml-2">
											CYBERPUNK_TERMINAL v{VERSION}
										</span>
									</div>
									<button
										onClick={onClose}
										className="text-muted-foreground hover:text-primary transition-colors p-1"
										aria-label="Close terminal"
									>
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</div>

								{/* Terminal Content */}
								<div
									ref={terminalRef}
									className="flex-1 p-4 overflow-auto bg-black/40 relative z-10"
								>
									<div className="space-y-1">
										{history.map((line, index) => (
											<div
												key={index}
												className="font-mono text-sm text-primary whitespace-pre-wrap break-words leading-relaxed"
												style={{ lineHeight: "1.4" }}
											>
												{line}
											</div>
										))}
									</div>
								</div>

								{/* Input */}
								<div className="p-4 border-t border-primary/30 bg-black/20 relative z-10">
									<form
										onSubmit={handleSubmit}
										className="flex items-center gap-2"
									>
										<span className="font-mono text-primary text-sm flex-shrink-0">
											{isSystemInRescueMode() ? (
												<span className="text-red-500 font-bold">
													💀 RESCUE MODE 💀:
													<span className="text-red-400">
														{getCurrentDirectory(
															terminalState.currentPath || []
														)}
													</span>
													#
												</span>
											) : (
												<>
													user@omidnw:
													<span className="text-secondary">
														{getCurrentDirectory(
															terminalState.currentPath || []
														)}
													</span>
													$
												</>
											)}
										</span>
										<input
											ref={inputRef}
											type="text"
											value={input}
											onChange={(e) => setInput(e.target.value)}
											onKeyDown={handleKeyDown}
											className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-primary placeholder-primary/50"
											placeholder="Type 'help' for available commands..."
											autoComplete="off"
											spellCheck={false}
										/>
									</form>
								</div>

								{/* Loading indicator */}
								{!isInitialized && (
									<div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
										<div className="text-center">
											<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
											<p className="font-mono text-primary text-sm">
												▶ INITIALIZING NEURAL MATRIX...
											</p>
										</div>
									</div>
								)}
							</Card>
						</m.div>

						{/* Blog Post Modal */}
						<BlogPostModal
							isOpen={blogModalOpen}
							onClose={() => setBlogModalOpen(false)}
							blogId={selectedBlogId}
						/>

						{/* Project Modal */}
						<ProjectModal
							isOpen={projectModalOpen}
							onClose={() => setProjectModalOpen(false)}
							projectId={selectedProjectId}
						/>

						{/* Game Modal */}
						<GameModal
							isOpen={gameModalOpen}
							onClose={() => setGameModalOpen(false)}
							gameType={gameType}
						/>
					</>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
