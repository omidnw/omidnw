import {
	TerminalState,
	FileSystemNode,
} from "@/components/CyberpunkTerminal/types";
import { getCurrentDirectory } from "@/components/CyberpunkTerminal/utils";

// Store previous directory for cd - command
let previousDirectory: string[] = [];

/**
 * Resolve a path string against a current path
 */
export const resolveTerminalPath = (
	currentPath: string[],
	relativePath: string
): string[] => {
	const current = [...currentPath];
	const parts = relativePath.split("/").filter(Boolean);

	for (const part of parts) {
		if (part === "..") {
			if (current.length > 0) {
				current.pop();
			}
		} else if (part !== ".") {
			current.push(part);
		}
	}
	return current;
};

/**
 * Display cd command help
 */
const displayCdHelp = (): string => {
	return `cd: cd [-L|-P] [dir]
    Change the current directory to DIR.  The default DIR is the value of the
    HOME variable.
    
    The variable CDPATH defines the search path for the directory containing
    DIR.  Alternative directory names in CDPATH are separated by a colon (:).
    A null directory name is the same as the current directory.  If DIR begins
    with a slash (/), then CDPATH is not used.
    
    If the directory is not found, and the shell option 'cdable_vars' is set,
    the word is assumed to be a variable name.  If that variable has a value,
    its value is used for DIR.
    
    Options:
        -L      force symbolic links to be followed
        -P      use the physical directory structure without following symbolic
                links
    
    The default is to follow symbolic links, as if '-L' were specified.
    
    Exit Status:
    Returns 0 if the directory is changed; non-zero otherwise.
    
    Examples:
        cd                 # change to home directory
        cd ~               # change to home directory
        cd /               # change to root directory
        cd ..              # change to parent directory
        cd -               # change to previous directory
        cd /projects       # change to projects directory
        cd ../blog         # change to blog directory relative to current`;
};

/**
 * Handle cd command navigation
 */
export const handleCdCommand = (
	args: string[],
	navigate: (path: string) => void,
	terminalState: TerminalState,
	setTerminalState: (state: TerminalState) => void,
	fileSystem: Record<string, FileSystemNode>
): string => {
	// Parse arguments
	let followSymlinks = true; // -L is default
	let targetPath = "";

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "-h" || arg === "--help") {
			return displayCdHelp();
		} else if (arg === "-L") {
			followSymlinks = true;
		} else if (arg === "-P") {
			followSymlinks = false;
		} else if (arg.startsWith("-")) {
			return `cd: ${arg}: invalid option\ncd: usage: cd [-L|-P] [dir]`;
		} else {
			// First non-option argument is the target path
			targetPath = arg;
			break;
		}
	}

	// Store current directory as previous before changing
	previousDirectory = [...(terminalState.currentPath || [])];

	// Handle cd with no argument (go to home/root)
	if (!targetPath) {
		setTerminalState({
			...terminalState,
			currentPath: [],
		});
		navigate("/");
		return "";
	}

	// Handle cd ~ (home directory = root)
	if (targetPath === "~") {
		setTerminalState({
			...terminalState,
			currentPath: [],
		});
		navigate("/");
		return "";
	}

	// Handle cd - (previous directory)
	if (targetPath === "-") {
		if (
			previousDirectory.length === 0 &&
			terminalState.currentPath?.length === 0
		) {
			return "cd: OLDPWD not set";
		}

		const oldPath = [...previousDirectory];
		const currentPath = [...(terminalState.currentPath || [])];

		// Set the previous directory to current before changing
		previousDirectory = currentPath;

		setTerminalState({
			...terminalState,
			currentPath: oldPath,
		});

		const urlPath = oldPath.length === 0 ? "/" : "/" + oldPath.join("/");
		navigate(urlPath);

		// Print the directory we changed to (like real cd -)
		const dirPath = oldPath.length === 0 ? "/" : "/" + oldPath.join("/");
		return dirPath;
	}

	// Handle cd ~username (for now, just treat as invalid since we don't have users)
	if (targetPath.startsWith("~") && targetPath.length > 1) {
		const username = targetPath.substring(1);
		return `cd: ${username}: No such user`;
	}

	// Handle special navigation paths that navigate the actual website
	if (
		targetPath.startsWith("/") &&
		!targetPath.includes("blog") &&
		!targetPath.includes("projects")
	) {
		switch (targetPath) {
			case "/":
			case "/home":
				setTerminalState({
					...terminalState,
					currentPath: [],
				});
				navigate("/");
				return "";
			case "/about":
				navigate("/about");
				return "";
			case "/projects":
				navigate("/projects");
				return "";
			case "/blog":
				navigate("/blog");
				return "";
			case "/contact":
				navigate("/contact");
				return "";
			case "/terminal":
				navigate("/terminal");
				return "";
		}
	}

	// Handle file system navigation
	const newPath = resolveTerminalPath(
		terminalState.currentPath || [],
		targetPath
	);

	// Handle root directory case
	if (newPath.length === 0) {
		setTerminalState({
			...terminalState,
			currentPath: [],
		});
		navigate("/");
		return "";
	}

	// Check if the path exists in file system
	let currentNode: FileSystemNode | undefined = fileSystem[newPath[0]];
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
		return `cd: ${targetPath}: Not a directory`;
	}

	// If path doesn't exist
	if (!currentNode) {
		return `cd: ${targetPath}: No such file or directory`;
	}

	// Update terminal state
	setTerminalState({
		...terminalState,
		currentPath: newPath,
	});

	// Construct and navigate to the corresponding URL for file system paths
	const urlPath = "/" + newPath.join("/");
	navigate(urlPath);

	return "";
};
