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

// File system data storage
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
├─────────────────────────────────────────────────────────────┤
│  UTILITY COMMANDS                                           │
├─────────────────────────────────────────────────────────────┤
│  whoami                 → Show current user info           │
│  status                 → Show connection status           │
│  clear                  → Clear terminal                   │
│  exit, quit             → Close terminal                   │
│  reload                 → Reload the application           │
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
	whoami: handleWhoamiCommand(isMac),
	status: handleStatusCommand(),
	clear: "Clear terminal screen",
	exit: "Exit terminal",
	quit: "Exit terminal",
	reload: "Reload the application",
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
	onOpenProject?: (projectId: string) => void
): string => {
	const trimmedCmd = cmd.trim();

	// Check if system is in rescue mode
	if (isSystemInRescueMode()) {
		const [command, ...args] = trimmedCmd.split(" ");
		if (command === "systemctl" && args.join(" ") === "start NetworkManager") {
			return handleSystemctlCommand(args.join(" "), terminalState);
		} else {
			return `🚨 RESCUE MODE ACTIVE 🚨
❌ Network connectivity lost. System is in emergency recovery mode.
🔧 Only 'systemctl start NetworkManager' is allowed to restore connectivity.
💡 Run: systemctl start NetworkManager`;
		}
	}

	// Handle ./ command for executing files (like project demos)
	if (trimmedCmd.startsWith("./")) {
		return handleExecuteCommand(trimmedCmd, terminalState, projects);
	}

	// Handle ../ command as implicit cd command (like in real terminals)
	if (trimmedCmd.startsWith("../")) {
		return handleCdCommand(
			trimmedCmd,
			navigate,
			terminalState,
			setTerminalState,
			terminalState.fileSystem
		);
	}

	const [command, ...args] = trimmedCmd.split(" ");

	switch (command.toLowerCase()) {
		case "help":
			return getCommands(isMac).help;
		case "ls":
			return generateLsOutput(terminalState, args.join(" "));
		case "cd":
			return handleCdCommand(
				args.join(" "),
				navigate,
				terminalState,
				setTerminalState,
				terminalState.fileSystem
			);
		case "pwd":
			return getCurrentDirectory(terminalState.currentPath || []);
		case "whoami":
			return handleWhoamiCommand(isMac);
		case "status":
			return handleStatusCommand();
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
			return handleSystemctlCommand(args.join(" "), terminalState);
		default:
			return `Error: command not found: ${command}\nType 'help' to see available commands.`;
	}
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
