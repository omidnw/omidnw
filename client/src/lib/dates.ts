/**
 * Shared date formatting for the Professional theme.
 *
 * ISO date → "12 March 2025". Falls back to the raw string when the value is
 * not a parseable date, so a malformed frontmatter value is shown as-is rather
 * than as "Invalid Date".
 */
export function formatDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}