import type { TerminalCommands, TerminalState, FileSystemNode } from "./types";
import {
	getTimeInfo,
	formatTime,
	getTimeDifferenceText,
	getUserTimezoneDisplay,
	getCurrentDirectory,
	resolvePath,
} from "./utils";

// Import the libs for loading real content
import { loadLocalBlogPosts } from "@/lib/local-blogs";
import { loadLocalProjects } from "@/lib/local-projects";
import {
	fetchAllBlogPosts,
	fetchAllProjects,
	isGitHubConfigured,
} from "@/lib/github-api";

// Import command handlers
import { handleCdCommand } from "@/lib/terminal-commands/cd";
import { generateLsOutput } from "@/lib/terminal-commands/ls";
import { handleReadCommand } from "@/lib/terminal-commands/read";
import { handleExecuteCommand } from "@/lib/terminal-commands/execute";
import {
	handleSystemctlCommand,
	isSystemInRescueMode,
	getRescueModePrompt,
} from "@/lib/terminal-commands/systemctl";
import {
	handleWhoamiCommand,
	handleStatusCommand,
	handleClearCommand,
	handleExitCommand,
	handleReloadCommand,
} from "@/lib/terminal-commands/utility";
import { handleNeofetchCommand } from "@/lib/terminal-commands/neofetch";
import {
	handleHistoryCommand,
	handleClearHistoryCommand,
} from "@/lib/terminal-commands/history";
import { handleShutdownCommand } from "@/lib/terminal-commands/shutdown";
import { handlePsCommand } from "@/lib/terminal-commands/ps";
import { handleTopCommand } from "@/lib/terminal-commands/top";
import { handleManCommand } from "@/lib/terminal-commands/man";
import { handleTetrisCommand } from "@/lib/terminal-commands/tetris";
import { handleSnakeCommand } from "@/lib/terminal-commands/snake";
import { handleAliasCommand, handleUnaliasCommand } from "@/lib/terminal-commands/alias";
import {
	handleThemeCommand,
	handleEchoCommand,
	handleDateCommand,
	handleTimeCommand,
	handleUptimeCommand,
} from "@/lib/terminal-commands/theme";
import {
	parsePipedCommand,
	applyPipeFilters,
} from "@/lib/terminal-commands/pipe-utils";
import { handleMusicCommand } from "@/lib/terminal-commands/music";

let blogPosts: any = {};
let projects: any = {};

/**
 * Initialize the file system with real data
 */
export const initializeFileSystem = async (): Promise<
	Record<string, FileSystemNode>
> => {
	// Load blog posts
	try {
		if (isGitHubConfigured()) {
			blogPosts = await fetchAllBlogPosts();
		} else {
			const localBlogsList = await loadLocalBlogPosts();
			blogPosts = localBlogsList.reduce((acc, blog) => {
				acc[blog.id] = blog;
				return acc;
			}, {} as any);
		}
	} catch (error) {
		console.warn("Failed to load blog posts:", error);
		blogPosts = {};
	}

	// Load projects
	try {
		if (isGitHubConfigured()) {
			projects = await fetchAllProjects();
		} else {
			const localProjectsList = await loadLocalProjects();
			projects = localProjectsList.reduce((acc, project) => {
				acc[project.id] = project;
				return acc;
			}, {} as any);
		}
	} catch (error) {
		console.warn("Failed to load projects:", error);
		projects = {};
	}

	// Create file system structure
	const fileSystem: Record<string, FileSystemNode> = {
		blog: {
			name: "blog",
			type: "directory",
			children: {},
		},
		projects: {
			name: "projects",
			type: "directory",
			children: {},
		},
		about: {
			name: "about",
			type: "directory",
		},
		contact: {
			name: "contact",
			type: "directory",
		},
		home: {
			name: "home",
			type: "directory",
		},
		terminal: {
			name: "terminal",
			type: "directory",
		},
	};

	// Add blog posts to blog directory
	if (fileSystem.blog.children) {
		Object.keys(blogPosts).forEach((blogId) => {
			fileSystem.blog.children![blogId] = {
				name: blogId,
				type: "file",
				content: "blog",
			};
		});
	}

	// Add projects to projects directory
	if (fileSystem.projects.children) {
		console.log("📁 Adding projects to file system:", Object.keys(projects));
		Object.keys(projects).forEach((projectId) => {
			fileSystem.projects.children![projectId] = {
				name: projectId,
				type: "file",
				content: "project",
			};
		});
		console.log(
			"✅ Projects added to file system:",
			Object.keys(fileSystem.projects.children)
		);
	}

	return fileSystem;
};

