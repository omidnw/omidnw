import {
	TerminalState,
	FileSystemNode,
} from "@/components/CyberpunkTerminal/types";
import { getCurrentDirectory } from "@/components/CyberpunkTerminal/utils";

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
 * Handle cd command navigation
 */
export const handleCdCommand = (
	path: string,
	navigate: (path: string) => void,
	terminalState: TerminalState,
	setTerminalState: (state: TerminalState) => void,
	fileSystem: Record<string, FileSystemNode> // Pass fileSystem here
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
	const newPath = resolveTerminalPath(terminalState.currentPath || [], path);

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
		if (currentNode.content === "blog") {
			return `cd: ${newPath[newPath.length - 1]}: Not a directory\nUse 'read ${
				newPath[newPath.length - 1]
			}' to view this blog post.`;
		} else if (currentNode.content === "project") {
			return `cd: ${newPath[newPath.length - 1]}: Not a directory\nUse 'read ${
				newPath[newPath.length - 1]
			}' to view this project.`;
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
