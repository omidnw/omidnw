import { useMemo } from "react";
import { calculateStaggerDelay, STAGGER_CONFIG } from "@/lib/animations";

/**
 * Custom hook for calculating stagger delays for a list of items
 * @param itemCount - The number of items to stagger
 * @param delayIncrement - The delay increment between items (default: 0.1s)
 * @returns An array of delay values for each item
 */
export const useStaggerAnimation = (
	itemCount: number,
	delayIncrement: number = STAGGER_CONFIG.delayIncrement
): number[] => {
	return useMemo(() => {
		return Array.from({ length: itemCount }, (_, index) =>
			calculateStaggerDelay(index, delayIncrement)
		);
	}, [itemCount, delayIncrement]);
};

/**
 * Custom hook for getting a single stagger delay for an item at a specific index
 * @param index - The index of the item
 * @param delayIncrement - The delay increment between items (default: 0.1s)
 * @returns The delay value for the item
 */
export const useStaggerDelay = (
	index: number,
	delayIncrement: number = STAGGER_CONFIG.delayIncrement
): number => {
	return useMemo(() => {
		return calculateStaggerDelay(index, delayIncrement);
	}, [index, delayIncrement]);
};
