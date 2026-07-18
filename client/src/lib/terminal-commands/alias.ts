export function handleAliasCommand(args: string[]): string {
	if (args.length === 0) {
		return "ALIAS_LIST";
	}

	const fullArg = args.join(" ");
	const equalsIndex = fullArg.indexOf("=");

	if (equalsIndex === -1) {
		return `Error: Invalid alias syntax. Usage: alias name=command`;
	}

	const name = fullArg.substring(0, equalsIndex).trim();
	const command = fullArg.substring(equalsIndex + 1).trim();

	return `ALIAS_ADD:${name}:${command}`;
}

export function handleUnaliasCommand(args: string[]): string {
	if (args.length === 0) {
		return "Usage: unalias <name>";
	}

	const name = args[0].trim();
	return `ALIAS_REMOVE:${name}`;
}
