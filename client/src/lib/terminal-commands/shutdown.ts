import { TerminalState } from "@/components/CyberpunkTerminal/types";

// Global shutdown state
let pendingShutdown: {
	timeoutId: NodeJS.Timeout | null;
	scheduledTime: Date | null;
	action: "poweroff" | "reboot" | "halt";
	message: string;
} = {
	timeoutId: null,
	scheduledTime: null,
	action: "poweroff",
	message: "",
};

/**
 * Handle shutdown command with Linux-like behavior
 */
export const handleShutdownCommand = (
	args: string,
	terminalState: TerminalState,
	addToHistory: (content: string) => void
): string => {
	const trimmedArgs = args.trim();

	// No arguments - show help
	if (!trimmedArgs) {
		return `Usage: shutdown [OPTIONS] [TIME] [MESSAGE]

DESCRIPTION:
    Schedule system shutdown with optional delay and custom message.

OPTIONS:
    -r, --reboot     Reboot the system instead of shutting down
    -H, --halt       Halt the system (stop without power off)
    -P, --poweroff   Power off the system (default)
    -c               Cancel a pending shutdown
    -k               Send warning message to users without shutting down
    -h, --help       Show this help message

TIME FORMATS:
    now              Shut down immediately
    +m               Shut down in m minutes (e.g., +5)
    hh:mm            Shut down at specific time (24-hour format)

EXAMPLES:
    shutdown now                    # Immediate shutdown
    shutdown +5                     # Shutdown in 5 minutes
    shutdown 23:30                  # Shutdown at 11:30 PM
    shutdown -r now                 # Immediate reboot
    shutdown -c                     # Cancel pending shutdown
    shutdown +10 "Maintenance mode" # Custom message

WARNING: This will actually close the browser tab/window!`;
	}

	const parts = trimmedArgs.split(" ");
	let options: string[] = [];
	let timeArg = "";
	let message = "";
	let action: "poweroff" | "reboot" | "halt" = "poweroff";

	// Parse arguments
	let i = 0;
	while (i < parts.length) {
		const part = parts[i];

		if (part.startsWith("-")) {
			options.push(part);
			if (part === "-r" || part === "--reboot") {
				action = "reboot";
			} else if (part === "-H" || part === "--halt") {
				action = "halt";
			} else if (part === "-P" || part === "--poweroff") {
				action = "poweroff";
			} else if (part === "-c") {
				return cancelShutdown();
			} else if (part === "-k") {
				// Extract message for broadcast
				message = parts
					.slice(i + 2)
					.join(" ")
					.replace(/^["']|["']$/g, "");
				return broadcastMessage(message || "System shutdown scheduled");
			} else if (part === "-h" || part === "--help") {
				return handleShutdownCommand("", terminalState, addToHistory);
			}
		} else if (!timeArg) {
			timeArg = part;
		} else {
			// Rest is message
			message = parts
				.slice(i)
				.join(" ")
				.replace(/^["']|["']$/g, "");
			break;
		}
		i++;
	}

	if (!timeArg) {
		return "Error: Missing time argument.\nUse 'shutdown --help' for usage information.";
	}

	return scheduleShutdown(timeArg, action, message, addToHistory);
};

/**
 * Schedule shutdown with specified time
 */
const scheduleShutdown = (
	timeArg: string,
	action: "poweroff" | "reboot" | "halt",
	message: string,
	addToHistory: (content: string) => void
): string => {
	// Cancel any existing shutdown
	if (pendingShutdown.timeoutId) {
		clearTimeout(pendingShutdown.timeoutId);
	}

	let delayMs = 0;
	let displayTime = "";

	if (timeArg === "now") {
		delayMs = 0;
		displayTime = "immediately";
	} else if (timeArg.startsWith("+")) {
		const minutes = parseInt(timeArg.substring(1));
		if (isNaN(minutes) || minutes < 0) {
			return "Error: Invalid time format. Use +minutes (e.g., +5)";
		}
		delayMs = minutes * 60 * 1000;
		displayTime = `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
	} else if (timeArg.includes(":")) {
		const [hours, mins] = timeArg.split(":").map(Number);
		if (
			isNaN(hours) ||
			isNaN(mins) ||
			hours < 0 ||
			hours > 23 ||
			mins < 0 ||
			mins > 59
		) {
			return "Error: Invalid time format. Use HH:MM (24-hour format)";
		}

		const now = new Date();
		const targetTime = new Date();
		targetTime.setHours(hours, mins, 0, 0);

		// If time has passed today, schedule for tomorrow
		if (targetTime <= now) {
			targetTime.setDate(targetTime.getDate() + 1);
		}

		delayMs = targetTime.getTime() - now.getTime();
		displayTime = `at ${timeArg}`;
	} else {
		return "Error: Invalid time format.\nUse 'now', '+minutes', or 'HH:MM'";
	}

	const scheduledTime = new Date(Date.now() + delayMs);

	// Store shutdown info
	pendingShutdown = {
		timeoutId: null,
		scheduledTime,
		action,
		message: message || `System ${action} scheduled`,
	};

	// Schedule the actual shutdown
	pendingShutdown.timeoutId = setTimeout(() => {
		executeShutdown(action, addToHistory);
	}, delayMs);

	// Start countdown if delay > 0
	if (delayMs > 0) {
		startCountdown(delayMs, action, message, addToHistory);
	} else {
		executeShutdown(action, addToHistory);
		return ""; // No return needed for immediate shutdown
	}

	const actionText =
		action === "reboot" ? "Reboot" : action === "halt" ? "Halt" : "Shutdown";
	let output = `${actionText} scheduled ${displayTime}`;

	if (message) {
		output += `\n\nBroadcast message:\n"${message}"`;
	}

	if (delayMs > 60000) {
		// More than 1 minute
		output += `\n\nTo cancel: shutdown -c`;
	}

	return output;
};

/**
 * Start countdown display
 */
const startCountdown = (
	totalMs: number,
	action: "poweroff" | "reboot" | "halt",
	message: string,
	addToHistory: (content: string) => void
) => {
	const startTime = Date.now();

	const updateCountdown = () => {
		const elapsed = Date.now() - startTime;
		const remaining = Math.max(0, totalMs - elapsed);
		const remainingSeconds = Math.ceil(remaining / 1000);

		if (remainingSeconds <= 0) {
			return;
		}

		// Show warnings at specific intervals
		if (remainingSeconds === 300) {
			// 5 minutes
			addToHistory(`⚠️  WARNING: System ${action} in 5 minutes!`);
		} else if (remainingSeconds === 60) {
			// 1 minute
			addToHistory(`🚨 WARNING: System ${action} in 1 minute!`);
		} else if (remainingSeconds <= 10 && remainingSeconds > 0) {
			// Final 10 seconds
			addToHistory(
				`💀 ${action.toUpperCase()} IN ${remainingSeconds} SECONDS!`
			);
		}

		// Continue countdown if more than 10 seconds left
		if (remainingSeconds > 10) {
			setTimeout(updateCountdown, 1000);
		} else if (remainingSeconds <= 10 && remainingSeconds > 1) {
			setTimeout(updateCountdown, 1000);
		}
	};

	// Start countdown
	setTimeout(updateCountdown, 1000);
};

/**
 * Execute the actual shutdown
 */
const executeShutdown = (
	action: "poweroff" | "reboot" | "halt",
	addToHistory: (content: string) => void
) => {
	let message = "";

	switch (action) {
		case "poweroff":
			message = `💀 SYSTEM SHUTDOWN - POWERING OFF 💀

┌─────────────────────────────────────────┐
│              FAREWELL                   │
│                                         │
│  🔌 Cutting power to neural matrix...  │
│  🖥️  Terminating all processes...      │
│  💾 Saving final state...              │
│                                         │
│     Thanks for using the terminal!     │
└─────────────────────────────────────────┘`;

			addToHistory(message);

			// Actually close the tab/window after a brief delay
			setTimeout(() => {
				// Try multiple methods to close the tab/window
				try {
					// Method 1: Standard window.close()
					window.close();

					// Method 2: If still open, try to trigger browser close event
					setTimeout(() => {
						if (!window.closed) {
							// For some browsers, try dispatching a beforeunload event
							const event = new Event("beforeunload");
							window.dispatchEvent(event);

							// Fallback: navigate to about:blank
							setTimeout(() => {
								if (!window.closed) {
									window.location.href = "about:blank";
								}
							}, 500);
						}
					}, 500);
				} catch (error) {
					console.log("Unable to close window, navigating to blank page");
					window.location.href = "about:blank";
				}
			}, 2000);
			break;

		case "reboot":
			message = `🔄 SYSTEM REBOOT - RESTARTING 🔄

┌─────────────────────────────────────────┐
│              REBOOTING                  │
│                                         │
│  🔄 Restarting neural matrix...        │
│  🧠 Reinitializing processes...        │
│  ⚡ Reloading system...                │
│                                         │
│        See you in a moment!            │
└─────────────────────────────────────────┘`;

			addToHistory(message);

			// Reload the page after a brief delay
			setTimeout(() => {
				window.location.reload();
			}, 2000);
			break;

		case "halt":
			message = `⏹️  SYSTEM HALT - STOPPING ⏹️

┌─────────────────────────────────────────┐
│               HALTED                    │
│                                         │
│  ⏸️  System halted successfully        │
│  🔇 All processes stopped              │
│  🚫 Machine ready for power off        │
│                                         │
│    Manual restart required             │
└─────────────────────────────────────────┘

System halted. Press F5 to restart.`;

			addToHistory(message);
			// For halt, we don't actually close anything, just show the message
			break;
	}

	// Clear the pending shutdown
	pendingShutdown = {
		timeoutId: null,
		scheduledTime: null,
		action: "poweroff",
		message: "",
	};
};

/**
 * Cancel pending shutdown
 */
const cancelShutdown = (): string => {
	if (!pendingShutdown.timeoutId) {
		return "No shutdown scheduled.";
	}

	clearTimeout(pendingShutdown.timeoutId);
	pendingShutdown = {
		timeoutId: null,
		scheduledTime: null,
		action: "poweroff",
		message: "",
	};

	return `✅ Scheduled shutdown cancelled.

System will continue running normally.`;
};

/**
 * Broadcast message without shutting down
 */
const broadcastMessage = (message: string): string => {
	return `📢 BROADCAST MESSAGE TO ALL USERS:

┌─────────────────────────────────────────┐
│              ANNOUNCEMENT               │
├─────────────────────────────────────────┤
│                                         │
│  ${message.padEnd(37)}  │
│                                         │
└─────────────────────────────────────────┘

Message sent to all logged-in users.
(This is a test - no actual shutdown scheduled)`;
};

/**
 * Get current shutdown status
 */
export const getShutdownStatus = (): string | null => {
	if (!pendingShutdown.timeoutId || !pendingShutdown.scheduledTime) {
		return null;
	}

	const now = new Date();
	const remaining = pendingShutdown.scheduledTime.getTime() - now.getTime();

	if (remaining <= 0) {
		return null;
	}

	const minutes = Math.ceil(remaining / 60000);
	return `Shutdown scheduled in ${minutes} minute${minutes !== 1 ? "s" : ""} (${
		pendingShutdown.action
	})`;
};
