import { TerminalState } from "@/components/CyberpunkTerminal/types";

// Global top state for simulation
let topRunning = false;
let topInterval: NodeJS.Timeout | null = null;

/**
 * Display top command help
 */
const displayTopHelp = (): string => {
	return `Usage: top [options]

DESCRIPTION:
    Display Linux processes. Show a dynamic real-time view of running system processes.

COMMAND-LINE Options:
    -h, --help           display this help and exit
    -v, --version        output version information and exit
    -n <number>          number of iterations
    -d <seconds>         delay time interval
    -p <pid>             monitor specific process ID
    -u <user>            monitor specific user
    -H                   show individual threads
    -i                   idle process toggle
    -S                   cumulative time mode toggle

INTERACTIVE COMMANDS (while top is running):
    q                    quit
    <Space>              update display
    h                    help (show this screen)
    k                    kill process
    r                    renice process
    f                    add/remove fields
    F                    choose sort field
    o                    change order of displayed fields
    s                    change delay time
    W                    write configuration file
    
SORTING SHORTCUTS:
    M                    sort by memory usage
    P                    sort by CPU usage
    N                    sort by process ID
    T                    sort by running time
    
DISPLAY TOGGLES:
    I                    toggle idle processes
    S                    toggle cumulative time
    t                    toggle CPU summary info
    m                    toggle memory summary info
    1                    toggle single/separate CPU stats
    
EXAMPLES:
    top                  # start top
    top -n 5             # run 5 iterations and exit
    top -d 2             # update every 2 seconds
    top -u omid          # show only processes for user 'omid'
    top -p 1024          # monitor specific process ID
    
NOTE: In this cyberpunk terminal, top shows a snapshot view.
      Use 'ps' for detailed process listings.`;
};

/**
 * Get system load and memory info
 */
const getSystemInfo = () => {
	const now = new Date();
	const uptime = Math.floor(Math.random() * 86400) + 3600; // Random uptime 1-24 hours
	const users = Math.floor(Math.random() * 5) + 1;

	// Convert uptime to hours:minutes
	const hours = Math.floor(uptime / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);
	const uptimeStr = `${hours}:${minutes.toString().padStart(2, "0")}`;

	// Load averages (simulated)
	const load1 = (Math.random() * 2).toFixed(2);
	const load5 = (Math.random() * 1.8).toFixed(2);
	const load15 = (Math.random() * 1.5).toFixed(2);

	// Memory info (simulated)
	const totalMem = 8388608; // 8GB in KB
	const usedMem = Math.floor(totalMem * (0.3 + Math.random() * 0.4)); // 30-70% used
	const freeMem = totalMem - usedMem;
	const bufferMem = Math.floor(totalMem * 0.05);
	const cacheMem = Math.floor(totalMem * 0.15);

	// Swap info
	const totalSwap = 2097152; // 2GB swap
	const usedSwap = Math.floor(totalSwap * Math.random() * 0.1); // 0-10% used
	const freeSwap = totalSwap - usedSwap;

	return {
		time: now.toTimeString().split(" ")[0],
		uptime: uptimeStr,
		users,
		load: [load1, load5, load15],
		tasks: {
			total: 17,
			running: Math.floor(Math.random() * 3) + 1,
			sleeping: 14,
			stopped: 0,
			zombie: 0,
		},
		cpu: {
			user: (Math.random() * 30).toFixed(1),
			system: (Math.random() * 15).toFixed(1),
			nice: (Math.random() * 2).toFixed(1),
			idle: (60 + Math.random() * 35).toFixed(1),
			wait: (Math.random() * 5).toFixed(1),
			interrupt: (Math.random() * 2).toFixed(1),
			softInterrupt: (Math.random() * 1).toFixed(1),
		},
		memory: {
			total: totalMem,
			used: usedMem,
			free: freeMem,
			buffers: bufferMem,
			cache: cacheMem,
		},
		swap: {
			total: totalSwap,
			used: usedSwap,
			free: freeSwap,
		},
	};
};

/**
 * Get process list with random variations
 */
