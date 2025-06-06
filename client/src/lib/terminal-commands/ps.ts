import { TerminalState } from "@/components/CyberpunkTerminal/types";

interface PsOptions {
	all: boolean; // -a, -A, --all
	user: boolean; // -u
	extended: boolean; // -x
	format: boolean; // -f, --format
	long: boolean; // -l
	forest: boolean; // -H, --forest
	threads: boolean; // -T
	help: boolean; // --help
	version: boolean; // --version
	noHeaders: boolean; // --no-headers
	sort: string; // --sort
	pid: string[]; // -p, --pid
	user_filter: string; // -U, --User
}

// Cyberpunk-themed processes with realistic Linux process structure
const getSystemProcesses = () => {
	const currentTime = new Date();
	const startTimes = [
		"00:01",
		"00:02",
		"00:03",
		"00:05",
		"00:08",
		"00:12",
		"00:15",
		"00:20",
		"00:25",
		"00:30",
		"00:45",
		"01:02",
		"01:15",
		"01:30",
	];

	return [
		{
			pid: 1,
			ppid: 0,
			user: "root",
			cmd: "systemd",
			cpu: 0.0,
			mem: 0.1,
			vsz: 167936,
			rss: 7168,
			tty: "?",
			stat: "Ss",
			start: "00:01",
			time: "00:00:02",
		},
		{
			pid: 2,
			ppid: 0,
			user: "root",
			cmd: "[kthreadd]",
			cpu: 0.0,
			mem: 0.0,
			vsz: 0,
			rss: 0,
			tty: "?",
			stat: "S",
			start: "00:01",
			time: "00:00:00",
		},
		{
			pid: 3,
			ppid: 2,
			user: "root",
			cmd: "[rcu_gp]",
			cpu: 0.0,
			mem: 0.0,
			vsz: 0,
			rss: 0,
			tty: "?",
			stat: "I<",
			start: "00:01",
			time: "00:00:00",
		},
		{
			pid: 4,
			ppid: 2,
			user: "root",
			cmd: "[rcu_par_gp]",
			cpu: 0.0,
			mem: 0.0,
			vsz: 0,
			rss: 0,
			tty: "?",
			stat: "I<",
			start: "00:01",
			time: "00:00:00",
		},
		{
			pid: 128,
			ppid: 1,
			user: "root",
			cmd: "neural-matrix",
			cpu: 2.1,
			mem: 3.2,
			vsz: 524288,
			rss: 32768,
			tty: "?",
			stat: "Sl",
			start: "00:02",
			time: "00:02:15",
		},
		{
			pid: 256,
			ppid: 1,
			user: "omid",
			cmd: "cyberpunk-terminal",
			cpu: 1.8,
			mem: 2.5,
			vsz: 409600,
			rss: 25600,
			tty: "pts/0",
			stat: "S+",
			start: "00:03",
			time: "00:01:42",
		},
		{
			pid: 512,
			ppid: 1,
			user: "root",
			cmd: "quantum-encryption",
			cpu: 0.5,
			mem: 1.8,
			vsz: 204800,
			rss: 18432,
			tty: "?",
			stat: "S",
			start: "00:05",
			time: "00:00:30",
		},
		{
			pid: 1024,
			ppid: 1,
			user: "omid",
			cmd: "portfolio-api",
			cpu: 0.3,
			mem: 4.1,
			vsz: 614400,
			rss: 41984,
			tty: "?",
			stat: "Sl",
			start: "00:08",
			time: "00:00:45",
		},
		{
			pid: 2048,
			ppid: 1,
			user: "root",
			cmd: "firewall-protocols",
			cpu: 0.1,
			mem: 0.8,
			vsz: 102400,
			rss: 8192,
			tty: "?",
			stat: "S",
			start: "00:12",
			time: "00:00:12",
		},
		{
			pid: 4096,
			ppid: 1,
			user: "root",
			cmd: "NetworkManager",
			cpu: 0.2,
			mem: 1.2,
			vsz: 153600,
			rss: 12288,
			tty: "?",
			stat: "Ssl",
			start: "00:15",
			time: "00:00:08",
		},
		{
			pid: 8192,
			ppid: 256,
			user: "omid",
			cmd: "bash",
			cpu: 0.0,
			mem: 0.5,
			vsz: 25600,
			rss: 5120,
			tty: "pts/0",
			stat: "S",
			start: "00:20",
			time: "00:00:01",
		},
		{
			pid: 16384,
			ppid: 8192,
			user: "omid",
			cmd: "ps",
			cpu: 0.0,
			mem: 0.3,
			vsz: 15360,
			rss: 3072,
			tty: "pts/0",
			stat: "R+",
			start: "01:30",
			time: "00:00:00",
		},
		{
			pid: 32768,
			ppid: 1,
			user: "omid",
			cmd: "chrome",
			cpu: 5.2,
			mem: 12.3,
			vsz: 2048000,
			rss: 126976,
			tty: "?",
			stat: "Sl",
			start: "00:25",
			time: "00:05:30",
		},
		{
			pid: 65536,
			ppid: 32768,
			user: "omid",
			cmd: "chrome --type=renderer",
			cpu: 3.1,
			mem: 8.7,
			vsz: 1024000,
			rss: 89088,
			tty: "?",
			stat: "S",
			start: "00:30",
			time: "00:03:20",
		},
		{
			pid: 131072,
			ppid: 1,
			user: "root",
			cmd: "matrix-rain",
			cpu: 0.8,
			mem: 2.0,
			vsz: 256000,
			rss: 20480,
			tty: "?",
			stat: "S",
			start: "00:45",
			time: "00:01:15",
		},
		{
			pid: 262144,
			ppid: 1,
			user: "omid",
			cmd: "vim",
			cpu: 0.1,
			mem: 1.5,
			vsz: 32768,
			rss: 15360,
			tty: "pts/1",
			stat: "S+",
			start: "01:02",
			time: "00:00:05",
		},
		{
			pid: 524288,
			ppid: 1,
			user: "root",
			cmd: "cyber-grid",
			cpu: 0.4,
			mem: 1.1,
			vsz: 128000,
			rss: 11264,
			tty: "?",
			stat: "S",
			start: "01:15",
			time: "00:00:20",
		},
	];
};

