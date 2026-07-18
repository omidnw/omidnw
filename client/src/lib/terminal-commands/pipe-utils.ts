export function parsePipedCommand(command: string): string[] {
	const parts: string[] = [];
	let current = "";
	let inQuotes = false;
	let quoteChar = "";

	for (let i = 0; i < command.length; i++) {
		const char = command[i];

		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true;
			quoteChar = char;
			current += char;
		} else if (char === quoteChar && inQuotes) {
			inQuotes = false;
			quoteChar = "";
			current += char;
		} else if (char === "|" && !inQuotes) {
			if (current.trim()) {
				parts.push(current.trim());
			}
			current = "";
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		parts.push(current.trim());
	}

	return parts;
}

export function grepFilter(input: string, pattern: string, flags?: string): string {
	const lines = input.split("\n");
	const caseInsensitive = flags?.includes("i");
	const invertMatch = flags?.includes("v");
	const regex = new RegExp(pattern, caseInsensitive ? "i" : "");

	const filtered = lines.filter((line) => {
		const matches = regex.test(line);
		return invertMatch ? !matches : matches;
	});

	return filtered.join("\n");
}

export function sortFilter(input: string, reverse: boolean = false): string {
	const lines = input.split("\n").filter((line) => line.trim());
	const sorted = lines.sort();
	return (reverse ? sorted.reverse() : sorted).join("\n");
}

export function headFilter(input: string, count: number = 10): string {
	const lines = input.split("\n");
	return lines.slice(0, count).join("\n");
}

export function tailFilter(input: string, count: number = 10): string {
	const lines = input.split("\n");
	return lines.slice(-count).join("\n");
}

export function wcFilter(input: string, type: "l" | "w" | "c" = "l"): string {
	const lines = input.split("\n");

	switch (type) {
		case "l":
			return `${lines.length}`;
		case "w": {
			const words = input.split(/\s+/).filter((w) => w.trim());
			return `${words.length}`;
		}
		case "c":
			return `${input.length}`;
		default:
			return `${lines.length}`;
	}
}

export function uniqueFilter(input: string): string {
	const lines = input.split("\n");
	const unique = Array.from(new Set(lines));
	return unique.join("\n");
}

export function applyPipeFilters(output: string, commands: string[]): string {
	let result = output;

	for (const cmd of commands) {
		const [command, ...args] = cmd.trim().split(/\s+/);

		switch (command.toLowerCase()) {
			case "grep": {
				if (args.length === 0) {
					result = "grep: missing pattern";
					break;
				}
				let pattern = args[0];
				let flags = "";
				if (pattern.startsWith("-")) {
					flags = pattern.substring(1);
					pattern = args[1] || "";
				}
				result = grepFilter(result, pattern, flags);
				break;
			}
			case "sort": {
				const reverse = args.includes("-r") || args.includes("--reverse");
				result = sortFilter(result, reverse);
				break;
			}
			case "head": {
				const countArg = args.find((arg) => arg.startsWith("-"));
				const count = countArg ? parseInt(countArg.substring(1)) : 10;
				result = headFilter(result, count);
				break;
			}
			case "tail": {
				const countArg = args.find((arg) => arg.startsWith("-"));
				const count = countArg ? parseInt(countArg.substring(1)) : 10;
				result = tailFilter(result, count);
				break;
			}
			case "wc": {
				let type: "l" | "w" | "c" = "l";
				if (args.includes("-w")) type = "w";
				else if (args.includes("-c")) type = "c";
				result = wcFilter(result, type);
				break;
			}
			case "uniq":
			case "unique":
				result = uniqueFilter(result);
				break;
			default:
				result = `Error: Unknown pipe command '${command}'`;
		}

		if (result.startsWith("Error:") || result.startsWith("grep:")) {
			break;
		}
	}

	return result;
}
