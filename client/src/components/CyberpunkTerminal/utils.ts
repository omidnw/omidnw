import type { TimeInfo } from "./types";

/**
 * Detect if the user is on macOS
 */
export const detectMacOS = (): boolean => {
	return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

/**
 * Get current time information for both user and UAE
 */
export const getTimeInfo = (): TimeInfo => {
	const now = new Date();
	const uaeTime = new Date(
		now.getTime() + 4 * 60 * 60 * 1000 + now.getTimezoneOffset() * 60 * 1000
	);
	const userOffset = -now.getTimezoneOffset() / 60;
	const uaeOffset = 4;
	const timeDiff = uaeOffset - userOffset;
	const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	return {
		now,
		uaeTime,
		userOffset,
		uaeOffset,
		timeDiff,
		userTimezone,
	};
};

/**
 * Format time for display (HH:MM:SS)
 */
export const formatTime = (date: Date): string => {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
};

/**
 * Get time difference text
 */
export const getTimeDifferenceText = (timeDiff: number): string => {
	if (timeDiff === 0) {
		return "Same timezone";
	} else if (timeDiff > 0) {
		return `UAE +${timeDiff}h ahead`;
	} else {
		return `UAE ${Math.abs(timeDiff)}h behind`;
	}
};

/**
 * Get user timezone display name
 */
export const getUserTimezoneDisplay = (userTimezone: string): string => {
	return (
		userTimezone
			.split("/")
			.pop()
			?.replace("_", " ")
			.substring(0, 8)
			.padEnd(8) || "LOCAL".padEnd(8)
	);
};

/**
 * Get current path based on location
 */
export const getCurrentPath = (location: string): string => {
	switch (location) {
		case "/":
			return "/home";
		case "/about":
			return "/about";
		case "/projects":
			return "/projects";
		case "/blog":
			return "/blog";
		case "/contact":
			return "/contact";
		case "/terminal":
			return "/terminal";
		default:
			return location;
	}
};

/**
 * Get current directory path as string
 */
export const getCurrentDirectory = (path: string[]): string => {
	if (path.length === 0) return "/";
	return "/" + path.join("/");
};

/**
 * Get parent path array
 */
export const getParentPath = (path: string[]): string[] => {
	if (path.length === 0) return [];
	return path.slice(0, -1);
};

/**
 * Resolve path from current directory and input path
 */
export const resolvePath = (
	currentPath: string[],
	inputPath: string
): string[] => {
	if (inputPath.startsWith("/")) {
		// Absolute path
		return inputPath.split("/").filter((p) => p.length > 0);
	}

	// Relative path
	const parts = inputPath.split("/");
	let newPath = [...currentPath];

	for (const part of parts) {
		if (part === "..") {
			if (newPath.length > 0) {
				newPath.pop();
			}
		} else if (part === "." || part === "") {
			// Stay in current directory
			continue;
		} else {
			newPath.push(part);
		}
	}

	return newPath;
};