/**
 * Display ps command help
 */
const displayPsHelp = (): string => {
	return `Usage: ps [options]

DESCRIPTION:
    Display information about running processes.

SIMPLE PROCESS SELECTION:
    -A, -e               all processes
    -a                   all with tty, except session leaders
    -d                   all except session leaders
    -N, --deselect       negate selection
    -r                   only running processes
    -T                   all processes on this terminal
    --pid <pidlist>      process id
    --ppid <pidlist>     parent process id

OUTPUT FORMAT CONTROL:
    -F                   extra full
    -f                   full-format, including command lines
    -j                   jobs format
    -l                   long format
    -o, --format <format> user-defined format
    -u                   user-format
    -v                   virtual memory format
    --forest             ascii art process tree
    --no-headers         no header

PROCESS SELECTION BY LIST:
    -C <cmdlist>         command name
    -G, --Group <grplist> real group name or ID
    -U, --User <userlist> real user name or ID
    -g, --group <grplist> effective group name or ID
    -p, --pid <pidlist>  process ID
    -s, --sid <sidlist>  session ID
    -t, --tty <ttylist>  terminal
    -u, --user <userlist> effective user name or ID

MISC OPTIONS:
    --help               display this help and exit
    --version            output version information and exit

EXAMPLES:
    ps                   # show processes for current terminal
    ps -ef               # show all processes with full format
    ps aux               # show all processes in user format
    ps -u omid           # show processes for user 'omid'
    ps --forest          # show processes in tree format
    ps -p 1,2,3          # show specific processes by PID`;
};

/**
 * Parse ps command arguments
 */
const parsePsOptions = (
	args: string[]
): { options: PsOptions; error?: string } => {
	const options: PsOptions = {
		all: false,
		user: false,
		extended: false,
		format: false,
		long: false,
		forest: false,
		threads: false,
		help: false,
		version: false,
		noHeaders: false,
		sort: "",
		pid: [],
		user_filter: "",
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--help") {
			options.help = true;
		} else if (arg === "--version") {
			options.version = true;
		} else if (arg === "--no-headers") {
			options.noHeaders = true;
		} else if (arg === "--forest") {
			options.forest = true;
		} else if (arg.startsWith("--sort=")) {
			options.sort = arg.substring(7);
		} else if (arg === "--sort") {
			if (i + 1 < args.length) {
				options.sort = args[i + 1];
				i++;
			}
		} else if (arg.startsWith("--pid=")) {
			options.pid = arg.substring(6).split(",");
		} else if (arg === "--pid" || arg === "-p") {
			if (i + 1 < args.length) {
				options.pid = args[i + 1].split(",");
				i++;
			}
		} else if (arg.startsWith("--User=") || arg.startsWith("--user=")) {
			options.user_filter = arg.substring(arg.indexOf("=") + 1);
		} else if (
			arg === "--User" ||
			arg === "--user" ||
			arg === "-U" ||
			arg === "-u"
		) {
			if (i + 1 < args.length) {
				options.user_filter = args[i + 1];
				i++;
			}
		} else if (arg.startsWith("-")) {
			// Handle combined options like -aux, -ef
			for (let j = 1; j < arg.length; j++) {
				const opt = arg[j];
				switch (opt) {
					case "A":
					case "e":
						options.all = true;
						break;
					case "a":
						options.all = true;
						break;
					case "u":
						if (
							j === arg.length - 1 &&
							i + 1 < args.length &&
							!args[i + 1].startsWith("-")
						) {
							// -u followed by username
							options.user_filter = args[i + 1];
							i++;
						} else {
							options.user = true;
						}
						break;
					case "x":
						options.extended = true;
						break;
					case "f":
						options.format = true;
						break;
					case "l":
						options.long = true;
						break;
					case "H":
						options.forest = true;
						break;
					case "T":
						options.threads = true;
						break;
					default:
						return { options, error: `ps: invalid option -- '${opt}'` };
				}
			}
		} else {
			return { options, error: `ps: unrecognized option '${arg}'` };
		}
	}

	return { options };
};