/**
 * Get all terminal commands with OS-specific shortcuts
 */
export const getCommands = (isMac: boolean): TerminalCommands => ({
	help: `Available commands:
┌─────────────────────────────────────────────────────────────┐
│  NAVIGATION COMMANDS                                        │
├─────────────────────────────────────────────────────────────┤
│  cd /home, cd /         → Navigate to Home                 │
│  cd /about              → Navigate to About                │
│  cd /projects           → Navigate to Projects             │
│  cd /blog               → Navigate to Blog                 │
│  cd /contact            → Navigate to Contact              │
│  cd /terminal           → Open Terminal Interface          │
│  cd blog/               → Navigate to blog directory       │
│  cd projects/           → Navigate to projects directory   │
│  cd ..                  → Go back to parent directory      │
│  cd ~                   → Go to home directory (/)         │
├─────────────────────────────────────────────────────────────┤
│  FILE SYSTEM COMMANDS                                       │
├─────────────────────────────────────────────────────────────┤
│  ls                     → List directory contents          │
│  pwd                    → Show current directory path      │
│  read <filename>        → View blog post or project        │
│  ./<project-id>         → Run project demo (in /projects)  │
├─────────────────────────────────────────────────────────────┤
│  SYSTEM COMMANDS                                            │
├─────────────────────────────────────────────────────────────┤
│  systemctl status       → Show all service status          │
│  systemctl status <srv> → Show specific service status     │
│  systemctl start <srv>  → Start a service                  │
│  systemctl stop <srv>   → Stop a service                   │
│  neofetch               → Display system information       │
├─────────────────────────────────────────────────────────────┤
│  UTILITY COMMANDS                                           │
├─────────────────────────────────────────────────────────────┤
│  whoami                 → Show current user info           │
│  status                 → Show connection status           │
│  clear                  → Clear terminal                   │
│  history                → Show command history             │
│  clear-history          → Clear command history            │
│  shutdown [opts] [time] → Shutdown/restart system          │
│  ps [options]           → Display running processes        │
│  top [options]          → Display Linux processes          │
│  man <command>          → Display manual pages             │
│  tetris                 → Play Cyber Tetris game          │
│  snake                  → Play Cyber Snake game           │
│  exit, quit             → Close terminal                   │
│  reload                 → Reload the application           │
├─────────────────────────────────────────────────────────────┤
│  CUSTOMIZATION                                              │
├─────────────────────────────────────────────────────────────┤
│  alias <name>=<cmd>     → Create command alias            │
│  unalias <name>         → Remove command alias            │
│  theme [name]           → Change/list terminal themes     │
├─────────────────────────────────────────────────────────────┤
│  INFORMATION                                                │
├─────────────────────────────────────────────────────────────┤
│  echo <text>            → Display text                    │
│  date                   → Show current date/time          │
│  time                   → Show current time               │
│  uptime                 → Show system uptime              │
├─────────────────────────────────────────────────────────────┤
│  MUSIC PLAYER                                               │
├─────────────────────────────────────────────────────────────┤
│  music                  → Show music player TUI           │
│  music play             → Resume/start playback           │
│  music pause            → Pause playback                  │
│  music stop             → Stop and reset                  │
│  music volume <0-100>   → Set volume level                │
│  music mute             → Toggle mute                     │
│  music loop             → Toggle loop                     │
├─────────────────────────────────────────────────────────────┤
│  PIPING (Experimental)                                      │
├─────────────────────────────────────────────────────────────┤
│  <cmd> | grep <pattern> → Filter output by pattern        │
│  <cmd> | sort [-r]      → Sort output lines               │
│  <cmd> | head [-n]      → Show first N lines              │
│  <cmd> | tail [-n]      → Show last N lines               │
│  <cmd> | wc [-l|-w|-c]  → Count lines/words/chars         │
│  <cmd> | uniq           → Remove duplicate lines          │
├─────────────────────────────────────────────────────────────┤
│  SHORTCUTS                                                  │
├─────────────────────────────────────────────────────────────┤
│  ${
		isMac ? "Ctrl+Cmd+K" : "Ctrl+Alt+K"
	}             → Open terminal (global)           │
│  ${
		isMac ? "Ctrl+Cmd+H" : "Ctrl+Alt+H"
	}             → Go to home                       │
│  ${
		isMac ? "Ctrl+Cmd+A" : "Ctrl+Alt+A"
	}             → Go to about                      │
│  ${
		isMac ? "Ctrl+Cmd+P" : "Ctrl+Alt+P"
	}             → Go to projects                   │
│  ${
		isMac ? "Ctrl+Cmd+B" : "Ctrl+Alt+B"
	}             → Go to blog                       │
│  ${
		isMac ? "Ctrl+Cmd+C" : "Ctrl+Alt+C"
	}             → Go to contact                    │
│  ESC                    → Close terminal                   │
└─────────────────────────────────────────────────────────────┘`,
	ls: "", // Will be dynamically generated
	cd: "", // Will be dynamically handled
	pwd: "Show current directory path",
	read: "View blog post or project",
	systemctl: "System service control commands",
	neofetch: "Display system information",
	whoami: handleWhoamiCommand(isMac),
	status: handleStatusCommand(),
	clear: "Clear terminal screen",
	history: "Show command history",
	"clear-history": "Clear command history",
	shutdown: "Shutdown/restart system",
	exit: "Exit terminal",
	quit: "Exit terminal",
	reload: "Reload the application",
	ps: "Display running processes",
	top: "Display and update sorted information about running processes",
	man: "Display manual pages for commands",
	tetris: "Play Cyber Tetris game",
	snake: "Play Cyber Snake game",
	alias: "Create command aliases",
	unalias: "Remove command aliases",
	theme: "Change terminal theme",
	echo: "Display a line of text",
	date: "Display current date and time",
	time: "Display current time",
	uptime: "Show how long the system has been running",
	music: "Control music player",
});

