import { TerminalState } from "@/components/CyberpunkTerminal/types";

// Mock services data
const services = {
	"neural-matrix": {
		name: "neural-matrix.service",
		description: "Neural Matrix Interface Service",
		status: "active",
		since: "2025-01-15 14:30:25 UTC",
		pid: 1337,
	},
	"cyberpunk-terminal": {
		name: "cyberpunk-terminal.service",
		description: "Cyberpunk Terminal Interface",
		status: "active",
		since: "2025-01-15 14:30:26 UTC",
		pid: 1338,
	},
	"portfolio-api": {
		name: "portfolio-api.service",
		description: "Portfolio API Backend Service",
		status: "inactive",
		since: "2025-01-15 12:15:30 UTC",
		pid: null,
	},
	"quantum-encryption": {
		name: "quantum-encryption.service",
		description: "Quantum Encryption Protocol",
		status: "active",
		since: "2025-01-15 14:30:27 UTC",
		pid: 1339,
	},
	"firewall-protocols": {
		name: "firewall-protocols.service",
		description: "Advanced Firewall Protection",
		status: "active",
		since: "2025-01-15 14:30:28 UTC",
		pid: 1340,
	},
	NetworkManager: {
		name: "NetworkManager.service",
		description: "Network Manager",
		status: "active",
		since: "2025-01-15 14:30:29 UTC",
		pid: 1341,
	},
};

// Global rescue mode state
let isRescueMode = false;

/**
 * Handle systemctl command
 */
export const handleSystemctlCommand = (
	args: string,
	terminalState: TerminalState
): string => {
	const parts = args.trim().split(/\s+/);
	const [action, serviceName] = parts;

	// In rescue mode, only allow starting NetworkManager
	if (isRescueMode) {
		if (action === "start" && serviceName === "NetworkManager") {
			return handleSystemctlStart(serviceName);
		} else {
			return `🚨 RESCUE MODE ACTIVE 🚨
❌ Network connectivity lost. Only 'systemctl start NetworkManager' is allowed.
💡 Run: systemctl start NetworkManager`;
		}
	}

	if (!action) {
		return `Error: Missing action for systemctl command
Usage: systemctl <action> [service]
Actions: status, start, stop, enable, disable`;
	}

	switch (action.toLowerCase()) {
		case "status":
			return handleSystemctlStatus(serviceName);
		case "start":
			return handleSystemctlStart(serviceName);
		case "stop":
			return handleSystemctlStop(serviceName);
		case "enable":
		case "disable":
			return `Error: systemctl ${action} feature is not available in this cyberpunk terminal environment.
This is a simulated terminal for portfolio demonstration purposes.`;
		default:
			return `Error: Unknown systemctl action: ${action}
Available actions: status, start, stop, enable, disable`;
	}
};

/**
 * Check if system is in rescue mode
 */
export const isSystemInRescueMode = (): boolean => {
	return isRescueMode;
};

/**
 * Force rescue mode state (for localStorage restoration)
 */
export const forceRescueMode = (mode: boolean): void => {
	isRescueMode = mode;
};

/**
 * Get rescue mode prompt
 */
export const getRescueModePrompt = (): string => {
	return "rescue";
};

/**
 * Handle systemctl status command
 */
