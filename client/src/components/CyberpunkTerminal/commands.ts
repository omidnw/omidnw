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
		Object.keys(projects).forEach((projectId) => {
			fileSystem.projects.children![projectId] = {
				name: projectId,
				type: "file",
				content: "project",
			};
		});
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
	whoami: `┌─────────────────────────────────────────────────────────────┐
│  USER PROFILE                                               │
├─────────────────────────────────────────────────────────────┤
│  Name: Omid Reza Keshtkar                                  │
│  Role: Full-Stack Developer                                │
│  Location: Dubai, UAE                                      │
│  GitHub: github.com/omidnw                                 │
│  LinkedIn: linkedin.com/in/omid-reza-keshtkar             │
│  X: x.com/omidrezakeshtka                                  │
└─────────────────────────────────────────────────────────────┘`,
	getStatus: () => {
		const timeInfo = getTimeInfo();
		const timeDiffText = getTimeDifferenceText(timeInfo.timeDiff);
		const userTimezoneDisplay = getUserTimezoneDisplay(timeInfo.userTimezone);

		return `╔═══════════════════════════════════════════════════════════════╗
║  CONNECTION STATUS MATRIX v2.077                              ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🟢 NEURAL LINK STATUS: ONLINE                               ║
║  📡 AVAILABILITY: READY FOR NEW PROJECTS                     ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │  TIME SYNCHRONIZATION MATRIX                            │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │  DUBAI_TIME (PRIMARY):  ${formatTime(timeInfo.uaeTime).padEnd(
			8
		)} UTC+4       │ ║
║  │  YOUR_TIME (CLIENT):    ${formatTime(timeInfo.now).padEnd(
			8
		)} ${userTimezoneDisplay} │ ║
║  │  SYNC_DELTA:            ${timeDiffText.padEnd(18)} │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │  SYSTEM PERFORMANCE METRICS                            │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │  RESPONSE_TIME:         24-48 HOURS                    │ ║
║  │  DEV_STATUS:            ACTIVE                          │ ║
║  │  UPTIME:                99.9%                           │ ║
║  │  NEURAL_BANDWIDTH:      HIGH                            │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │  CONTACT PROTOCOLS                                      │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │  EMAIL:                 ACTIVE                          │ ║
║  │  LINKEDIN:              MONITORING                      │ ║
║  │  GITHUB:                ACTIVE                          │ ║
║  │  DISCORD:               STANDBY                         │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  Last updated: ${new Date()
			.toLocaleString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
			.padEnd(19)} ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`;
	},
});

/**
 * Generate ls output based on current directory
 */
export const generateLsOutput = (terminalState: TerminalState): string => {
	const { fileSystem, currentPath } = terminalState;

	// If at root level
	if (!currentPath || currentPath.length === 0) {
		return `drwxr-xr-x  2 user  staff   64 Jun 2025 home/
drwxr-xr-x  2 user  staff   64 Jun 2025 about/
drwxr-xr-x  2 user  staff   64 Jun 2025 projects/
drwxr-xr-x  2 user  staff   64 Jun 2025 blog/
drwxr-xr-x  2 user  staff   64 Jun 2025 contact/
drwxr-xr-x  2 user  staff   64 Jun 2025 terminal/`;
	}

	// Navigate to current directory in file system
	let currentNode = fileSystem[currentPath[0]];
	for (let i = 1; i < currentPath.length; i++) {
		if (currentNode?.children) {
			currentNode = currentNode.children[currentPath[i]];
		} else {
			return `ls: cannot access '${getCurrentDirectory(
				currentPath
			)}': No such file or directory`;
		}
	}

	if (!currentNode) {
		return `ls: cannot access '${getCurrentDirectory(
			currentPath
		)}': No such file or directory`;
	}

	if (currentNode.type === "file") {
		return currentNode.name;
	}

	// List directory contents
	if (currentNode.children) {
		const entries = Object.values(currentNode.children);
		if (entries.length === 0) {
			return "Directory is empty.";
		}

		return entries
			.map((entry) => {
				const type = entry.type === "directory" ? "d" : "-";
				const permissions =
					entry.type === "directory" ? "rwxr-xr-x" : "rw-r--r--";
				const suffix = entry.type === "directory" ? "/" : "";
				return `${type}${permissions}  1 user  staff   64 Jun 2025 ${entry.name}${suffix}`;
			})
			.join("\n");
	}

	return "Directory is empty.";
};

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
	const [command, ...args] = cmd.trim().split(" ");

	switch (command.toLowerCase()) {
		case "help":
			return getCommands(isMac).help;
		case "ls":
			return generateLsOutput(terminalState);
		case "cd":
			return handleCdCommand(
				args.join(" "),
				navigate,
				terminalState,
				setTerminalState
			);
		case "pwd":
			return getCurrentDirectory(terminalState.currentPath || []);
		case "whoami":
			return getCommands(isMac).whoami;
		case "status":
			return getCommands(isMac).getStatus();
		case "clear":
			return "CLEAR_TERMINAL";
		case "exit":
		case "quit":
			return "EXIT_TERMINAL";
		case "read":
			return handleReadCommand(
				args.join(" "),
				terminalState,
				onOpenBlogPost,
				onOpenProject
			);
		case "reload":
			window.location.reload();
			return "Reloading matrix...";
		default:
			return `Error: command not found: ${command}\nType 'help' to see available commands.`;
	}
};

