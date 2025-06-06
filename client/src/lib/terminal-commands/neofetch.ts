import { TerminalState } from "@/components/CyberpunkTerminal/types";

/**
 * Generate neofetch output with cyberpunk ASCII art and system information
 */
export const handleNeofetchCommand = (): string => {
	const cyberpunkLogo = `
    ██████╗██╗   ██╗██████╗ ███████╗██████╗ ██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗
   ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔══██╗██║   ██║████╗  ██║██║ ██╔╝
   ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██████╔╝██║   ██║██╔██╗ ██║█████╔╝ 
   ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██╔═══╝ ██║   ██║██║╚██╗██║██╔═██╗ 
   ╚██████╗   ██║   ██████╔╝███████╗██║  ██║██║     ╚██████╔╝██║ ╚████║██║  ██╗
    ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
                              ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
                              ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
                                 ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
                                 ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
                                 ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
                                 ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝`;

	const systemInfo = `
╭─────────────────────────────────────────────────────────────────────────────╮
│ user@omidnw                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ OS              ▶ Cyberpunk Linux 2077 Neural Edition                       │
│ Host            ▶ OMID REZA KESHTKAR Portfolio Matrix                       │
│ Kernel          ▶ Neural-6.6.77-cyberpunk                                   │
│ Uptime          ▶ ${getUptime()}                                            │
│ Packages        ▶ 2077 (npm), 404 (neural-link)                             │
│ Shell           ▶ cyberpunk-zsh 2.077                                       │
│ Resolution      ▶ ${getScreenResolution()}                                  │
│ DE              ▶ Cyberpunk GNOME Neural Interface                          │
│ WM              ▶ Quantum Window Manager                                    │
│ WM Theme        ▶ Night City Neon                                           │
│ Theme           ▶ Cyberpunk-2077-Dark [GTK3]                                │
│ Icons           ▶ Neon-Cyberpunk [GTK3]                                     │
│ Terminal        ▶ Neural Interface Terminal v2.077                          │
│ CPU             ▶ Neural Processing Unit (12) @ 2.077GHz                    │
│ GPU             ▶ Quantum Graphics Processor 2077                           │
│ Memory          ▶ ${getMemoryUsage()}                                       │
│ Disk (/dev/sda1)▶ ${getDiskUsage()}                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔥 NEURAL STATUS                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Matrix Link     ▶ ${getMatrixStatus()}                                      │
│ Quantum State   ▶ ${getQuantumStatus()}                                     │
│ Firewall        ▶ ${getFirewallStatus()}                                    │
│ Encryption      ▶ ${getEncryptionStatus()}                                  │
│ Neural Activity ▶ ${getNeuralActivity()}                                    │
╰─────────────────────────────────────────────────────────────────────────────╯

                    ████████████████████████████████████
                    ███  WELCOME TO THE MATRIX, USER  ███
                    ████████████████████████████████████`;

	return cyberpunkLogo + systemInfo;
};

/**
 * Get system uptime
 */
const getUptime = (): string => {
	const startTime = performance.timeOrigin || Date.now();
	const currentTime = Date.now();
	const uptimeMs = currentTime - startTime;

	const seconds = Math.floor(uptimeMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days}d ${hours % 24}h ${minutes % 60}m`;
	} else if (hours > 0) {
		return `${hours}h ${minutes % 60}m`;
	} else {
		return `${minutes}m ${seconds % 60}s`;
	}
};

/**
 * Get screen resolution
 */
const getScreenResolution = (): string => {
	return `${window.screen.width}x${window.screen.height}`;
};

/**
 * Get memory usage (simulated)
 */
const getMemoryUsage = (): string => {
	const usedMemory = Math.floor(Math.random() * 4 + 8); // 8-12 GB
	const totalMemory = 16;
	const percentage = Math.floor((usedMemory / totalMemory) * 100);
	return `${usedMemory}GiB / ${totalMemory}GiB (${percentage}%)`;
};

/**
 * Get disk usage (simulated)
 */
const getDiskUsage = (): string => {
	const usedDisk = Math.floor(Math.random() * 200 + 300); // 300-500 GB
	const totalDisk = 1000;
	const percentage = Math.floor((usedDisk / totalDisk) * 100);
	return `${usedDisk}G / ${totalDisk}G (${percentage}%)`;
};

/**
 * Get matrix connection status
 */
const getMatrixStatus = (): string => {
	const statuses = [
		"🟢 CONNECTED - Signal Strong",
		"🟡 CONNECTED - Signal Moderate",
		"🟢 CONNECTED - Quantum Stable",
	];
	return statuses[Math.floor(Math.random() * statuses.length)];
};

/**
 * Get quantum processor status
 */
const getQuantumStatus = (): string => {
	const states = [
		"🔮 SUPERPOSITION - All possibilities active",
		"⚛️  ENTANGLED - Quantum coherence maintained",
		"🌌 COLLAPSED - Reality stabilized",
	];
	return states[Math.floor(Math.random() * states.length)];
};

/**
 * Get firewall status
 */
const getFirewallStatus = (): string => {
	const statuses = [
		"🛡️  ACTIVE - Neural barriers online",
		"🔒 SECURED - Quantum encryption enabled",
		"⚡ ENHANCED - Military-grade protection",
	];
	return statuses[Math.floor(Math.random() * statuses.length)];
};

/**
 * Get encryption status
 */
const getEncryptionStatus = (): string => {
	const levels = [
		"🔐 AES-2077 - Quantum-resistant",
		"🗝️  RSA-8192 - Neural enhanced",
		"🔑 QUANTUM - Unbreakable cipher",
	];
	return levels[Math.floor(Math.random() * levels.length)];
};

/**
 * Get neural activity level
 */
const getNeuralActivity = (): string => {
	const activities = [
		"🧠 HIGH - Processing portfolio data",
		"💭 MODERATE - Analyzing user patterns",
		"⚡ PEAK - Maximum cognitive load",
		"🔥 OPTIMAL - Neural pathways synchronized",
	];
	return activities[Math.floor(Math.random() * activities.length)];
};
