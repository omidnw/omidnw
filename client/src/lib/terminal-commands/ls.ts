import {
	TerminalState,
	FileSystemNode,
} from "@/components/CyberpunkTerminal/types";
import { getCurrentDirectory } from "@/components/CyberpunkTerminal/utils";
import { resolveTerminalPath } from "./cd"; // Using resolveTerminalPath for resolving the input path

/**
 * Generate ls output based on current directory or a specified path
 */
export const generateLsOutput = (
	terminalState: TerminalState,
	pathArg?: string // Add optional path argument
): string => {
	const { fileSystem, currentPath } = terminalState;

	let targetPathArray: string[];

	// Resolve the target path based on the argument
	if (pathArg && pathArg.trim() !== "") {
		targetPathArray = resolveTerminalPath(currentPath || [], pathArg);
	} else {
		// If no argument, list the current directory
		targetPathArray = currentPath || [];
	}

	// Handle root directory listing
	if (targetPathArray.length === 0) {
		const rootItems = Object.values(fileSystem);
		rootItems.sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
		);
		const rootOutputLines = rootItems.map((item) => {
			const permissions =
				item.type === "directory" ? "drwxr-xr-x" : "-rw-r--r--";
			const typeIndicator = item.type === "directory" ? "/" : "";
			const size = "  64"; // Placeholder size
			const date = "Jun 2025"; // Placeholder date
			return `${permissions}  1 user  staff${size} ${date} ${item.name}${typeIndicator}`;
		});
		return rootOutputLines.join("\n");
	}

	// Traverse the file system to find the target directory node
	let targetDirNode: FileSystemNode | undefined =
		fileSystem[targetPathArray[0]];
	if (!targetDirNode) {
		return `ls: cannot access '/${targetPathArray.join(
			"/"
		)}': No such file or directory`;
	}

	for (let i = 1; i < targetPathArray.length; i++) {
		if (targetDirNode?.children) {
			targetDirNode = targetDirNode.children[targetPathArray[i]];
			if (!targetDirNode) {
				return `ls: cannot access '/${targetPathArray
					.slice(0, i + 1)
					.join("/")}': No such file or directory`;
			}
		} else {
			// If an intermediate node is not a directory
			return `ls: cannot access '/${targetPathArray
				.slice(0, i + 1)
				.join("/")}': Not a directory`;
		}
	}

	// Check if the final node is a directory and has children (if it's a directory)
	if (targetDirNode.type !== "directory") {
		// If the target is a file, just list the file itself (like `ls file.txt`)
		const permissions =
			targetPathArray.length > 1 &&
			targetPathArray[0] === "projects" &&
			targetDirNode.content === "project"
				? "-rwxr-xr-x"
				: "-rw-r--r--"; // Executable for projects
		const size = "  64"; // Placeholder size
		const date = "Jun 2025"; // Placeholder date
		return `${permissions}  1 user  staff${size} ${date} ${targetDirNode.name}`;
	}

	// If it's a directory but has no children property (shouldn't happen with current structure but good check)
	if (!targetDirNode.children) {
		return `ls: cannot access '/${targetPathArray.join("/")}': Not a directory`;
	}

	const items = Object.values(targetDirNode.children);

	if (items.length === 0) {
		return ""; // Empty directory
	}

	// Sort items alphabetically (case-insensitive)
	items.sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
	);

	// Format output
	const outputLines = items.map((item) => {
		const permissions =
			item.type === "directory"
				? "drwxr-xr-x"
				: targetPathArray.length > 0 &&
				  targetPathArray[0] === "projects" &&
				  item.content === "project"
				? "-rwxr-xr-x"
				: "-rw-r--r--"; // Executable for projects
		const typeIndicator = item.type === "directory" ? "/" : "";
		const size = "  64"; // Placeholder size
		const date = "Jun 2025"; // Placeholder date
		return `${permissions}  1 user  staff${size} ${date} ${item.name}${typeIndicator}`;
	});

	return outputLines.join("\n");
};