/**
 * Handle cd command navigation
 */
const handleCdCommand = (
	path: string,
	navigate: (path: string) => void,
	terminalState: TerminalState,
	setTerminalState: (state: TerminalState) => void
): string => {
	if (!path.trim()) {
		// cd with no argument goes to root
		setTerminalState({
			...terminalState,
			currentPath: [],
		});
		navigate("/");
		return "Changed to root directory";
	}

	// Handle cd ~ (home directory = root)
	if (path.trim() === "~") {
		setTerminalState({
			...terminalState,
			currentPath: [],
		});
		navigate("/");
		return "Changed to home directory (/)";
	}

	// Handle special navigation paths that navigate the actual website
	if (
		path.startsWith("/") &&
		!path.includes("blog") &&
		!path.includes("projects")
	) {
		switch (path) {
			case "/":
			case "/home":
				navigate("/");
				return "Navigating to Home...";
			case "/about":
				navigate("/about");
				return "Navigating to About...";
			case "/projects":
				navigate("/projects");
				return "Navigating to Projects...";
			case "/blog":
				navigate("/blog");
				return "Navigating to Blog...";
			case "/contact":
				navigate("/contact");
				return "Navigating to Contact...";
			case "/terminal":
				navigate("/terminal");
				return "Opening Terminal Interface...";
		}
	}

	// Handle file system navigation
	const newPath = resolvePath(terminalState.currentPath || [], path);

	// Handle root directory case
	if (newPath.length === 0) {
		setTerminalState({
			...terminalState,
			currentPath: [],
		});
		navigate("/");
		return "Changed directory to /";
	}

	// Check if the path exists in file system
	let currentNode: FileSystemNode | undefined =
		terminalState.fileSystem[newPath[0]];
	for (let i = 1; i < newPath.length; i++) {
		if (currentNode?.children) {
			currentNode = currentNode.children[newPath[i]];
		} else {
			currentNode = undefined;
			break;
		}
	}

	// If trying to cd into a file, show error
	if (currentNode && currentNode.type === "file") {
		if (currentNode.content === "blog") {
			return `cd: ${newPath[newPath.length - 1]}: Not a directory
Use 'read ${newPath[newPath.length - 1]}' to view this blog post.`;
		} else if (currentNode.content === "project") {
			return `cd: ${newPath[newPath.length - 1]}: Not a directory
Use 'read ${newPath[newPath.length - 1]}' to view this project.`;
		}
		return `cd: ${newPath[newPath.length - 1]}: Not a directory`;
	}

	// If path doesn't exist
	if (!currentNode) {
		return `cd: ${path}: No such file or directory`;
	}

	// Update terminal state
	setTerminalState({
		...terminalState,
		currentPath: newPath,
	});

	// Construct and navigate to the corresponding URL for file system paths
	const urlPath = "/" + newPath.join("/");
	navigate(urlPath);

	return `Changed directory to ${getCurrentDirectory(newPath)}`;
};

/**
 * Handle read command to open blog posts and projects
 */
const handleReadCommand = (
	filename: string,
	terminalState: TerminalState,
	onOpenBlogPost?: (blogId: string) => void,
	onOpenProject?: (projectId: string) => void
): string => {
	if (!filename.trim()) {
		return `read: missing file argument
Usage: read <filename>`;
	}

	const { currentPath, fileSystem } = terminalState;

	// Check if we're in root directory
	if (!currentPath || currentPath.length === 0) {
		return `read: cannot access '${filename}': Not in a readable directory
Use 'cd blog/' or 'cd projects/' to navigate to content directories first.`;
	}

	// Find the file in current directory
	let currentNode = fileSystem[currentPath[0]];
	for (let i = 1; i < currentPath.length; i++) {
		if (currentNode?.children) {
			currentNode = currentNode.children[currentPath[i]];
		} else {
			return `read: cannot access '${filename}': No such file or directory`;
		}
	}

	if (!currentNode?.children) {
		return `read: cannot access '${filename}': Not in a readable directory`;
	}

	const file = currentNode.children[filename];
	if (!file) {
		return `read: cannot access '${filename}': No such file or directory`;
	}

	if (file.type !== "file") {
		return `read: '${filename}' is a directory`;
	}

	// Open the appropriate viewer based on file type
	if (file.content === "blog") {
		if (onOpenBlogPost) {
			onOpenBlogPost(filename);
			return `Opening blog post: ${blogPosts[filename]?.title || filename}...`;
		}
		return `Error: Blog post viewer not available`;
	} else if (file.content === "project") {
		if (onOpenProject) {
			onOpenProject(filename);
			return `Opening project: ${projects[filename]?.title || filename}...`;
		}
		return `Error: Project viewer not available`;
	}

	return `read: '${filename}' file type not supported`;
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
