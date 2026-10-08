import {
	TerminalState,
	TerminalCommands,
} from "@/components/CyberpunkTerminal/types";
import { formatTime } from "@/components/CyberpunkTerminal/utils";

/**
 * Handle whoami command
 */
export const handleWhoamiCommand = (isMac: boolean): string => {
	// Move whoami logic here
	return `┌─────────────────────────────────────────────────────────────┐\n│  USER PROFILE                                               │\n├─────────────────────────────────────────────────────────────┤\n│  Name: Omid Reza Keshtkar                                  │\n│  Role: Full-Stack Developer                                │\n│  GitHub: github.com/omidnw                                 │\n│  LinkedIn: linkedin.com/in/omid-reza-keshtkar             │\n│  X: x.com/omidrezakeshtka                                  │\n└─────────────────────────────────────────────────────────────┘`;
};

/**
 * Handle status command
 */
export const handleStatusCommand = (): string => {
	// The clock belongs to the visitor, not the portfolio owner.

	return `╔═══════════════════════════════════════════════════════════════╗\n║  CONNECTION STATUS MATRIX v2.077                              ║\n╠═══════════════════════════════════════════════════════════════╣\n║                                                               ║\n║  🟢 NEURAL LINK STATUS: ONLINE                               ║\n║  📡 AVAILABILITY: READY FOR NEW PROJECTS                     ║\n║                                                               ║\n║  ┌─────────────────────────────────────────────────────────┐ ║\n║  │  TIME SYNCHRONIZATION MATRIX                            │ ║\n║  ├─────────────────────────────────────────────────────────┤ ║\n║  │  CLIENT_TIME: ${formatTime(new Date()).padEnd(8)}                              │ ║\n║  └─────────────────────────────────────────────────────────┘ ║\n║                                                               ║\n║  ┌─────────────────────────────────────────────────────────┐ ║\n║  │  SYSTEM PERFORMANCE METRICS                            │ ║\n║  ├─────────────────────────────────────────────────────────┤ ║\n║  │  RESPONSE_TIME:         24-48 HOURS                    │ ║\n║  │  DEV_STATUS:            ACTIVE                          │ ║\n║  │  UPTIME:                99.9%                           │ ║\n║  │  NEURAL_BANDWIDTH:      HIGH                            │ ║\n║  └─────────────────────────────────────────────────────────┘ ║\n║                                                               ║\n║  ┌─────────────────────────────────────────────────────────┐ ║\n║  │  CONTACT PROTOCOLS                                      │ ║\n║  ├─────────────────────────────────────────────────────────┤ ║\n║  │  EMAIL:                 ACTIVE                          │ ║\n║  │  LINKEDIN:              MONITORING                      │ ║\n║  │  GITHUB:                ACTIVE                          │ ║\n║  │  DISCORD:               STANDBY                         │ ║\n║  └─────────────────────────────────────────────────────────┘ ║\n║                                                               ║\n╚═══════════════════════════════════════════════════════════════╝`;
};

/**
 * Handle clear command
 */
export const handleClearCommand = (): string => {
	return "CLEAR_TERMINAL";
};

/**
 * Handle exit/quit command
 */
export const handleExitCommand = (): string => {
	return "EXIT_TERMINAL";
};

/**
 * Handle reload command
 */
export const handleReloadCommand = (): string => {
	window.location.reload();
	return "Reloading matrix...";
};
