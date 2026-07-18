import { useState, useCallback, useEffect } from "react";

const TERMINAL_HISTORY_KEY = "cyberpunk-terminal-history";
const COMMAND_HISTORY_KEY = "cyberpunk-terminal-command-history";
const INITIAL_SHOWN_KEY = "cyberpunk-terminal-initial-shown";
const MAX_HISTORY_SIZE = 1000;

export function useTerminalHistory(initialHistory: string[] = []) {
	const [history, setHistory] = useState<string[]>([]);
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const saveHistoryDebounced = useCallback(
		(() => {
			let timeoutId: NodeJS.Timeout | null = null;
			return (historyData: string[]) => {
				if (timeoutId) clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					try {
						const trimmedHistory = historyData.slice(-MAX_HISTORY_SIZE);
						localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(trimmedHistory));
					} catch (error) {
						console.warn("Failed to save history to localStorage:", error);
					}
				}, 2000);
			};
		})(),
		[]
	);

	const saveCommandHistoryDebounced = useCallback(
		(() => {
			let timeoutId: NodeJS.Timeout | null = null;
			return (cmdHistory: string[]) => {
				if (timeoutId) clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					try {
						const trimmedHistory = cmdHistory.slice(-MAX_HISTORY_SIZE);
						localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(trimmedHistory));
					} catch (error) {
						console.warn("Failed to save command history to localStorage:", error);
					}
				}, 2000);
			};
		})(),
		[]
	);

	const loadHistoryFromLocalStorage = useCallback((): string[] => {
		try {
			const saved = localStorage.getItem(TERMINAL_HISTORY_KEY);
			return saved ? JSON.parse(saved) : [];
		} catch (error) {
			console.warn("Failed to load history from localStorage:", error);
			return [];
		}
	}, []);

	const loadCommandHistoryFromLocalStorage = useCallback((): string[] => {
		try {
			const saved = localStorage.getItem(COMMAND_HISTORY_KEY);
			return saved ? JSON.parse(saved) : [];
		} catch (error) {
			console.warn("Failed to load command history from localStorage:", error);
			return [];
		}
	}, []);

	const hasShownInitialHistory = useCallback((): boolean => {
		try {
			return localStorage.getItem(INITIAL_SHOWN_KEY) === "true";
		} catch (error) {
			return false;
		}
	}, []);

	const markInitialHistoryShown = useCallback(() => {
		try {
			localStorage.setItem(INITIAL_SHOWN_KEY, "true");
		} catch (error) {
			console.warn("Failed to mark initial history as shown:", error);
		}
	}, []);

	const addToHistory = useCallback(
		(content: string) => {
			setHistory((prev) => {
				const newHistory = [...prev, content];
				saveHistoryDebounced(newHistory);
				return newHistory;
			});
		},
		[saveHistoryDebounced]
	);

	const clearHistory = useCallback(() => {
		setHistory([]);
		try {
			localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify([]));
		} catch (error) {
			console.warn("Failed to clear history in localStorage:", error);
		}
	}, []);

	const addToCommandHistory = useCallback(
		(command: string) => {
			setCommandHistory((prev) => {
				const newCommandHistory = [...prev, command];
				saveCommandHistoryDebounced(newCommandHistory);
				return newCommandHistory;
			});
			setHistoryIndex(-1);
		},
		[saveCommandHistoryDebounced]
	);

	const navigateHistory = useCallback(
		(direction: "up" | "down"): string => {
			if (direction === "up" && commandHistory.length > 0) {
				const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
				setHistoryIndex(newIndex);
				return commandHistory[commandHistory.length - 1 - newIndex];
			} else if (direction === "down") {
				if (historyIndex > 0) {
					const newIndex = historyIndex - 1;
					setHistoryIndex(newIndex);
					return commandHistory[commandHistory.length - 1 - newIndex];
				} else if (historyIndex === 0) {
					setHistoryIndex(-1);
					return "";
				}
			}
			return "";
		},
		[commandHistory, historyIndex]
	);

	const getLastCommand = useCallback((): string => {
		return commandHistory.length > 0
			? commandHistory[commandHistory.length - 1]
			: "";
	}, [commandHistory]);

	const initializeHistory = useCallback(() => {
		const savedHistory = loadHistoryFromLocalStorage();
		const savedCommandHistory = loadCommandHistoryFromLocalStorage();

		if (!hasShownInitialHistory() && savedHistory.length === 0) {
			setHistory(initialHistory.slice());
			saveHistoryDebounced(initialHistory.slice());
			markInitialHistoryShown();
		} else {
			setHistory(savedHistory);
		}

		setCommandHistory(savedCommandHistory);
	}, [
		loadHistoryFromLocalStorage,
		loadCommandHistoryFromLocalStorage,
		hasShownInitialHistory,
		initialHistory,
		saveHistoryDebounced,
		markInitialHistoryShown,
	]);

	return {
		history,
		commandHistory,
		historyIndex,
		addToHistory,
		clearHistory,
		addToCommandHistory,
		navigateHistory,
		getLastCommand,
		initializeHistory,
	};
}
