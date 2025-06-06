import {
	TerminalState,
	TerminalCommands,
	FileSystemNode,
} from "@/components/CyberpunkTerminal/types";
import { resolveTerminalPath } from "./cd"; // Assuming resolveTerminalPath is useful for path resolution
import { getCommands } from "@/components/CyberpunkTerminal/commands"; // To get the list of available commands

/**
 * Provides tab completions for terminal input.
 *
 * @param input The current input string in the terminal.
 * @param terminalState The current state of the terminal.
 * @param isMac Whether the user is on a Mac (for command shortcuts, though not directly used for completion logic itself).
 * @returns An array of possible completion strings.
 */
export const getTabCompletions = (
	input: string,
	terminalState: TerminalState,
	isMac: boolean // Needed for getting commands
): string[] => {
	const trimmedInput = input.trimStart(); // Use trimStart to handle commands followed by a space
	const { fileSystem, currentPath } = terminalState;

	console.log("🚀 getTabCompletions called:", {
		input,
		trimmedInput,
		currentPath,
		fileSystemKeys: Object.keys(fileSystem),
	});

	const allCommands = Object.keys(getCommands(isMac));
	console.log("📝 Available commands for tab completion:", allCommands);

	// Handle special case for ./ command (which doesn't have a space separator) - CHECK THIS FIRST!
	if (trimmedInput.startsWith("./")) {
		console.log("📍 Detected ./ command");
		const command = "./";
		const partialArg = trimmedInput.substring(2); // Everything after ./

		console.log("🔍 Tab completion for ./ command:", {
			trimmedInput,
			partialArg,
			currentPath,
			fileSystemKeys: Object.keys(fileSystem),
		});

		// This command only works in /projects and completes project names (executable files)
		if (currentPath.length === 1 && currentPath[0] === "projects") {
			let currentNode: Record<string, FileSystemNode> | undefined = fileSystem;
			let traversalSuccessful = true;

			// Traverse to the /projects directory
			for (const segment of currentPath) {
				if (currentNode && currentNode[segment]?.children) {
					currentNode = currentNode[segment].children as Record<
						string,
						FileSystemNode
					>;
				} else {
					traversalSuccessful = false;
					break;
				}
			}

			console.log("🗂️ Projects directory content:", {
				traversalSuccessful,
				currentNode: currentNode ? Object.keys(currentNode) : null,
				items: currentNode ? Object.values(currentNode) : null,
			});

			if (!traversalSuccessful || !currentNode) {
				console.log("❌ Failed to traverse to projects directory");
				return [];
			}

			// Get all projects that match the partial name
			const items = Object.values(currentNode);
			const filteredItems = items.filter((item) => {
				const matchesPrefix = item.name
					.toLowerCase()
					.startsWith(partialArg.toLowerCase());
				const isProject = item.type === "file" && item.content === "project";
				console.log("🔎 Checking item:", {
					name: item.name,
					type: item.type,
					content: item.content,
					matchesPrefix,
					isProject,
				});
				return matchesPrefix && isProject;
			});

			console.log(
				"✅ Filtered items:",
				filteredItems.map((item) => item.name)
			);
			return filteredItems.map((item) => `./${item.name}`);
		} else {
			console.log("❌ Not in /projects directory:", { currentPath });
			return []; // './' command only works in /projects
		}
	}

	// Handle special case for ../ command (parent directory navigation)
	if (trimmedInput.startsWith("../")) {
		console.log("📍 Detected ../ command");
		const partialArg = trimmedInput.substring(3); // Everything after ../

		console.log("🔍 Tab completion for ../ command:", {
			trimmedInput,
			partialArg,
			currentPath,
			fileSystemKeys: Object.keys(fileSystem),
		});

		// Only work if we're not already at root
		if (currentPath.length > 0) {
			// Get parent directory content (root level)
			const parentNode = fileSystem;
			const items = Object.values(parentNode);

			// Filter directories that match the partial name
			const filteredItems = items.filter((item) => {
				const matchesPrefix = item.name
					.toLowerCase()
					.startsWith(partialArg.toLowerCase());
				const isDirectory = item.type === "directory";
				console.log("🔎 Checking parent item:", {
					name: item.name,
					type: item.type,
					matchesPrefix,
					isDirectory,
				});
				return matchesPrefix && isDirectory;
			});

			console.log(
				"✅ Filtered parent items:",
				filteredItems.map((item) => item.name)
			);
			return filteredItems.map((item) => `../${item.name}/`);
		} else {
			console.log("❌ Already at root directory:", { currentPath });
			return []; // '../' doesn't work at root
		}
	}

	// If input is empty or starts with a command but has no space, suggest commands
	if (trimmedInput === "" || !trimmedInput.includes(" ")) {
		return allCommands.filter((cmd) =>
			cmd.startsWith(trimmedInput.toLowerCase())
		); // Case-insensitive command completion
	}

	// If input contains a space, it's likely a command followed by arguments (a path or filename)
	const parts = trimmedInput.split(" ");
	const command = parts[0].toLowerCase();
	const partialArg = parts.slice(1).join(" ");

	let targetDirectoryContent: Record<string, FileSystemNode> | undefined; // The content (children) of the directory to complete from
	let prefixToMatch = "";
	let baseCompletionPath = ""; // The path part before the item being completed
	let traversalSuccessful = true; // Declare at function level

	// Handle systemctl command completion
	if (command === "systemctl") {
		const subcommands = ["status", "start", "stop", "enable", "disable"];
		const services = [
			"neural-matrix",
			"cyberpunk-terminal",
			"portfolio-api",
			"quantum-encryption",
			"firewall-protocols",
			"NetworkManager",
		];

		// If we only have one argument (the subcommand)
		if (parts.length === 2) {
			return subcommands
				.filter((sub) => sub.toLowerCase().startsWith(partialArg.toLowerCase()))
				.map((sub) => `systemctl ${sub}`);
		}

		// If we have two arguments (subcommand + partial service name)
		if (parts.length === 3) {
			const subcommand = parts[1].toLowerCase();
			const partialService = parts[2];

			// Only complete service names for commands that need them
			if (
				["status", "start", "stop", "enable", "disable"].includes(subcommand)
			) {
				return services
					.filter((service) =>
						service.toLowerCase().startsWith(partialService.toLowerCase())
					)
					.map((service) => `systemctl ${subcommand} ${service}`);
			}
		}

		return [];
	}

	// Determine the target directory content and prefix based on the command
	if (command === "cd" || command === "read" || command === "ls") {
		const resolvedInputPath = resolveTerminalPath(
			currentPath || [],
			partialArg
		);

		// Determine the directory to traverse to find completions.
		// If the partial argument ends with / or is ./ or ../, traverse to the resolved path itself.
		// Otherwise, traverse to the parent directory of the resolved path.
		const isDirectoryInput =
			partialArg.endsWith("/") || partialArg === "." || partialArg === "../";
		const pathSegmentsToTraverse =
			isDirectoryInput || resolvedInputPath.length === 0
				? resolvedInputPath
				: resolvedInputPath.slice(0, -1);

		// Traverse to the directory that contains the item(s) for completion
		let currentNode: Record<string, FileSystemNode> | undefined = fileSystem;
		traversalSuccessful = true;

		if (pathSegmentsToTraverse.length === 0) {
			// Target is root
			targetDirectoryContent = fileSystem;
		} else {
			for (const segment of pathSegmentsToTraverse) {
				if (currentNode && currentNode[segment]?.children) {
					currentNode = currentNode[segment].children as Record<
						string,
						FileSystemNode
					>;
				} else {
					traversalSuccessful = false;
					break;
				}
			}
			targetDirectoryContent = traversalSuccessful ? currentNode : undefined;
		}

		// Determine the prefix to match against. This is the last segment of the resolved input path if not a directory input.
		prefixToMatch =
			isDirectoryInput || resolvedInputPath.length === 0
				? ""
				: resolvedInputPath[resolvedInputPath.length - 1];

		// Determine the base path for completion (the part before the suggested item)
		baseCompletionPath = pathSegmentsToTraverse.join("/");
		if (
			baseCompletionPath &&
			!baseCompletionPath.endsWith("/") &&
			partialArg !== "../"
		)
			baseCompletionPath += "/";
		if (partialArg.startsWith("/") && !baseCompletionPath.startsWith("/"))
			baseCompletionPath = "/" + baseCompletionPath;
		// Special case: if partialArg is just a name in the current directory, base path is empty
		if (
			!partialArg.includes("/") &&
			!partialArg.startsWith(".") &&
			pathSegmentsToTraverse.length === 0
		)
			baseCompletionPath = ""; // Check if completing in root
		// Special case: for cd ../, the base should be ../
		if (command === "cd" && partialArg === "../") baseCompletionPath = "../";
		// Special case: for cd ./, the base should be ./ or empty if at root
		if (command === "cd" && partialArg === "./")
			baseCompletionPath = currentPath.length === 0 ? "" : "./";
	} else {
		// Command does not support file/directory completion
		return [];
	}

	// If the target directory content is not available or traversal failed, return no completions
	if (!targetDirectoryContent || !traversalSuccessful) {
		return [];
	}

	// Get items to filter: values of the target directory content
	const items = Object.values(targetDirectoryContent);

	// Filter items based on the prefix and command type
	const filteredItems = items.filter((item) => {
		const matchesPrefix = item.name
			.toLowerCase()
			.startsWith(prefixToMatch.toLowerCase());

		if (!matchesPrefix) return false;

		// Additional filtering based on command type
		if (command === "cd") {
			// For cd, only suggest directories (. and .. are also valid directories)
			return (
				item.type === "directory" || item.name === "." || item.name === ".."
			);
		} else if (command === "read") {
			// For read, only suggest files
			return item.type === "file";
		} else if (command === "ls") {
			// For ls, suggest both directories and files
			return true; // Already filtered by prefix
		}

		return false; // Should not reach here for handled commands
	});

	// Map filtered items to completion strings, constructing the full command + completed argument
	return filteredItems
		.map((item) => {
			if (command === "cd") {
				// Construct the completed path: base + item.name + /
				let completedPath = baseCompletionPath + item.name;
				if (
					item.type === "directory" &&
					item.name !== "." &&
					item.name !== ".."
				)
					completedPath += "/";
				// Add leading / if baseCompletionPath is empty and it's an absolute path completion
				if (
					baseCompletionPath === "" &&
					!partialArg.startsWith(".") &&
					item.name !== "." &&
					item.name !== ".."
				)
					completedPath = "/" + completedPath; // Handle root completion
				return `${command} ${completedPath}`; // No trim needed with refined baseCompletionPath
			} else if (command === "read") {
				// Construct the completed path
				let completedPath = baseCompletionPath + item.name;
				// Add leading / if baseCompletionPath is empty and it's an absolute path completion
				if (baseCompletionPath === "" && !partialArg.startsWith("."))
					completedPath = "/" + completedPath; // Handle root completion
				return `${command} ${completedPath} `;
			} else if (command === "ls") {
				const completionSuffix = item.type === "directory" ? "/" : "";
				// Construct the completed path
				let completedPath = baseCompletionPath + item.name + completionSuffix;
				// Add leading / if baseCompletionPath is empty and it's an absolute path completion
				if (
					baseCompletionPath === "" &&
					!partialArg.startsWith(".") &&
					item.type === "directory"
				)
					completedPath = "/" + completedPath; // Handle root completion
				return `${command} ${completedPath}`; // No trim needed with refined baseCompletionPath
			}

			return null; // Should not reach here
		})
		.filter(Boolean) as string[]; // Remove null entries
};