const handleSystemctlStatus = (serviceName?: string): string => {
	if (!serviceName) {
		// Show all services status
		let output =
			"┌─────────────────────────────────────────────────────────────┐\n";
		output +=
			"│                    SYSTEM SERVICE STATUS                   │\n";
		output +=
			"├─────────────────────────────────────────────────────────────┤\n";

		Object.values(services).forEach((service) => {
			const status =
				service.status === "active" ? "🟢 ACTIVE  " : "🔴 INACTIVE";
			const name = service.name.padEnd(25);
			output += `│ ${status} │ ${name} │ ${service.description
				.substring(0, 20)
				.padEnd(20)} │\n`;
		});

		output +=
			"└─────────────────────────────────────────────────────────────┘\n";
		output +=
			"\nUse 'systemctl status <service-name>' for detailed information.";
		return output;
	}

	// Show specific service status
	const service = services[serviceName as keyof typeof services];
	if (!service) {
		return `Error: Unit ${serviceName}.service could not be found.
Available services: ${Object.keys(services).join(", ")}`;
	}

	const isActive = service.status === "active";
	const statusIcon = isActive ? "🟢" : "🔴";
	const statusColor = isActive ? "ACTIVE" : "INACTIVE";

	return `● ${service.name} - ${service.description}
   Loaded: loaded (/etc/systemd/system/${
			service.name
		}; enabled; vendor preset: enabled)
   Active: ${statusIcon} ${statusColor.toLowerCase()} (running) since ${
		service.since
	}
${
	service.pid
		? `Main PID: ${service.pid} (cyberpunk-service)`
		: "Main PID: (none)"
}
    Tasks: ${isActive ? Math.floor(Math.random() * 5) + 1 : 0} (limit: 4915)
   Memory: ${isActive ? (Math.random() * 50 + 10).toFixed(1) : "0.0"}M
      CPU: ${isActive ? (Math.random() * 2).toFixed(2) : "0.00"}s
   CGroup: /system.slice/${service.name}
           ${
							service.pid
								? `└─${service.pid} /usr/bin/cyberpunk-${serviceName}`
								: ""
						}

${
	service.status === "active"
		? `✅ ${service.name} is running successfully.`
		: `❌ ${service.name} is not running.`
}`;
};

/**
 * Handle systemctl start command
 */
const handleSystemctlStart = (serviceName?: string): string => {
	if (!serviceName) {
		return "Error: Missing service name for start command.";
	}

	const service = services[serviceName as keyof typeof services];
	if (!service) {
		return `Error: Unit ${serviceName}.service could not be found.
Available services: ${Object.keys(services).join(", ")}`;
	}

	if (service.status === "active") {
		return `Service ${service.name} is already active (running).`;
	}

	// Update service status
	service.status = "active";
	service.since =
		new Date().toISOString().replace("T", " ").split(".")[0] + " UTC";
	service.pid = Math.floor(Math.random() * 9000) + 1000;

	// Special handling for NetworkManager recovery
	if (serviceName === "NetworkManager" && isRescueMode) {
		isRescueMode = false;
		return `✅ Started ${service.name} successfully.
🔄 Service is now active and running.

🎉🎉🎉 SYSTEM RECOVERY SUCCESSFUL 🎉🎉🎉
┌─────────────────────────────────────────────────────────────┐
│                  CONNECTION RESTORED                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Network connectivity has been restored                 │
│  🔥 NetworkManager service is UP and running               │
│  🚀 System exiting RESCUE MODE...                          │
│  🌐 All network services are operational                   │
│                                                             │
│  🎯 NORMAL OPERATIONS RESUMED                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

💚 WELCOME BACK TO THE MATRIX 💚`;
	}

	return `✅ Started ${service.name} successfully.
🔄 Service is now active and running.`;
};

/**
 * Handle systemctl stop command
 */
const handleSystemctlStop = (serviceName?: string): string => {
	if (!serviceName) {
		return "Error: Missing service name for stop command.";
	}

	const service = services[serviceName as keyof typeof services];
	if (!service) {
		return `Error: Unit ${serviceName}.service could not be found.
Available services: ${Object.keys(services).join(", ")}`;
	}

	if (service.status === "inactive") {
		return `Service ${service.name} is already inactive (dead).`;
	}

	// Update service status
	service.status = "inactive";
	service.since =
		new Date().toISOString().replace("T", " ").split(".")[0] + " UTC";
	service.pid = null;

	// Special handling for NetworkManager
	if (serviceName === "NetworkManager") {
		isRescueMode = true;
		return `🛑 Stopped ${service.name} successfully.
💤 Service is now inactive.

🚨🚨🚨 CRITICAL SYSTEM ERROR 🚨🚨🚨
┌─────────────────────────────────────────────────────────────┐
│                     HTTP ERROR 503                         │
│               SERVICE TEMPORARILY UNAVAILABLE              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ Network connectivity has been lost                     │
│  🔥 NetworkManager service is DOWN                         │
│  ⚠️  System entering RESCUE MODE...                        │
│                                                             │
│  🆘 EMERGENCY RECOVERY REQUIRED:                           │
│     systemctl start NetworkManager                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

💀 CONNECTION TERMINATED - RESCUE MODE ACTIVATED 💀`;
	}

	return `🛑 Stopped ${service.name} successfully.
💤 Service is now inactive.`;
};
