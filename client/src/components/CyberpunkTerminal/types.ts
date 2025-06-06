export interface Command {
	command: string;
	output: string;
	timestamp: string;
}

export interface CyberpunkTerminalProps {
	isOpen: boolean;
	onClose: () => void;
}

export interface FileSystemNode {
	name: string;
	type: "file" | "directory";
	children?: Record<string, FileSystemNode>;
	content?: string;
}

export interface TerminalState {
	currentPath: string[];
	fileSystem: Record<string, FileSystemNode>;
}

export interface TerminalCommands {
	help: string;
	ls: string;
	cd: string;
	pwd: string;
	read: string;
	systemctl: string;
	neofetch: string;
	whoami: string;
	status: string;
	clear: string;
	history: string;
	"clear-history": string;
	shutdown: string;
	exit: string;
	quit: string;
	reload: string;
	ps: string;
	top: string;
	man: string;
}

export interface TimeInfo {
	now: Date;
	uaeTime: Date;
	userOffset: number;
	uaeOffset: number;
	timeDiff: number;
	userTimezone: string;
}
