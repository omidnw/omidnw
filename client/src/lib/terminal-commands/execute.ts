import { TerminalState } from "@/components/CyberpunkTerminal/types";

// File system data storage (import projects from where it's initialized)
// Note: This might need adjustment depending on how projects data is managed globally after refactoring
let projects: any; // Placeholder - will need correct import or passing

/**
 * Handle ./ command for executing files (like project demos)
 */
export const handleExecuteCommand = (
	cmd: string, // The full command string (e.g., "./anime-management")
	terminalState: TerminalState,
	projectsData: any // Pass projects data here
): string => {
	const trimmedCmd = cmd.trim();

	// Check if the command starts with ./
	if (!trimmedCmd.startsWith("./")) {
		return "Error: handleExecuteCommand called with non-./ command";
	}

	const projectId = trimmedCmd.substring(2); // Extract projectId after './'
	const { currentPath } = terminalState;

	// Check if in /projects directory
	if (
		currentPath &&
		currentPath.length === 1 &&
		currentPath[0] === "projects"
	) {
		const project = projectsData[projectId];

		if (project && project.demoUrl) {
			window.open(project.demoUrl, "_blank");
			return `Executing ${projectId}... Opening demo in new tab.`;
		} else if (project) {
			return `Error: ${projectId} does not have a demo URL.`;
		} else {
			return `Error: command not found: ./${projectId}\nType 'ls' to see available projects.`;
		}
	} else {
		return "Error: ./ command is only supported in the /projects directory.";
	}
};
