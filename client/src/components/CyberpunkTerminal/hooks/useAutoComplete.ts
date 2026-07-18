import { useState, useCallback, useMemo } from "react";
import type { TerminalState } from "../types";
import { getTabCompletions } from "@/lib/terminal-commands/tab-completion";
import { fuzzySearch } from "@/lib/terminal-commands/fuzzy-search";

export function useAutoComplete(terminalState: TerminalState, isMac: boolean) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	const findCommonPrefix = useCallback((strings: string[]): string => {
		if (strings.length === 0) return "";
		if (strings.length === 1) return strings[0];

		let prefix = strings[0];
		for (let i = 1; i < strings.length; i++) {
			while (strings[i].indexOf(prefix) !== 0) {
				prefix = prefix.substring(0, prefix.length - 1);
				if (prefix === "") return "";
			}
		}
		return prefix;
	}, []);

	const getCompletions = useCallback(
		(input: string): string[] => {
			const trimmedInput = input.trimStart();
			if (!trimmedInput) return [];

			const completions = getTabCompletions(trimmedInput, terminalState, isMac);
			return completions;
		},
		[terminalState, isMac]
	);

	const getFuzzySuggestions = useCallback(
		(input: string): string[] => {
			const trimmedInput = input.trimStart();
			if (!trimmedInput) return [];

			const completions = getCompletions(trimmedInput);
			
			if (completions.length === 0) {
				return [];
			}

			const parts = trimmedInput.split(" ");
			const lastPart = parts[parts.length - 1];

			if (!lastPart) return completions;

			const fuzzyResults = fuzzySearch(lastPart, completions, (item) => item, 10);
			return fuzzyResults;
		},
		[getCompletions]
	);

	const handleTabCompletion = useCallback(
		(input: string): { newInput: string; message: string } => {
			const trimmedInput = input.trimStart();
			if (!trimmedInput) {
				return { newInput: input, message: "" };
			}

			const completions = getCompletions(trimmedInput);

			if (completions.length === 1) {
				const completion = completions[0];

				if (trimmedInput.startsWith("./") || trimmedInput.startsWith("../")) {
					return { newInput: completion, message: "" };
				} else if (!trimmedInput.includes(" ")) {
					return { newInput: completion + " ", message: "" };
				} else {
					return { newInput: completion, message: "" };
				}
			} else if (completions.length > 1) {
				const isCommandCompletion = !trimmedInput.includes(" ");
				const label = isCommandCompletion ? "Available commands" : "Available options";
				const message = `${label}: ${completions.join("  ")}`;

				const commonPrefix = findCommonPrefix(completions);
				const newInput =
					commonPrefix && commonPrefix.length > trimmedInput.length
						? commonPrefix
						: input;

				setSuggestions(completions);
				setSelectedIndex(-1);

				return { newInput, message };
			}

			return { newInput: input, message: "" };
		},
		[getCompletions, findCommonPrefix]
	);

	const selectNextSuggestion = useCallback(() => {
		if (suggestions.length === 0) return null;
		const newIndex = (selectedIndex + 1) % suggestions.length;
		setSelectedIndex(newIndex);
		return suggestions[newIndex];
	}, [suggestions, selectedIndex]);

	const selectPrevSuggestion = useCallback(() => {
		if (suggestions.length === 0) return null;
		const newIndex =
			selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
		setSelectedIndex(newIndex);
		return suggestions[newIndex];
	}, [suggestions, selectedIndex]);

	const clearSuggestions = useCallback(() => {
		setSuggestions([]);
		setSelectedIndex(-1);
	}, []);

	return {
		suggestions,
		selectedIndex,
		handleTabCompletion,
		getFuzzySuggestions,
		selectNextSuggestion,
		selectPrevSuggestion,
		clearSuggestions,
	};
}
