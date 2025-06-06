import {
	TerminalState,
	FileSystemNode,
} from "@/components/CyberpunkTerminal/types";
import { getCurrentDirectory } from "@/components/CyberpunkTerminal/utils";
import { resolveTerminalPath } from "./cd";

interface LsOptions {
	long: boolean; // -l
	all: boolean; // -a
	human: boolean; // -h
	reverse: boolean; // -r
	timeSort: boolean; // -t
	recursive: boolean; // -R
	sizeSort: boolean; // -S
	oneColumn: boolean; // -1
	directory: boolean; // -d
	classify: boolean; // -F
	help: boolean; // --help
}

/**
 * Display ls command help
 */
const displayLsHelp = (): string => {
	return `Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not list implied . and ..
  -d, --directory            list directories themselves, not their contents
  -F, --classify             append indicator (one of */=>@|) to entries
  -h, --human-readable       with -l, print sizes like 1K 234M 2G etc.
  -l                         use a long listing format
  -r, --reverse              reverse order while sorting
  -R, --recursive            list subdirectories recursively
  -S                         sort by file size, largest first
  -t                         sort by modification time, newest first
  -1                         list one file per line
      --help                 display this help and exit

Exit status:
 0  if OK,
 1  if minor problems (e.g., cannot access subdirectory),
 2  if serious trouble (e.g., cannot access command-line argument).

Examples:
  ls                         # list current directory
  ls -l                      # long format listing
  ls -la                     # long format with hidden files
  ls -lh                     # long format with human readable sizes
  ls /projects               # list specific directory
  ls -R                      # recursive listing`;
};

/**
 * Parse ls command arguments
 */
const parseLsOptions = (
	args: string[]
): { options: LsOptions; paths: string[]; error?: string } => {
	const options: LsOptions = {
		long: false,
		all: false,
		human: false,
		reverse: false,
		timeSort: false,
		recursive: false,
		sizeSort: false,
		oneColumn: false,
		directory: false,
		classify: false,
		help: false,
	};
	const paths: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg.startsWith("-") && arg !== "-") {
			if (arg === "--help") {
				options.help = true;
			} else if (arg === "--all") {
				options.all = true;
			} else if (arg === "--almost-all") {
				options.all = true; // Simplified
			} else if (arg === "--directory") {
				options.directory = true;
			} else if (arg === "--classify") {
				options.classify = true;
			} else if (arg === "--human-readable") {
				options.human = true;
			} else if (arg === "--reverse") {
				options.reverse = true;
			} else if (arg === "--recursive") {
				options.recursive = true;
			} else if (arg.startsWith("--")) {
				return { options, paths, error: `ls: unrecognized option '${arg}'` };
			} else {
				// Handle combined short options like -la, -lh
				for (let j = 1; j < arg.length; j++) {
					const opt = arg[j];
					switch (opt) {
						case "l":
							options.long = true;
							break;
						case "a":
							options.all = true;
							break;
						case "h":
							options.human = true;
							break;
						case "r":
							options.reverse = true;
							break;
						case "t":
							options.timeSort = true;
							break;
						case "R":
							options.recursive = true;
							break;
						case "S":
							options.sizeSort = true;
							break;
						case "1":
							options.oneColumn = true;
							break;
						case "d":
							options.directory = true;
							break;
						case "F":
							options.classify = true;
							break;
						default:
							return {
								options,
								paths,
								error: `ls: invalid option -- '${opt}'`,
							};
					}
				}
			}
		} else {
			paths.push(arg);
		}
	}

	return { options, paths };
};

/**
 * Format file size in human readable format
 */
const formatSize = (bytes: number, human: boolean): string => {
	if (!human) {
		return bytes.toString().padStart(8);
	}

	const units = ["B", "K", "M", "G", "T"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	const formatted = unitIndex === 0 ? size.toString() : size.toFixed(1);
	return `${formatted}${units[unitIndex]}`.padStart(6);
};

/**
 * Get file type indicator for -F option
 */
const getTypeIndicator = (node: FileSystemNode, classify: boolean): string => {
	if (!classify) return "";

	switch (node.type) {
		case "directory":
			return "/";
		case "file":
			// Check if it's executable (projects are executable)
			if (node.content === "project") {
				return "*";
			}
			return "";
		default:
			return "";
	}
};

/**
 * Generate long format listing
 */
const generateLongFormat = (
	items: FileSystemNode[],
	options: LsOptions,
	basePath: string[] = []
): string => {
	const lines: string[] = [];

	for (const item of items) {
		const permissions =
			item.type === "directory"
				? "drwxr-xr-x"
				: basePath.length > 0 &&
				  basePath[0] === "projects" &&
				  item.content === "project"
				? "-rwxr-xr-x"
				: "-rw-r--r--";

		const linkCount = "1";
		const owner = "user";
		const group = "staff";
		const size = formatSize(
			item.type === "directory" ? 512 : 1024,
			options.human
		);
		const date = "Dec 22 12:34"; // Simplified date
		const typeIndicator = getTypeIndicator(item, options.classify);

		lines.push(
			`${permissions} ${linkCount} ${owner} ${group} ${size} ${date} ${item.name}${typeIndicator}`
		);
	}

	return lines.join("\n");
};

/**
 * Generate simple listing
 */
const generateSimpleFormat = (
	items: FileSystemNode[],
	options: LsOptions
): string => {
	if (options.oneColumn) {
		return items
			.map((item) => {
				const typeIndicator = getTypeIndicator(item, options.classify);
				return `${item.name}${typeIndicator}`;
			})
			.join("\n");
	}

	// Multi-column format (simplified to single column for terminal)
	return items
		.map((item) => {
			const typeIndicator = getTypeIndicator(item, options.classify);
			return `${item.name}${typeIndicator}`;
		})
		.join("  ");
};

/**
 * Sort items based on options
 */
const sortItems = (
	items: FileSystemNode[],
	options: LsOptions
): FileSystemNode[] => {
	let sorted = [...items];

	if (options.sizeSort) {
		sorted.sort((a, b) => {
			const sizeA = a.type === "directory" ? 512 : 1024;
			const sizeB = b.type === "directory" ? 512 : 1024;
			return sizeB - sizeA; // Largest first
		});
	} else if (options.timeSort) {
		// For simplicity, just sort by name since we don't have real timestamps
		sorted.sort((a, b) => a.name.localeCompare(b.name));
	} else {
		// Default alphabetical sort
		sorted.sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
		);
	}

	if (options.reverse) {
		sorted.reverse();
	}

	return sorted;
};

