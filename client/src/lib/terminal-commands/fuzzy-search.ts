export function fuzzyMatch(pattern: string, text: string): { matches: boolean; score: number } {
	const patternLower = pattern.toLowerCase();
	const textLower = text.toLowerCase();

	if (textLower.includes(patternLower)) {
		const exactMatchIndex = textLower.indexOf(patternLower);
		const score = 1000 - exactMatchIndex;
		return { matches: true, score };
	}

	let patternIdx = 0;
	let textIdx = 0;
	let score = 0;
	let consecutiveMatches = 0;

	while (patternIdx < patternLower.length && textIdx < textLower.length) {
		if (patternLower[patternIdx] === textLower[textIdx]) {
			score += 10 + consecutiveMatches * 5;
			consecutiveMatches++;
			patternIdx++;
		} else {
			consecutiveMatches = 0;
			score -= 1;
		}
		textIdx++;
	}

	const matches = patternIdx === patternLower.length;

	if (textLower.startsWith(patternLower.substring(0, 2))) {
		score += 50;
	}

	return { matches, score };
}

export function fuzzySearch<T>(
	query: string,
	items: T[],
	getText: (item: T) => string,
	limit: number = 10
): T[] {
	if (!query) return items.slice(0, limit);

	const scored = items
		.map((item) => {
			const text = getText(item);
			const { matches, score } = fuzzyMatch(query, text);
			return { item, score, matches };
		})
		.filter((result) => result.matches)
		.sort((a, b) => b.score - a.score);

	return scored.slice(0, limit).map((result) => result.item);
}

export function getCommandSuggestions(
	input: string,
	availableCommands: string[],
	limit: number = 5
): string[] {
	return fuzzySearch(input, availableCommands, (cmd) => cmd, limit);
}
