export function handleThemeCommand(args: string[]): string {
	if (args.length === 0) {
		return "THEME_LIST";
	}

	const themeName = args[0].toLowerCase();
	return `THEME_CHANGE:${themeName}`;
}

export function handleEchoCommand(args: string[]): string {
	return args.join(" ");
}

export function handleDateCommand(): string {
	const now = new Date();
	return now.toLocaleString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZoneName: "short",
	});
}

export function handleTimeCommand(): string {
	const now = new Date();
	return now.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

export function handleUptimeCommand(): string {
	const uptime = performance.now();
	const seconds = Math.floor(uptime / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `up ${days} day(s), ${hours % 24} hour(s), ${minutes % 60} minute(s)`;
	} else if (hours > 0) {
		return `up ${hours} hour(s), ${minutes % 60} minute(s)`;
	} else if (minutes > 0) {
		return `up ${minutes} minute(s), ${seconds % 60} second(s)`;
	} else {
		return `up ${seconds} second(s)`;
	}
}