/**
 * Generate ls output based on current directory or a specified path
 */
export const generateLsOutput = (
	terminalState: TerminalState,
	args: string[] = []
): string => {
	const { fileSystem, currentPath } = terminalState;

	// Parse arguments
	const parseResult = parseLsOptions(args);
	if (parseResult.error) {
		return parseResult.error + "\nTry 'ls --help' for more information.";
	}

	const { options, paths } = parseResult;

	if (options.help) {
		return displayLsHelp();
	}

	// If no paths specified, use current directory
	const targetPaths = paths.length > 0 ? paths : [""];

	const results: string[] = [];

	for (const pathArg of targetPaths) {
		let targetPathArray: string[];

		// Resolve the target path
		if (pathArg && pathArg.trim() !== "") {
			targetPathArray = resolveTerminalPath(currentPath || [], pathArg);
		} else {
			targetPathArray = currentPath || [];
		}

		// Handle root directory listing
		if (targetPathArray.length === 0) {
			let rootItems = Object.values(fileSystem);

			// Add hidden files if -a option
			if (options.all) {
				rootItems = [
					{ name: ".", type: "directory", content: "" } as FileSystemNode,
					{ name: "..", type: "directory", content: "" } as FileSystemNode,
					...rootItems,
				];
			}

			const sortedItems = sortItems(rootItems, options);

			if (options.long) {
				results.push(generateLongFormat(sortedItems, options));
			} else {
				results.push(generateSimpleFormat(sortedItems, options));
			}
			continue;
		}

		// Traverse the file system to find the target
		let targetNode: FileSystemNode | undefined = fileSystem[targetPathArray[0]];
		if (!targetNode) {
			results.push(`ls: cannot access '${pathArg}': No such file or directory`);
			continue;
		}

		for (let i = 1; i < targetPathArray.length; i++) {
			if (targetNode?.children) {
				targetNode = targetNode.children[targetPathArray[i]];
				if (!targetNode) {
					results.push(
						`ls: cannot access '${pathArg}': No such file or directory`
					);
					break;
				}
			} else {
				results.push(`ls: cannot access '${pathArg}': Not a directory`);
				break;
			}
		}

		if (!targetNode) continue;

		// Handle -d option (list directory itself, not contents)
		if (options.directory || targetNode.type === "file") {
			const item = targetNode;
			if (options.long) {
				results.push(generateLongFormat([item], options, targetPathArray));
			} else {
				results.push(generateSimpleFormat([item], options));
			}
			continue;
		}

		// List directory contents
		if (targetNode.type === "directory" && targetNode.children) {
			let items = Object.values(targetNode.children);

			// Add hidden files if -a option
			if (options.all) {
				items = [
					{ name: ".", type: "directory", content: "" } as FileSystemNode,
					{ name: "..", type: "directory", content: "" } as FileSystemNode,
					...items,
				];
			}

			if (items.length === 0 && !options.all) {
				continue; // Empty directory
			}

			const sortedItems = sortItems(items, options);

			if (options.long) {
				// Add total line for long format
				const total = sortedItems.length * 4; // Simplified
				results.push(`total ${total}`);
				results.push(generateLongFormat(sortedItems, options, targetPathArray));
			} else {
				results.push(generateSimpleFormat(sortedItems, options));
			}

			// Handle recursive option
			if (options.recursive) {
				for (const item of sortedItems) {
					if (
						item.type === "directory" &&
						item.name !== "." &&
						item.name !== ".."
					) {
						const subPath = [...targetPathArray, item.name];
						results.push("");
						results.push(`${subPath.join("/")}:`);

						// Recursively list subdirectory
						const subArgs = [subPath.join("/")];
						results.push(
							generateLsOutput({ ...terminalState, currentPath: [] }, subArgs)
						);
					}
				}
			}
		}
	}

	return results.filter((r) => r !== "").join("\n");
};