const getTopProcesses = () => {
	const baseProcesses = [
		{
			pid: 32768,
			user: "omid",
			pr: 20,
			ni: 0,
			res: 126976,
			shr: 45056,
			cmd: "chrome",
			cpu: 5.2 + Math.random() * 3,
			mem: 12.3,
		},
		{
			pid: 65536,
			user: "omid",
			pr: 20,
			ni: 0,
			res: 89088,
			shr: 32768,
			cmd: "chrome --type=renderer",
			cpu: 3.1 + Math.random() * 2,
			mem: 8.7,
		},
		{
			pid: 128,
			user: "root",
			pr: 20,
			ni: 0,
			res: 32768,
			shr: 16384,
			cmd: "neural-matrix",
			cpu: 2.1 + Math.random() * 1,
			mem: 3.2,
		},
		{
			pid: 256,
			user: "omid",
			pr: 20,
			ni: 0,
			res: 25600,
			shr: 12288,
			cmd: "cyberpunk-terminal",
			cpu: 1.8 + Math.random() * 1,
			mem: 2.5,
		},
		{
			pid: 131072,
			user: "root",
			pr: 20,
			ni: 0,
			res: 20480,
			shr: 8192,
			cmd: "matrix-rain",
			cpu: 0.8 + Math.random() * 0.5,
			mem: 2.0,
		},
		{
			pid: 1024,
			user: "omid",
			pr: 20,
			ni: 0,
			res: 41984,
			shr: 20480,
			cmd: "portfolio-api",
			cpu: 0.3 + Math.random() * 0.3,
			mem: 4.1,
		},
		{
			pid: 512,
			user: "root",
			pr: 20,
			ni: 0,
			res: 18432,
			shr: 8192,
			cmd: "quantum-encryption",
			cpu: 0.5 + Math.random() * 0.3,
			mem: 1.8,
		},
		{
			pid: 262144,
			user: "omid",
			pr: 20,
			ni: 0,
			res: 15360,
			shr: 8192,
			cmd: "vim",
			cpu: 0.1 + Math.random() * 0.1,
			mem: 1.5,
		},
		{
			pid: 4096,
			user: "root",
			pr: 20,
			ni: 0,
			res: 12288,
			shr: 6144,
			cmd: "NetworkManager",
			cpu: 0.2 + Math.random() * 0.2,
			mem: 1.2,
		},
		{
			pid: 524288,
			user: "root",
			pr: 20,
			ni: 0,
			res: 11264,
			shr: 5120,
			cmd: "cyber-grid",
			cpu: 0.4 + Math.random() * 0.2,
			mem: 1.1,
		},
		{
			pid: 2048,
			user: "root",
			pr: 20,
			ni: 0,
			res: 8192,
			shr: 4096,
			cmd: "firewall-protocols",
			cpu: 0.1 + Math.random() * 0.1,
			mem: 0.8,
		},
		{
			pid: 8192,
			user: "omid",
			pr: 20,
			ni: 0,
			res: 5120,
			shr: 2048,
			cmd: "bash",
			cpu: 0.0,
			mem: 0.5,
		},
		{
			pid: 1,
			user: "root",
			pr: 20,
			ni: 0,
			res: 7168,
			shr: 3584,
			cmd: "systemd",
			cpu: 0.0,
			mem: 0.1,
		},
	];

	// Add status and sort by CPU usage
	return baseProcesses
		.map((proc) => ({
			...proc,
			status: proc.cpu > 1 ? "R" : "S",
			time: `${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)
				.toString()
				.padStart(2, "0")}.${Math.floor(Math.random() * 100)
				.toString()
				.padStart(2, "0")}`,
		}))
		.sort((a, b) => b.cpu - a.cpu);
};

/**
 * Format memory value to human readable
 */
