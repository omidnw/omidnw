import {
	TerminalState,
	FileSystemNode,
} from "@/components/CyberpunkTerminal/types";

/**
 * Handle read command to open blog posts and projects
 */
export const handleReadCommand = (
	filename: string,
	terminalState: TerminalState,
	blogPosts: any, // Pass blogPosts here
	projects: any, // Pass projects here
	onOpenBlogPost?: (blogId: string) => void,
	onOpenProject?: (projectId: string) => void
): string => {
	if (!filename.trim()) {
		return `read: missing file argument\nUsage: read <filename>`;
	}

	const { currentPath, fileSystem } = terminalState;

	// Check if we're in root directory
	if (!currentPath || currentPath.length === 0) {
		return `read: cannot access '${filename}': Not in a readable directory\nUse 'cd blog/' or 'cd projects/' to navigate to content directories first.`;
	}

	// Find the file in current directory
	let currentNode: FileSystemNode | undefined = fileSystem[currentPath[0]];
	if (!currentNode) {
		return `read: cannot access '${filename}': No such file or directory`;
	}

	for (let i = 1; i < currentPath.length; i++) {
		if (currentNode?.children) {
			currentNode = currentNode.children[currentPath[i]];
			if (!currentNode) {
				return `read: cannot access '${filename}': No such file or directory`;
			}
		} else {
			return `read: cannot access '${filename}': No such file or directory`; // Should be Not a directory if intermediate node is file
		}
	}

	// After traversing the path, the last node should be the directory containing the file
	if (!currentNode?.children) {
		return `read: cannot access '${filename}': Not in a readable directory`; // Or Not a directory if currentNode is a file
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
