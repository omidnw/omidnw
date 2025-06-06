/**
 * Handle history command - shows command history
 */
export const handleHistoryCommand = (): string => {
	try {
		const savedCommands = localStorage.getItem(
			"cyberpunk-terminal-command-history"
		);
		if (!savedCommands) {
			return "No command history available.";
		}

		const commands = JSON.parse(savedCommands) as string[];
		if (commands.length === 0) {
			return "No command history available.";
		}

		let output =
			"╭─────────────────────────────────────────────────────────────╮\n";
		output +=
			"│                     COMMAND HISTORY                        │\n";
		output +=
			"├─────────────────────────────────────────────────────────────┤\n";

		commands.forEach((cmd, index) => {
			const lineNumber = (index + 1).toString().padStart(4);
			const truncatedCmd = cmd.length > 50 ? cmd.substring(0, 47) + "..." : cmd;
			output += `│ ${lineNumber}  ${truncatedCmd.padEnd(50)} │\n`;
		});

		output +=
			"╰─────────────────────────────────────────────────────────────╯\n";
		output += `\nTotal commands: ${commands.length}`;

		return output;
	} catch (error) {
		return "Error: Failed to load command history.";
	}
};

/**
 * Handle clear-history command - clears command history
 */
export const handleClearHistoryCommand = (): string => {
	try {
		localStorage.setItem("cyberpunk-terminal-command-history", "[]");
		return "✅ Command history cleared successfully.";
	} catch (error) {
		return "Error: Failed to clear command history.";
	}
};