/**
 * Format process output based on options
 */
const formatProcessOutput = (processes: any[], options: PsOptions): string => {
	let filteredProcesses = [...processes];

	// Apply filters
	if (options.pid.length > 0) {
		const pids = options.pid.map((p) => parseInt(p));
		filteredProcesses = filteredProcesses.filter((p) => pids.includes(p.pid));
	}

	if (options.user_filter) {
		filteredProcesses = filteredProcesses.filter(
			(p) => p.user === options.user_filter
		);
	}

	if (!options.all && !options.extended) {
		// Default: only show processes for current terminal
		filteredProcesses = filteredProcesses.filter(
			(p) => p.tty !== "?" || p.user === "omid"
		);
	}

	// Sort processes
	if (options.sort) {
		const sortField = options.sort.toLowerCase();
		filteredProcesses.sort((a, b) => {
			switch (sortField) {
				case "pid":
					return a.pid - b.pid;
				case "cpu":
					return b.cpu - a.cpu;
				case "mem":
					return b.mem - a.mem;
				case "user":
					return a.user.localeCompare(b.user);
				default:
					return a.pid - b.pid;
			}
		});
	}

	const lines: string[] = [];

	// Add header
	if (!options.noHeaders) {
		if (options.user || (options.all && options.user)) {
			lines.push(
				"USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND"
			);
		} else if (options.format) {
			lines.push("UID        PID  PPID  C STIME TTY          TIME CMD");
		} else if (options.long) {
			lines.push(
				"F S   UID   PID  PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD"
			);
		} else {
			lines.push("  PID TTY          TIME CMD");
		}
	}

	// Format process lines
	for (const proc of filteredProcesses) {
		let line = "";

		if (options.user || (options.all && options.user)) {
			line = `${proc.user.padEnd(8)} ${proc.pid
				.toString()
				.padStart(5)} ${proc.cpu.toFixed(1).padStart(5)} ${proc.mem
				.toFixed(1)
				.padStart(5)} ${proc.vsz.toString().padStart(7)} ${proc.rss
				.toString()
				.padStart(6)} ${proc.tty.padEnd(8)} ${proc.stat.padEnd(
				4
			)} ${proc.start.padEnd(5)} ${proc.time.padEnd(8)} ${proc.cmd}`;
		} else if (options.format) {
			line = `${proc.user.padEnd(8)} ${proc.pid
				.toString()
				.padStart(5)} ${proc.ppid.toString().padStart(6)} 0 ${proc.start.padEnd(
				5
			)} ${proc.tty.padEnd(8)} ${proc.time.padEnd(8)} ${proc.cmd}`;
		} else if (options.long) {
			line = `4 S ${proc.user === "root" ? "0" : "1000"} ${proc.pid
				.toString()
				.padStart(5)} ${proc.ppid
				.toString()
				.padStart(6)} 0  80   0 -     0 -      ${proc.tty.padEnd(
				8
			)} ${proc.time.padEnd(8)} ${proc.cmd}`;
		} else {
			line = `${proc.pid.toString().padStart(5)} ${proc.tty.padEnd(
				12
			)} ${proc.time.padEnd(8)} ${proc.cmd}`;
		}

		lines.push(line);
	}

	return lines.join("\n");
};

/**
 * Handle ps command
 */
export const handlePsCommand = (args: string[]): string => {
	const parseResult = parsePsOptions(args);
	if (parseResult.error) {
		return parseResult.error + "\nTry 'ps --help' for more information.";
	}

	const { options } = parseResult;

	if (options.help) {
		return displayPsHelp();
	}

	if (options.version) {
		return `ps from procps-ng 3.3.17
Platform: Cyberpunk Linux 2077
Usage: ps [options]
Try 'ps --help' for more information.`;
	}

	const processes = getSystemProcesses();
	return formatProcessOutput(processes, options);
};