const formatMemory = (kb: number): string => {
	if (kb < 1024) return `${kb}k`;
	if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)}M`;
	return `${(kb / (1024 * 1024)).toFixed(1)}G`;
};

/**
 * Generate top output
 */
const generateTopOutput = (): string => {
	const sysInfo = getSystemInfo();
	const processes = getTopProcesses();

	const lines: string[] = [];

	// Header line
	lines.push(
		`top - ${sysInfo.time} up ${sysInfo.uptime}, ${
			sysInfo.users
		} users, load average: ${sysInfo.load.join(", ")}`
	);

	// Tasks line
	lines.push(
		`Tasks: ${sysInfo.tasks.total} total, ${sysInfo.tasks.running} running, ${sysInfo.tasks.sleeping} sleeping, ${sysInfo.tasks.stopped} stopped, ${sysInfo.tasks.zombie} zombie`
	);

	// CPU line
	lines.push(
		`%Cpu(s): ${sysInfo.cpu.user}% us, ${sysInfo.cpu.system}% sy, ${sysInfo.cpu.nice}% ni, ${sysInfo.cpu.idle}% id, ${sysInfo.cpu.wait}% wa, ${sysInfo.cpu.interrupt}% hi, ${sysInfo.cpu.softInterrupt}% si`
	);

	// Memory lines
	lines.push(
		`KiB Mem : ${sysInfo.memory.total.toLocaleString()} total, ${sysInfo.memory.free.toLocaleString()} free, ${sysInfo.memory.used.toLocaleString()} used, ${sysInfo.memory.buffers.toLocaleString()} buff/cache`
	);
	lines.push(
		`KiB Swap: ${sysInfo.swap.total.toLocaleString()} total, ${sysInfo.swap.free.toLocaleString()} free, ${sysInfo.swap.used.toLocaleString()} used. ${(
			sysInfo.memory.free + sysInfo.memory.cache
		).toLocaleString()} avail Mem`
	);

	lines.push("");

	// Process header
	lines.push(
		"  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND"
	);

	// Process list
	for (const proc of processes.slice(0, 15)) {
		// Show top 15 processes
		const virt = formatMemory(proc.res + 100000); // Simulate VIRT
		const res = formatMemory(proc.res);
		const shr = formatMemory(proc.shr);

		const line = `${proc.pid.toString().padStart(5)} ${proc.user.padEnd(
			8
		)} ${proc.pr.toString().padStart(3)} ${proc.ni
			.toString()
			.padStart(3)} ${virt.padStart(7)} ${res.padStart(7)} ${shr.padStart(7)} ${
			proc.status
		} ${proc.cpu.toFixed(1).padStart(5)} ${proc.mem
			.toFixed(1)
			.padStart(4)} ${proc.time.padStart(9)} ${proc.cmd}`;
		lines.push(line);
	}

	lines.push("");
	lines.push("🎮 CYBERPUNK LINUX 2077 - Neural Matrix Process Monitor");
	lines.push("💀 Press 'q' to quit, 'h' for help (simulated view)");

	return lines.join("\n");
};

/**
 * Handle top command
 */
export const handleTopCommand = (args: string[]): string => {
	// Parse arguments
	let iterations = -1; // -1 means infinite
	let delay = 3;
	let pid = "";
	let user = "";
	let help = false;
	let version = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "-h" || arg === "--help") {
			help = true;
		} else if (arg === "-v" || arg === "--version") {
			version = true;
		} else if (arg === "-n") {
			if (i + 1 < args.length) {
				iterations = parseInt(args[i + 1]);
				i++;
			}
		} else if (arg === "-d") {
			if (i + 1 < args.length) {
				delay = parseFloat(args[i + 1]);
				i++;
			}
		} else if (arg === "-p") {
			if (i + 1 < args.length) {
				pid = args[i + 1];
				i++;
			}
		} else if (arg === "-u") {
			if (i + 1 < args.length) {
				user = args[i + 1];
				i++;
			}
		} else if (arg.startsWith("-")) {
			return `top: invalid option -- '${arg.substring(1)}'
Usage: top [options]
Try 'top --help' for more information.`;
		}
	}

	if (help) {
		return displayTopHelp();
	}

	if (version) {
		return `top version 3.3.17
Platform: Cyberpunk Linux 2077

Usage: top [options]
Try 'top --help' for complete options.`;
	}

	// In a real terminal, top would be interactive
	// For our cyberpunk terminal, we'll show a snapshot
	let output = generateTopOutput();

	if (user) {
		output += `\n\n🔍 Filtered for user: ${user}`;
	}

	if (pid) {
		output += `\n\n🎯 Monitoring PID: ${pid}`;
	}

	if (iterations > 0) {
		output += `\n\n⏱️  Would run for ${iterations} iteration${
			iterations !== 1 ? "s" : ""
		}`;
	}

	output += `\n\n💡 TIP: In a real Linux system, top is interactive.
   Use 'ps aux' for detailed process information.`;

	return output;
};
