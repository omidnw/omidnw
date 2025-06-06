import React, { useState, useEffect, useRef, useCallback } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import type { CyberpunkTerminalProps, TerminalState } from "./types";
import { detectMacOS, getCurrentPath, getCurrentDirectory } from "./utils";
import {
	executeCommand,
	handleKeyboardShortcuts,
	initializeFileSystem,
} from "./commands";
import { INITIAL_HISTORY, VERSION } from "./constants";

// Import modal components
import BlogPostModal from "@/components/BlogPostModal";
import ProjectModal from "@/components/ProjectModal";

export default function CyberpunkTerminal({
	isOpen,
	onClose,
}: CyberpunkTerminalProps) {
	const [location, navigate] = useLocation();
	const [input, setInput] = useState("");
	const [history, setHistory] = useState<string[]>(INITIAL_HISTORY.slice());
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [isMac] = useState(detectMacOS);
	const [isInitialized, setIsInitialized] = useState(false);

	// Terminal state for file system navigation
	const [terminalState, setTerminalState] = useState<TerminalState>({
		currentPath: [],
		fileSystem: {},
	});

	// Modal states
	const [blogModalOpen, setBlogModalOpen] = useState(false);
	const [projectModalOpen, setProjectModalOpen] = useState(false);
	const [selectedBlogId, setSelectedBlogId] = useState("");
	const [selectedProjectId, setSelectedProjectId] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	const terminalRef = useRef<HTMLDivElement>(null);

	// Initialize file system when terminal opens
	useEffect(() => {
		if (isOpen && !isInitialized) {
			const initFileSystem = async () => {
				try {
					const fileSystem = await initializeFileSystem();
					setTerminalState((prev) => ({
						...prev,
						fileSystem,
					}));
					setIsInitialized(true);
				} catch (error) {
					console.error("Failed to initialize file system:", error);
					setIsInitialized(true); // Continue even if initialization fails
				}
			};

			initFileSystem();
		}
	}, [isOpen, isInitialized]);

	// Handle modal opening functions
	const handleOpenBlogPost = useCallback((blogId: string) => {
		setSelectedBlogId(blogId);
		setBlogModalOpen(true);
	}, []);

	const handleOpenProject = useCallback((projectId: string) => {
		setSelectedProjectId(projectId);
		setProjectModalOpen(true);
	}, []);

	// Focus input when terminal opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	// Auto-scroll to bottom when history updates
	useEffect(() => {
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, [history]);

	// Handle keyboard shortcuts
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

	const addToHistory = (content: string) => {
		setHistory((prev) => [...prev, content]);
	};

	const findCommonPrefix = (strings: string[]): string => {
		if (strings.length === 0) return "";
		if (strings.length === 1) return strings[0];

		let prefix = strings[0];
		for (let i = 1; i < strings.length; i++) {
			while (strings[i].indexOf(prefix) !== 0) {
				prefix = prefix.substring(0, prefix.length - 1);
				if (prefix === "") return "";
			}
		}
		return prefix;
	};

	const handleTabCompletion = () => {
		const trimmedInput = input.trim();
		if (!trimmedInput) return;

		const parts = trimmedInput.split(" ");
		const command = parts[0].toLowerCase();
		const argument = parts.slice(1).join(" ");

		// Command completion (if no arguments yet)
		if (parts.length === 1) {
			const commands = [
				"help",
				"ls",
				"cd",
				"pwd",
				"whoami",
				"status",
				"clear",
				"exit",
				"read",
			];
			const matches = commands.filter((cmd) =>
				cmd.startsWith(command.toLowerCase())
			);
			if (matches.length === 1) {
				setInput(matches[0] + " ");
			} else if (matches.length > 1) {
				// Show available options
				addToHistory(
					`${getCurrentDirectory(
						terminalState.currentPath || []
					)}$ ${trimmedInput}`
				);
				addToHistory(`Available commands: ${matches.join("  ")}`);
			}
			return;
		}

		// Path/file completion for cd and read commands
		if (command === "cd" || command === "read") {
			const currentPath = terminalState.currentPath || [];
			const { fileSystem } = terminalState;

			// Get available options in current directory
			let availableItems: string[] = [];

			if (currentPath.length === 0) {
				// At root level
				availableItems = [
					"blog/",
					"projects/",
					"home/",
					"about/",
					"contact/",
					"terminal/",
				];
				if (command === "cd") {
					availableItems.push("../", "~/");
				}
			} else {
				// In a subdirectory
				let currentNode: any = fileSystem[currentPath[0]];
				for (let i = 1; i < currentPath.length && currentNode; i++) {
					if (currentNode.children && currentNode.children[currentPath[i]]) {
						currentNode = currentNode.children[currentPath[i]];
					} else {
						currentNode = undefined;
						break;
					}
				}

				if (currentNode?.children) {
					availableItems = Object.values(currentNode.children)
						.map((item: any) => {
							if (command === "cd") {
								return item.type === "directory" ? `${item.name}/` : item.name;
							} else {
								// For read command, only show files
								return item.type === "file" ? item.name : null;
							}
						})
						.filter(Boolean) as string[];
				}

				if (command === "cd") {
					availableItems.push("../", "~/");
				}
			}

			// Filter based on current argument
			const matches = availableItems.filter((item) =>
				item.toLowerCase().startsWith(argument.toLowerCase())
			);

			if (matches.length === 1) {
				setInput(`${command} ${matches[0]}`);
			} else if (matches.length > 1) {
				// Find common prefix for partial completion
				const commonPrefix = findCommonPrefix(matches);
				if (commonPrefix && commonPrefix.length > argument.length) {
					setInput(`${command} ${commonPrefix}`);
				} else {
					// Show available options
					addToHistory(
						`${getCurrentDirectory(
							terminalState.currentPath || []
						)}$ ${trimmedInput}`
					);
					const label =
						command === "cd" ? "Available directories" : "Available files";
					addToHistory(`${label}: ${matches.join("  ")}`);
				}
			}
		}
	};

	const executeTerminalCommand = (cmd: string) => {
		const trimmedCmd = cmd.trim();
		if (!trimmedCmd) return;

		// Add command to history
		addToHistory(
			`user@omidnw:${getCurrentDirectory(
				terminalState.currentPath || []
			)}$ ${trimmedCmd}`
		);

		// Add to command history for up/down arrow navigation
		setCommandHistory((prev) => [...prev, trimmedCmd]);
		setHistoryIndex(-1);

		try {
			const output = executeCommand(
				trimmedCmd,
				isMac,
				navigate,
				terminalState,
				setTerminalState,
				handleOpenBlogPost,
				handleOpenProject
			);

			if (output === "CLEAR_TERMINAL") {
				setHistory([]);
				return;
			}

			if (output === "EXIT_TERMINAL") {
				onClose();
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
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		executeTerminalCommand(input);
		setInput("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (commandHistory.length > 0) {
				const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
				setHistoryIndex(newIndex);
				setInput(commandHistory[commandHistory.length - 1 - newIndex]);
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (historyIndex > 0) {
				const newIndex = historyIndex - 1;
				setHistoryIndex(newIndex);
				setInput(commandHistory[commandHistory.length - 1 - newIndex]);
			} else if (historyIndex === 0) {
				setHistoryIndex(-1);
				setInput("");
			}
		} else if (e.key === "Tab") {
			e.preventDefault();
			handleTabCompletion();
		}
	};

	if (!isOpen) return null;

	return (
		<LazyMotion features={domMax}>
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
							onClick={onClose}
						/>

						{/* Terminal */}
						<m.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="fixed inset-4 md:inset-8 lg:inset-16 z-40"
						>
							<Card
								variant="cyberpunk"
								className="h-full flex flex-col bg-black/90 backdrop-blur-md border-primary/50 relative overflow-hidden"
							>
								{/* Background Effects */}
								<div className="absolute inset-0 pointer-events-none">
									{/* Matrix rain effect */}
									<div className="absolute inset-0 opacity-5">
										<div className="matrix-rain" />
									</div>

									{/* Scan lines */}
									<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />

									{/* Cyber grid */}
									<div
										className="absolute inset-0 opacity-10"
										style={{
											backgroundImage: `
												linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
												linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
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
											user@omidnw:
											<span className="text-secondary">
												{getCurrentDirectory(terminalState.currentPath || [])}
											</span>
											$
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
					</>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
