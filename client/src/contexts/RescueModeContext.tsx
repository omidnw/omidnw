import React, { createContext, useContext, useState, useEffect } from "react";

interface RescueModeContextType {
	isRescueMode: boolean;
	setRescueMode: (mode: boolean) => void;
	rescueStartTime: Date | null;
	clearRescueData: () => void;
}

const RescueModeContext = createContext<RescueModeContextType | undefined>(
	undefined
);

// LocalStorage keys
const RESCUE_MODE_KEY = "cyberpunk-terminal-rescue-mode";
const RESCUE_START_TIME_KEY = "cyberpunk-terminal-rescue-start-time";

// Helper functions for localStorage
const saveToLocalStorage = (key: string, value: any) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.warn("Failed to save to localStorage:", error);
	}
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
	try {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : defaultValue;
	} catch (error) {
		console.warn("Failed to load from localStorage:", error);
		return defaultValue;
	}
};

export const useRescueMode = () => {
	const context = useContext(RescueModeContext);
	if (context === undefined) {
		throw new Error("useRescueMode must be used within a RescueModeProvider");
	}
	return context;
};

export const RescueModeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Initialize state from localStorage
	const [isRescueMode, setIsRescueMode] = useState(() =>
		loadFromLocalStorage(RESCUE_MODE_KEY, false)
	);
	const [rescueStartTime, setRescueStartTime] = useState<Date | null>(() => {
		const savedTime = loadFromLocalStorage(RESCUE_START_TIME_KEY, null);
		return savedTime ? new Date(savedTime) : null;
	});

	const setRescueMode = (mode: boolean) => {
		console.log("💾 Saving rescue mode to localStorage:", { mode });
		setIsRescueMode(mode);
		saveToLocalStorage(RESCUE_MODE_KEY, mode);

		if (mode) {
			const startTime = new Date();
			setRescueStartTime(startTime);
			saveToLocalStorage(RESCUE_START_TIME_KEY, startTime.toISOString());
			console.log("🚨 Rescue mode activated and saved to localStorage:", {
				startTime,
			});
		} else {
			setRescueStartTime(null);
			saveToLocalStorage(RESCUE_START_TIME_KEY, null);
			console.log("✅ Rescue mode deactivated and cleared from localStorage");
		}
	};

	const clearRescueData = () => {
		setIsRescueMode(false);
		setRescueStartTime(null);
		try {
			localStorage.removeItem(RESCUE_MODE_KEY);
			localStorage.removeItem(RESCUE_START_TIME_KEY);
		} catch (error) {
			console.warn("Failed to clear rescue data from localStorage:", error);
		}
	};

	// Restore systemctl state from localStorage on startup
	useEffect(() => {
		console.log("🔄 Restoring rescue mode from localStorage:", {
			isRescueMode,
			rescueStartTime,
		});
		if (isRescueMode) {
			// If localStorage says we're in rescue mode, sync with systemctl
			import("@/lib/terminal-commands/systemctl").then((module) => {
				console.log("⚡ Forcing systemctl into rescue mode from localStorage");
				// Force systemctl into rescue mode to match localStorage
				module.forceRescueMode(true);
			});
		}
	}, []); // Only run once on mount

	// Listen for rescue mode changes from systemctl
	useEffect(() => {
		const checkRescueMode = () => {
			// Import the rescue mode checker
			import("@/lib/terminal-commands/systemctl").then((module) => {
				const currentRescueMode = module.isSystemInRescueMode();
				if (currentRescueMode !== isRescueMode) {
					setRescueMode(currentRescueMode);
				}
			});
		};

		// Check every 100ms for rescue mode changes
		const interval = setInterval(checkRescueMode, 100);
		return () => clearInterval(interval);
	}, [isRescueMode]);

	return (
		<RescueModeContext.Provider
			value={{
				isRescueMode,
				setRescueMode,
				rescueStartTime,
				clearRescueData,
			}}
		>
			{children}
		</RescueModeContext.Provider>
	);
};
