import { useState, useEffect } from "react";

/**
 * Custom hook to detect if user prefers reduced motion
 * @returns true if user prefers reduced motion, false otherwise
 */
export const useReducedMotion = (): boolean => {
	const [prefersReduced, setPrefersReduced] = useState(false);

	useEffect(() => {
		// Check if window is available (SSR safety)
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		// Set initial value
		setPrefersReduced(mediaQuery.matches);

		// Listen for changes
		const handleChange = (event: MediaQueryListEvent) => {
			setPrefersReduced(event.matches);
		};

		// Modern browsers
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
		// Fallback for older browsers
		else if (mediaQuery.addListener) {
			mediaQuery.addListener(handleChange);
			return () => mediaQuery.removeListener(handleChange);
		}
	}, []);

	return prefersReduced;
};