/**
 * Execute a command and return the output
 */
export const executeCommand = (
	cmd: string,
	isMac: boolean,
	navigate: (path: string) => void,
	terminalState: TerminalState,
	setTerminalState: (state: TerminalState) => void,
	onOpenBlogPost?: (blogId: string) => void,
	onOpenProject?: (projectId: string) => void,
	addToHistory?: (content: string) => void,
	resolveAlias?: (command: string) => string,
	getMusicPlayerState?: () => any
): string => {
	let trimmedCmd = cmd.trim();

	if (resolveAlias) {
		trimmedCmd = resolveAlias(trimmedCmd);
	}

	const pipedCommands = parsePipedCommand(trimmedCmd);
	const mainCommand = pipedCommands[0];
	const pipeFilters = pipedCommands.slice(1);

	if (mainCommand === "!!") {
		return "Error: Cannot execute !! - no previous command. Use arrow keys to navigate history.";
	}

	if (isSystemInRescueMode()) {
		const [command, ...args] = mainCommand.split(" ");
		if (command === "systemctl" && args.join(" ") === "start NetworkManager") {
			return handleSystemctlCommand(args.join(" "), terminalState);
		} else {
			return `🚨 RESCUE MODE ACTIVE 🚨
❌ Network connectivity lost. System is in emergency recovery mode.
🔧 Only 'systemctl start NetworkManager' is allowed to restore connectivity.
💡 Run: systemctl start NetworkManager`;
		}
	}

	if (mainCommand.startsWith("./")) {
		const output = handleExecuteCommand(mainCommand, terminalState, projects);
		return pipeFilters.length > 0 ? applyPipeFilters(output, pipeFilters) : output;
	}

	if (mainCommand.startsWith("../")) {
		return handleCdCommand(
			[mainCommand],
			navigate,
			terminalState,
			setTerminalState,
			terminalState.fileSystem
		);
	}

	const [command, ...args] = mainCommand.split(" ");

	let output = "";

	switch (command.toLowerCase()) {
		case "help":
			output = getCommands(isMac).help;
			break;
		case "ls":
			output = generateLsOutput(terminalState, args);
			break;
		case "cd":
			return handleCdCommand(
				args,
				navigate,
				terminalState,
				setTerminalState,
				terminalState.fileSystem
			);
		case "pwd":
			output = getCurrentDirectory(terminalState.currentPath || []);
			break;
		case "whoami":
			output = handleWhoamiCommand(isMac);
			break;
		case "status":
			output = handleStatusCommand();
			break;
		case "clear":
			return handleClearCommand();
		case "exit":
		case "quit":
			return handleExitCommand();
		case "read":
			return handleReadCommand(
				args.join(" "),
				terminalState,
				blogPosts,
				projects,
				onOpenBlogPost,
				onOpenProject
			);
		case "reload":
			return handleReloadCommand();
		case "systemctl":
			output = handleSystemctlCommand(args.join(" "), terminalState);
			break;
		case "neofetch":
			output = handleNeofetchCommand();
			break;
		case "history":
			output = handleHistoryCommand();
			break;
		case "clear-history":
			return handleClearHistoryCommand();
		case "shutdown":
			if (!addToHistory) {
				return "Error: shutdown command requires history context.";
			}
			return handleShutdownCommand(args.join(" "), terminalState, addToHistory);
		case "ps":
			output = handlePsCommand(args);
			break;
		case "top":
			output = handleTopCommand(args);
			break;
		case "man":
			output = handleManCommand(args);
			break;
		case "tetris":
			return handleTetrisCommand(args, terminalState);
		case "snake":
			return handleSnakeCommand(args, terminalState);
		case "alias":
			return handleAliasCommand(args);
		case "unalias":
			return handleUnaliasCommand(args);
		case "theme":
			return handleThemeCommand(args);
		case "echo":
			output = handleEchoCommand(args);
			break;
		case "date":
			output = handleDateCommand();
			break;
		case "time":
			output = handleTimeCommand();
			break;
		case "uptime":
			output = handleUptimeCommand();
			break;
		case "music":
			return handleMusicCommand(args, getMusicPlayerState || (() => null));
		default:
			output = `Error: command not found: ${command}\nType 'help' to see available commands.`;
	}

	return pipeFilters.length > 0 ? applyPipeFilters(output, pipeFilters) : output;
};

/**
 * Handle keyboard shortcuts
 */
export const handleKeyboardShortcuts = (
	e: KeyboardEvent,
	isMac: boolean,
	navigate: (path: string) => void,
	isOpen: boolean,
	onClose: () => void
): boolean => {
	// Handle escape key
	if (e.key === "Escape") {
		onClose();
		return true;
	}

	// Global shortcuts (work when terminal is closed)
	if (!isOpen) {
		const isCorrectCombo = isMac
			? e.ctrlKey && e.metaKey
			: e.ctrlKey && e.altKey;

		if (isCorrectCombo) {
			switch (e.key.toLowerCase()) {
				case "k":
					e.preventDefault();
					onClose(); // This will be handled by the parent to open the terminal
					return true;
				case "h":
					e.preventDefault();
					navigate("/");
					return true;
				case "a":
					e.preventDefault();
					navigate("/about");
					return true;
				case "p":
					e.preventDefault();
					navigate("/projects");
					return true;
				case "b":
					e.preventDefault();
					navigate("/blog");
					return true;
				case "c":
					e.preventDefault();
					navigate("/contact");
					return true;
			}
		}
	}

	return false;
};
