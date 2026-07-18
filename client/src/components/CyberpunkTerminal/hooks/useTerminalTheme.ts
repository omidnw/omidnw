import { useState, useCallback, useEffect } from "react";

const THEME_KEY = "cyberpunk-terminal-theme";

export interface TerminalTheme {
	name: string;
	primary: string;
	secondary: string;
	background: string;
	matrixOpacity: string;
	scanlineOpacity: string;
	gridOpacity: string;
}

export const THEMES: Record<string, TerminalTheme> = {
	classic: {
		name: "Classic Cyan",
		primary: "rgb(0, 255, 255)",
		secondary: "rgb(255, 0, 255)",
		background: "rgba(0, 0, 0, 0.9)",
		matrixOpacity: "0.05",
		scanlineOpacity: "0.05",
		gridOpacity: "0.1",
	},
	matrix: {
		name: "Matrix Green",
		primary: "rgb(0, 255, 65)",
		secondary: "rgb(0, 200, 50)",
		background: "rgba(0, 10, 0, 0.95)",
		matrixOpacity: "0.1",
		scanlineOpacity: "0.03",
		gridOpacity: "0.08",
	},
	neon: {
		name: "Neon Pink",
		primary: "rgb(255, 16, 240)",
		secondary: "rgb(138, 43, 226)",
		background: "rgba(10, 0, 20, 0.9)",
		matrixOpacity: "0.04",
		scanlineOpacity: "0.06",
		gridOpacity: "0.12",
	},
	hacker: {
		name: "Hacker Blue",
		primary: "rgb(0, 150, 255)",
		secondary: "rgb(0, 255, 200)",
		background: "rgba(0, 5, 15, 0.92)",
		matrixOpacity: "0.06",
		scanlineOpacity: "0.04",
		gridOpacity: "0.09",
	},
	ember: {
		name: "Ember Orange",
		primary: "rgb(255, 120, 0)",
		secondary: "rgb(255, 50, 50)",
		background: "rgba(20, 5, 0, 0.9)",
		matrixOpacity: "0.03",
		scanlineOpacity: "0.05",
		gridOpacity: "0.08",
	},
	ghost: {
		name: "Ghost White",
		primary: "rgb(230, 230, 255)",
		secondary: "rgb(180, 180, 220)",
		background: "rgba(15, 15, 30, 0.85)",
		matrixOpacity: "0.02",
		scanlineOpacity: "0.02",
		gridOpacity: "0.05",
	},
};

export function useTerminalTheme() {
	const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(THEMES.classic);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(THEME_KEY);
			if (saved && THEMES[saved]) {
				setCurrentTheme(THEMES[saved]);
			}
		} catch (error) {
			console.warn("Failed to load theme from localStorage:", error);
		}
	}, []);

	const changeTheme = useCallback((themeName: string): string => {
		const theme = THEMES[themeName.toLowerCase()];
		if (!theme) {
			const availableThemes = Object.keys(THEMES).join(", ");
			return `Error: Theme '${themeName}' not found.\nAvailable themes: ${availableThemes}`;
		}

		setCurrentTheme(theme);
		try {
			localStorage.setItem(THEME_KEY, themeName.toLowerCase());
		} catch (error) {
			console.warn("Failed to save theme to localStorage:", error);
		}

		return `Theme changed to: ${theme.name}`;
	}, []);

	const listThemes = useCallback((): string => {
		const themeList = Object.entries(THEMES)
			.map(([key, theme]) => {
				const current = theme === currentTheme ? " (current)" : "";
				return `  ${key.padEnd(10)} - ${theme.name}${current}`;
			})
			.join("\n");

		return `Available themes:\n${themeList}\n\nUsage: theme <name>`;
	}, [currentTheme]);

	return {
		currentTheme,
		changeTheme,
		listThemes,
		themes: THEMES,
	};
}
