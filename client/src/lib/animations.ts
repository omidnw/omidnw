/**
 * Animation configuration and utilities for Dashboard UX Enhancement
 * Provides consistent timing, easing, and animation patterns across the application
 */

// Animation durations in milliseconds
export const ANIMATION_DURATION = {
	fast: 150, // micro-interactions
	medium: 300, // standard transitions
	slow: 500, // page transitions
	counter: 2000, // number counter animation
} as const;

// Animation easing functions
export const ANIMATION_EASING = {
	easeOut: "easeOut", // for entrances
	easeInOut: "easeInOut", // for state changes
	spring: "spring", // for playful interactions
} as const;

// Stagger configuration
export const STAGGER_CONFIG = {
	delayIncrement: 0.1, // delay between items in seconds
	maxDelay: 0.4, // maximum stagger delay in seconds
} as const;

/**
 * Calculate stagger delay for an item at a given index
 * @param index - The index of the item in the list
 * @param delayIncrement - The delay increment between items (default: 0.1s)
 * @returns The delay in seconds
 */
export const calculateStaggerDelay = (
	index: number,
	delayIncrement: number = STAGGER_CONFIG.delayIncrement
): number => {
	const delay = index * delayIncrement;
	return Math.min(delay, STAGGER_CONFIG.maxDelay);
};

/**
 * Framer Motion variants for stat card entrance animation
 */
export const statCardVariants = {
	hidden: {
		opacity: 0,
		y: 20,
		scale: 0.95,
	},
	visible: (delay: number = 0) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			delay,
			duration: ANIMATION_DURATION.slow / 1000,
			ease: ANIMATION_EASING.easeOut,
		},
	}),
};

/**
 * Framer Motion variants for hover scale effect
 */
export const hoverScaleVariants = {
	rest: {
		scale: 1,
	},
	hover: {
		scale: 1.05,
		transition: {
			duration: ANIMATION_DURATION.fast / 1000,
			ease: ANIMATION_EASING.easeOut,
		},
	},
};

/**
 * Framer Motion variants for sidebar slide animation
 */
export const sidebarVariants = {
	closed: {
		x: -320,
		opacity: 0,
	},
	open: {
		x: 0,
		opacity: 1,
		transition: {
			type: ANIMATION_EASING.spring,
			damping: 20,
			stiffness: 100,
		},
	},
};

/**
 * Framer Motion variants for fade and slide animation
 */
export const fadeSlideVariants = {
	hidden: {
		opacity: 0,
		y: 10,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: ANIMATION_DURATION.medium / 1000,
			ease: ANIMATION_EASING.easeOut,
		},
	},
};

/**
 * Framer Motion variants for staggered children
 */
export const staggerContainerVariants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: STAGGER_CONFIG.delayIncrement,
		},
	},
};

/**
 * Check if user prefers reduced motion
 * @returns true if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get animation duration based on user preference
 * @param duration - The default duration in milliseconds
 * @returns 0 if user prefers reduced motion, otherwise the original duration
 */
export const getAnimationDuration = (duration: number): number => {
	return prefersReducedMotion() ? 0 : duration;
};
