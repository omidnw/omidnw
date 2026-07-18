import { useState, useCallback, useEffect } from "react";

const ALIASES_KEY = "cyberpunk-terminal-aliases";

const DEFAULT_ALIASES: Record<string, string> = {
	"ll": "ls -la",
	"..": "cd ..",
	"...": "cd ../..",
	"~": "cd ~",
	"h": "help",
	"c": "clear",
	"q": "quit",
	"e": "exit",
};

export function useCommandAliases() {
	const [aliases, setAliases] = useState<Record<string, string>>(DEFAULT_ALIASES);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(ALIASES_KEY);
			if (saved) {
				const savedAliases = JSON.parse(saved);
				setAliases({ ...DEFAULT_ALIASES, ...savedAliases });
			}
		} catch (error) {
			console.warn("Failed to load aliases from localStorage:", error);
		}
	}, []);

	const saveAliases = useCallback((newAliases: Record<string, string>) => {
		try {
			const customAliases = { ...newAliases };
			Object.keys(DEFAULT_ALIASES).forEach((key) => {
				delete customAliases[key];
			});
			localStorage.setItem(ALIASES_KEY, JSON.stringify(customAliases));
		} catch (error) {
			console.warn("Failed to save aliases to localStorage:", error);
		}
	}, []);

	const addAlias = useCallback(
		(name: string, command: string): string => {
			if (!name || !command) {
				return "Usage: alias <name>=<command>";
			}

			const trimmedName = name.trim();
			const trimmedCommand = command.trim();

			if (trimmedName.includes(" ")) {
				return "Error: Alias name cannot contain spaces";
			}

			setAliases((prev) => {
				const newAliases = { ...prev, [trimmedName]: trimmedCommand };
				saveAliases(newAliases);
				return newAliases;
			});

			return `Alias created: ${trimmedName}='${trimmedCommand}'`;
		},
		[saveAliases]
	);

	const removeAlias = useCallback(
		(name: string): string => {
			const trimmedName = name.trim();

			if (!trimmedName) {
				return "Usage: unalias <name>";
			}

			if (DEFAULT_ALIASES[trimmedName]) {
				return `Error: Cannot remove default alias '${trimmedName}'`;
			}

			if (!aliases[trimmedName]) {
				return `Error: Alias '${trimmedName}' not found`;
			}

			setAliases((prev) => {
				const newAliases = { ...prev };
				delete newAliases[trimmedName];
				saveAliases(newAliases);
				return newAliases;
			});

			return `Alias removed: ${trimmedName}`;
		},
		[aliases, saveAliases]
	);

	const listAliases = useCallback((): string => {
		const aliasList = Object.entries(aliases)
			.map(([name, cmd]) => `${name}='${cmd}'`)
			.join("\n");
		return aliasList || "No aliases defined";
	}, [aliases]);

	const resolveAlias = useCallback(
		(command: string): string => {
			const parts = command.trim().split(" ");
			const firstPart = parts[0];

			if (aliases[firstPart]) {
				const resolvedCommand = aliases[firstPart];
				return [resolvedCommand, ...parts.slice(1)].join(" ");
			}

			return command;
		},
		[aliases]
	);

	return {
		aliases,
		addAlias,
		removeAlias,
		listAliases,
		resolveAlias,
	};
}
