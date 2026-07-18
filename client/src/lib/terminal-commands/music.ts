interface MusicPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	loop: boolean;
	audioSrc: string;
}

export function formatTime(seconds: number): string {
	if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatPercentage(value: number): string {
	return `${Math.round(value * 100)}%`;
}

export function createProgressBar(
	current: number,
	total: number,
	width: number = 30
): string {
	if (!isFinite(total) || total === 0) return "─".repeat(width);
	const progress = Math.min(current / total, 1);
	const filled = Math.round(progress * width);
	const empty = width - filled;
	return "█".repeat(filled) + "─".repeat(empty);
}

export function createVolumeBar(volume: number, width: number = 20): string {
	const filled = Math.round(volume * width);
	const empty = width - filled;
	return "▓".repeat(filled) + "░".repeat(empty);
}

export function generateMusicTUI(state: MusicPlayerState): string {
	const { isPlaying, currentTime, duration, volume, isMuted, loop, audioSrc } =
		state;

	const songName =
		audioSrc
			.split("/")
			.pop()
			?.replace(/\.\w+$/, "") || "Unknown";
	const progressBar = createProgressBar(currentTime, duration, 40);
	const volumeBar = createVolumeBar(isMuted ? 0 : volume, 20);
	const status = isPlaying ? "▶ PLAYING" : "⏸ PAUSED";
	const loopStatus = loop ? "🔁 ON" : "  OFF";
	const muteStatus = isMuted ? "🔇 MUTED" : "🔊";

	return `
╔═══════════════════════════════════════════════════════════════╗
║              🎵 CYBERPUNK MUSIC PLAYER 🎵                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Now Playing: ${songName.padEnd(45).substring(0, 45)} ║
║                                                               ║
║  Status: ${status.padEnd(50)}║
║                                                               ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ ${progressBar} │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  Time: ${formatTime(currentTime)} / ${formatTime(duration)}${" ".padEnd(35)}║
║                                                               ║
║  Volume: ${muteStatus} ${volumeBar} ${formatPercentage(
		isMuted ? 0 : volume
	)}${" ".padEnd(10)}║
║                                                               ║
║  Loop: ${loopStatus}${" ".padEnd(50)}║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║  Commands:                                                    ║
║    music play         - Resume playback                      ║
║    music pause        - Pause playback                       ║
║    music stop         - Stop and reset to beginning          ║
║    music status       - Show this player                     ║
║    music volume <n>   - Set volume (0-100)                   ║
║    music mute         - Toggle mute                          ║
║    music loop         - Toggle loop                          ║
║    man music          - Full documentation                   ║
╚═══════════════════════════════════════════════════════════════╝`;
}

export function handleMusicCommand(
	args: string[],
	getMusicPlayerState: () => MusicPlayerState | null
): string {
	if (args.length === 0 || args[0] === "status") {
		const state = getMusicPlayerState();
		if (!state) {
			return "Error: Music player not available. Make sure the music player is initialized.";
		}
		return generateMusicTUI(state);
	}

	const subcommand = args[0].toLowerCase();

	switch (subcommand) {
		case "play":
			return "MUSIC_PLAY";
		case "pause":
			return "MUSIC_PAUSE";
		case "stop":
			return "MUSIC_STOP";
		case "mute":
			return "MUSIC_MUTE";
		case "loop":
			return "MUSIC_LOOP";
		case "volume": {
			if (args.length < 2) {
				return "Usage: music volume <0-100>\nExample: music volume 50";
			}
			const vol = parseInt(args[1]);
			if (isNaN(vol) || vol < 0 || vol > 100) {
				return "Error: Volume must be a number between 0 and 100";
			}
			return `MUSIC_VOLUME:${vol}`;
		}
		case "help":
			return `Music Player Commands:
  music                 - Show player status (TUI)
  music status          - Show player status (TUI)
  music play            - Resume/start playback
  music pause           - Pause playback
  music stop            - Stop and reset to beginning
  music volume <0-100>  - Set volume level
  music mute            - Toggle mute on/off
  music loop            - Toggle loop on/off
  man music             - Show detailed manual

Examples:
  music play            # Start playing
  music volume 75       # Set volume to 75%
  music mute            # Mute the audio`;
		default:
			return `Unknown music command: ${subcommand}
Type 'music help' or 'man music' for usage information.`;
	}
}

export function generateMusicManPage(): string {
	return `MUSIC(1)                    User Commands                    MUSIC(1)

NAME
       music - control the cyberpunk music player

SYNOPSIS
       music [COMMAND] [OPTIONS]

DESCRIPTION
       The music command provides terminal-based control of the integrated
       cyberpunk music player. It supports playback control, volume
       management, and displays a real-time TUI (Text User Interface)
       showing the current player state.

COMMANDS
       (no command), status
              Display the music player TUI with current status, including
              playback state, progress bar, volume level, and available
              controls.

       play   Resume or start music playback. If music is stopped, it will
              start from the beginning or last saved position.

       pause  Pause the currently playing music. The playback position is
              preserved and can be resumed with 'music play'.

       stop   Stop playback and reset the playback position to the
              beginning (00:00). This is different from pause as it
              resets the timeline.

       volume LEVEL
              Set the volume level where LEVEL is a number between 0 and
              100. Examples:
                music volume 0      # Mute (same as 'music mute')
                music volume 50     # Set to 50%
                music volume 100    # Maximum volume

       mute   Toggle mute on/off. When muted, volume is set to 0 but the
              previous volume level is remembered and restored when
              unmuted.

       loop   Toggle loop mode on/off. When enabled, the music will
              automatically restart from the beginning when it reaches the
              end.

       help   Display a quick reference of available commands.

TUI DISPLAY
       The Text User Interface shows:
         • Current song/track name
         • Playback status (PLAYING/PAUSED)
         • Progress bar with visual representation
         • Current time and total duration
         • Volume level with visual bar
         • Loop status
         • Mute status
         • Available commands

PLAYBACK STATES
       ▶ PLAYING
              Music is currently playing.

       ⏸ PAUSED
              Music is paused. Use 'music play' to resume.

       ⏹ STOPPED
              Music is stopped at position 00:00.

VOLUME CONTROL
       Volume ranges from 0 to 100:
         • 0-20:   Very quiet
         • 21-40:  Quiet
         • 41-60:  Medium
         • 61-80:  Loud
         • 81-100: Very loud

       The volume bar is displayed as: 🔊 ▓▓▓▓▓▓░░░░░░░░░░░░░░ 30%

EXAMPLES
       Show player status:
         $ music
         $ music status

       Control playback:
         $ music play       # Start playing
         $ music pause      # Pause
         $ music stop       # Stop and reset

       Adjust volume:
         $ music volume 75  # Set to 75%
         $ music mute       # Mute/unmute

       Toggle features:
         $ music loop       # Enable/disable loop

KEYBOARD SHORTCUTS
       While the terminal is open:
         • Type 'music' to check status
         • Use up/down arrows to recall previous commands
         • Press Tab for command completion

PERSISTENCE
       The music player state is automatically saved:
         • Last playback position
         • Volume level
         • Mute state
         • Loop setting
       
       These settings are restored when you return to the site.

NOTES
       • The music player runs in the background even when the terminal
         is closed
       • Browser autoplay policies may prevent automatic playback on
         page load
       • Some browsers require user interaction before playing audio

SEE ALSO
       help(1), neofetch(1), systemctl(1)

AUTHOR
       Cyberpunk Terminal Music System
       Part of the omidnw portfolio terminal

VERSION
       1.0.0

CYBERPUNK TERMINAL              2025                          MUSIC(1)`;
}
