import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeColors {
	// Primary colors
	primary: {
		cyan: string;
		purple: string;
		pink: string;
		blue: string;
	};
	// Status colors
	status: {
		success: string;
		error: string;
		warning: string;
		info: string;
	};
	// Background colors
	background: {
		primary: string;
		secondary: string;
		tertiary: string;
		card: string;
		hover: string;
	};
	// Text colors
	text: {
		primary: string;
		secondary: string;
		tertiary: string;
		inverse: string;
	};
	// Border colors
	border: {
		primary: string;
		secondary: string;
		accent: string;
	};
	// Gradient colors
	gradients: {
		primary: string;
		secondary: string;
		tertiary: string;
		posts: string;
		projects: string;
		github: string;
		settings: string;
	};
	// Shadow colors
	shadows: {
		cyan: string;
		purple: string;
		pink: string;
		green: string;
	};
}

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	colors: ThemeColors;
	isDark: boolean;
}

const darkTheme: ThemeColors = {
	primary: {
		cyan: "#06B6D4",
		purple: "#A855F7",
		pink: "#EC4899",
		blue: "#3B82F6",
	},
	status: {
		success: "#4ADE80",
		error: "#EF4444",
		warning: "#FACC15",
		info: "#06B6D4",
	},
	background: {
		primary: "#030712", // gray-950
		secondary: "#111827", // gray-900
		tertiary: "#1F2937", // gray-800
		card: "rgba(17, 24, 39, 0.9)", // gray-900/90
		hover: "rgba(31, 41, 55, 0.5)", // gray-800/50
	},
	text: {
		primary: "#FFFFFF",
		secondary: "#D1D5DB", // gray-300
		tertiary: "#9CA3AF", // gray-400
		inverse: "#030712",
	},
	border: {
		primary: "rgba(6, 182, 212, 0.3)", // cyan-500/30
		secondary: "rgba(168, 85, 247, 0.3)", // purple-500/30
		accent: "rgba(236, 72, 153, 0.3)", // pink-500/30
	},
	gradients: {
		primary: "from-cyan-400 via-purple-400 to-pink-400",
		secondary: "from-cyan-500 to-purple-500",
		tertiary: "from-purple-500 to-pink-500",
		posts: "from-cyan-400 via-blue-400 to-purple-400",
		projects: "from-purple-400 via-pink-400 to-cyan-400",
		github: "from-cyan-400 via-blue-400 to-purple-400",
		settings: "from-cyan-400 via-purple-400 to-pink-400",
	},
	shadows: {
		cyan: "0 0 20px rgba(6, 182, 212, 0.5)",
		purple: "0 0 20px rgba(168, 85, 247, 0.5)",
		pink: "0 0 20px rgba(236, 72, 153, 0.5)",
		green: "0 0 20px rgba(74, 222, 128, 0.5)",
	},
};

const lightTheme: ThemeColors = {
	primary: {
		cyan: "#0891B2", // cyan-600
		purple: "#7c3aed", // purple-600 (enhanced)
		pink: "#DB2777", // pink-600
		blue: "#2563EB", // blue-600
	},
	status: {
		success: "#16A34A", // green-600
		error: "#DC2626", // red-600
		warning: "#CA8A04", // yellow-600
		info: "#0891B2", // cyan-600
	},
	background: {
		primary: "#ddd9e8", // Lighter soft cyberpunk purple-gray
		secondary: "#d0cade", // Medium purple-gray
		tertiary: "#c0bad0", // Darker purple-gray
		card: "rgba(221, 217, 232, 0.95)", // Semi-transparent primary
		hover: "rgba(192, 186, 208, 0.8)", // Semi-transparent tertiary
	},
	text: {
		primary: "#1a1625", // Deep purple-black
		secondary: "#2d2838", // Dark purple-gray
		tertiary: "#4a4558", // Medium purple-gray
		inverse: "#FFFFFF",
	},
	border: {
		primary: "rgba(8, 145, 178, 0.5)", // cyan with more opacity
		secondary: "rgba(124, 58, 237, 0.5)", // purple with more opacity
		accent: "rgba(219, 39, 119, 0.5)", // pink with more opacity
	},
	gradients: {
		primary: "from-cyan-500 via-purple-500 to-pink-500",
		secondary: "from-cyan-600 to-purple-600",
		tertiary: "from-purple-600 to-pink-600",
		posts: "from-cyan-500 via-blue-500 to-purple-500",
		projects: "from-purple-500 via-pink-500 to-cyan-500",
		github: "from-cyan-500 via-blue-500 to-purple-500",
		settings: "from-cyan-500 via-purple-500 to-pink-500",
	},
	shadows: {
		cyan: "0 0 20px rgba(8, 145, 178, 0.3)",
		purple: "0 0 20px rgba(147, 51, 234, 0.3)",
		pink: "0 0 20px rgba(219, 39, 119, 0.3)",
		green: "0 0 20px rgba(22, 163, 74, 0.3)",
	},
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [theme, setTheme] = useState<Theme>(() => {
		// Check localStorage first
		const savedTheme = localStorage.getItem("theme") as Theme | null;
		if (savedTheme) return savedTheme;

		// Check system preference
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return "dark";
		}
		return "dark"; // Default to dark for cyberpunk theme
	});

	const colors = theme === "dark" ? darkTheme : lightTheme;
	const isDark = theme === "dark";

	useEffect(() => {
		// Save to localStorage
		localStorage.setItem("theme", theme);

		// Update document class
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		} else {
			document.documentElement.classList.add("light");
			document.documentElement.classList.remove("dark");
		}

		// Update meta theme-color
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute(
				"content",
				theme === "dark" ? "#030712" : "#FFFFFF"
			);
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

// Helper hook for getting color values
export const useThemeColors = () => {
	const { colors } = useTheme();
	return colors;
};

// Helper hook for checking if dark mode
export const useIsDark = () => {
	const { isDark } = useTheme();
	return isDark;
};
