import { useState, useEffect } from "react";
import { ANIMATION_DURATION, prefersReducedMotion } from "@/lib/animations";

/**
 * Custom hook for animating number counting from 0 to target value
 * @param target - The target number to count to
 * @param duration - The duration of the animation in milliseconds (default: 2000ms)
 * @param enabled - Whether the animation is enabled (default: true)
 * @returns The current count value
 */
export const useCountAnimation = (
	target: number,
	duration: number = ANIMATION_DURATION.counter,
	enabled: boolean = true
): number => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		// If animation is disabled or user prefers reduced motion, show target immediately
		if (!enabled || prefersReducedMotion()) {
			setCount(target);
			return;
		}

		// Reset count when target changes
		setCount(0);

		// Calculate increment per frame (assuming 60fps)
		const frameTime = 16; // ~60fps
		const totalFrames = duration / frameTime;
		const increment = target / totalFrames;

		let currentCount = 0;
		const timer = setInterval(() => {
			currentCount += increment;

			if (currentCount >= target) {
				setCount(target);
				clearInterval(timer);
			} else {
				setCount(Math.floor(currentCount));
			}
		}, frameTime);

		return () => clearInterval(timer);
	}, [target, duration, enabled]);

	return count;
};
