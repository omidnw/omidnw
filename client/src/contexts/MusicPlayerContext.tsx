import React, {
	createContext,
	useContext,
	useState,
	useRef,
	useEffect,
	useCallback,
	ReactNode,
} from "react";

interface MusicPlayerContextType {
	isPlaying: boolean;
	togglePlayPause: () => void;
	currentTime: number;
	duration: number;
	volume: number;
	setVolume: (volume: number) => void;
	seek: (time: number) => void;
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
	audioSrc: string;
	setAudioSrc: (src: string) => void;
	isMuted: boolean;
	toggleMute: () => void;
	loop: boolean;
	toggleLoop: () => void;
	autoPlay: boolean;
	toggleAutoPlay: () => void;
	attemptAutoplay: () => Promise<boolean>;
	isAutoplaySupported: () => Promise<string>;
}

export const MusicPlayerContext = createContext<
	MusicPlayerContextType | undefined
>(undefined);

export const useMusicPlayer = () => {
	const context = useContext(MusicPlayerContext);
	if (!context) {
		throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
	}
	return context;
};

interface MusicPlayerProviderProps {
	children: ReactNode;
	defaultSrc?: string;
}

const PLAYER_STATE_KEY = "cyberpunkMusicPlayerState";

interface StoredPlayerState {
	src: string;
	currentTime: number;
	isPlaying: boolean;
	volume: number;
	isMuted: boolean;
	loop: boolean;
	autoPlay: boolean;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
	children,
	defaultSrc = "/cyberpunk-music.mp3",
}) => {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [duration, setDuration] = useState(0);

	// --- State Initialization with localStorage ---
	const [audioSrc, setAudioSrc] = useState<string>(() => {
		if (typeof window === "undefined") return defaultSrc;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).src
			: defaultSrc;
	});

	const [isPlaying, setIsPlaying] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).isPlaying
			: false;
	});

	const [currentTime, setCurrentTime] = useState<number>(() => {
		if (typeof window === "undefined") return 0;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).currentTime
			: 0;
	});

	const [volume, setVolumeState] = useState<number>(() => {
		if (typeof window === "undefined") return 1;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).volume
			: 1;
	});

	const [isMuted, setIsMuted] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).isMuted
			: false;
	});

	const [loop, setLoop] = useState<boolean>(() => {
		if (typeof window === "undefined") return true;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).loop
			: true;
	});

	const [autoPlay, setAutoPlay] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const savedState = localStorage.getItem(PLAYER_STATE_KEY);
		return savedState
			? (JSON.parse(savedState) as StoredPlayerState).autoPlay
			: false;
	});
	// --- End State Initialization ---

	// Effect to save state to localStorage whenever relevant values change
	useEffect(() => {
		if (typeof window !== "undefined") {
			const stateToSave: StoredPlayerState = {
				src: audioSrc,
				currentTime,
				isPlaying,
				volume,
				isMuted,
				loop,
				autoPlay,
			};
			localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(stateToSave));
		}
	}, [audioSrc, currentTime, isPlaying, volume, isMuted, loop, autoPlay]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			let audio = audioRef.current;
			if (!audio) {
				audio = new Audio(audioSrc);
				audioRef.current = audio;
			} else if (audio.src !== audioSrc) {
				audio.src = audioSrc;
			}

			audio.loop = loop;
			audio.volume = isMuted ? 0 : volume;
			audio.muted = isMuted;

			const handleLoadedMetadata = () => {
				if (audio) {
					setDuration(audio.duration);
					setIsLoading(false);

					// Restore currentTime from localStorage if available
					const savedState = localStorage.getItem(PLAYER_STATE_KEY);
					if (savedState) {
						const parsedState = JSON.parse(savedState) as StoredPlayerState;
						if (
							parsedState.src === audioSrc &&
							parsedState.currentTime < audio.duration
						) {
							audio.currentTime = parsedState.currentTime;
							setCurrentTime(parsedState.currentTime);
						}
					}

					// Attempt to play if autoPlay is enabled and isPlaying was true in localStorage
					if (autoPlay && isPlaying && audio.paused) {
						audio.play().catch((e) => {
							if (e.name !== "NotAllowedError") {
								setError("Playback failed. Please try again.");
								console.error("Resume playback error:", e);
							} else {
								setError(
									"🔒 Autoplay blocked by browser security policies. " +
										"Modern browsers require user interaction before playing audio to protect users from unwanted sounds. " +
										"Click the play button to start music manually."
								);
								setIsPlaying(false);
							}
						});
					}
				}
			};

			const handleTimeUpdate = () => {
				if (audio) setCurrentTime(audio.currentTime);
			};

			const handlePlay = () => {
				setIsPlaying(true);
				setError(null);
			};
			const handlePause = () => {
				setIsPlaying(false);
			};
			const handleEnded = () => {
				if (audio && !audio.loop) {
					setIsPlaying(false);
					setCurrentTime(0);
				}
			};
			const handleError = () => {
				if (audio && audio.error) {
					const errorMsg = `Code: ${audio.error.code}, Message: ${audio.error.message}`;
					console.error("[MusicPlayerContext] Audio Error:", errorMsg);
					if (audio.error.code !== 4) {
						setError(`Audio Error: ${errorMsg}`);
					}
					setIsLoading(false);
				} else {
					console.error("[MusicPlayerContext] Unknown audio error occurred.");
					setError("An unknown audio error occurred.");
					setIsLoading(false);
				}
			};
			const handleCanPlay = () => {
				setIsLoading(false);
			};
			const handleWaiting = () => {
				setIsLoading(true);
			};

			audio.addEventListener("loadedmetadata", handleLoadedMetadata);
			audio.addEventListener("timeupdate", handleTimeUpdate);
			audio.addEventListener("play", handlePlay);
			audio.addEventListener("pause", handlePause);
			audio.addEventListener("ended", handleEnded);
			audio.addEventListener("error", handleError);
			audio.addEventListener("canplay", handleCanPlay);
			audio.addEventListener("waiting", handleWaiting);

			if (audio.readyState >= 2) {
				handleLoadedMetadata();
			} else {
				setIsLoading(true);
				audio.load();
			}

			return () => {
				if (audio) {
					audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
					audio.removeEventListener("timeupdate", handleTimeUpdate);
					audio.removeEventListener("play", handlePlay);
					audio.removeEventListener("pause", handlePause);
					audio.removeEventListener("ended", handleEnded);
					audio.removeEventListener("error", handleError);
					audio.removeEventListener("canplay", handleCanPlay);
					audio.removeEventListener("waiting", handleWaiting);
				}
			};
		}
		return () => {};
	}, [audioSrc, autoPlay]);

	// Effect to reactively update audio properties when React state changes
	useEffect(() => {
		if (audioRef.current) {
			if (audioRef.current.loop !== loop) {
				audioRef.current.loop = loop;
			}
			const targetVolume = isMuted ? 0 : volume;
			if (audioRef.current.volume !== targetVolume) {
				audioRef.current.volume = targetVolume;
			}
			if (audioRef.current.muted !== isMuted) {
				audioRef.current.muted = isMuted;
			}
		}
	}, [loop, volume, isMuted]);

	const togglePlayPause = useCallback(() => {
		if (audioRef.current) {
			const audio = audioRef.current;
			if (audio.paused && !isPlaying) {
				audio.play().catch((e) => {
					if (e.name !== "NotAllowedError") {
						setError("Playback failed. User interaction may be required.");
						console.error("Playback error:", e);
					} else {
						setError(
							"🔒 Browser autoplay policy prevents automatic playback. " +
								"This is a security feature to protect users from unwanted audio. " +
								"Please click play to start the music."
						);
					}
					setIsPlaying(false);
				});
			} else {
				audio.pause();
			}
		}
	}, [isPlaying]);

	const setVolume = useCallback(
		(newVolume: number) => {
			const clampedVolume = Math.max(0, Math.min(1, newVolume));
			setVolumeState(clampedVolume);
			if (clampedVolume > 0 && isMuted) {
				setIsMuted(false);
			} else if (clampedVolume === 0 && !isMuted) {
				setIsMuted(true);
			}
		},
		[isMuted]
	);

	const seek = useCallback(
		(time: number) => {
			if (audioRef.current && duration > 0) {
				const newTime = Math.max(0, Math.min(duration, time));
				audioRef.current.currentTime = newTime;
				setCurrentTime(newTime);
			}
		},
		[duration]
	);

	const toggleMute = useCallback(() => {
		setIsMuted((prevMuted) => {
			const newMutedState = !prevMuted;
			if (audioRef.current) {
				audioRef.current.muted = newMutedState;
				if (!newMutedState && audioRef.current.volume === 0 && volume === 0) {
					setVolumeState(0.5);
					audioRef.current.volume = 0.5;
				}
			}
			return newMutedState;
		});
	}, [volume]);

	const toggleLoop = useCallback(() => {
		setLoop((prevLoop) => !prevLoop);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const contextSetAudioSrc = useCallback((src: string) => {
		if (audioRef.current && audioRef.current.src !== src) {
			setIsPlaying(false);
			setCurrentTime(0);
			setDuration(0);
			setIsLoading(true);
			setError(null);
			setAudioSrc(src);

			if (typeof window !== "undefined") {
				const savedState = localStorage.getItem(PLAYER_STATE_KEY);
				if (savedState) {
					const parsedState = JSON.parse(savedState) as StoredPlayerState;
					parsedState.currentTime = 0;
					parsedState.isPlaying = false;
					parsedState.src = src;
					localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(parsedState));
				}
			}
		}
	}, []);

	const toggleAutoPlay = useCallback(() => {
		setAutoPlay((prevAutoPlay) => !prevAutoPlay);
	}, []);

	// Advanced autoplay detection using Navigator.getAutoplayPolicy if available
	const isAutoplaySupported = useCallback(async (): Promise<string> => {
		if (typeof window === "undefined") return "unknown";

		// Use the modern Navigator.getAutoplayPolicy API if available
		if ("getAutoplayPolicy" in navigator) {
			try {
				const policy = (navigator as any).getAutoplayPolicy("mediaelement");
				return policy; // Returns: "allowed", "allowed-muted", or "disallowed"
			} catch (error) {
				console.warn("getAutoplayPolicy failed:", error);
			}
		}

		// Fallback: try to play a silent audio element to test autoplay support
		try {
			const testAudio = new Audio();
			testAudio.volume = 0;
			testAudio.muted = true;
			testAudio.src =
				"data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // Silent audio
			const playPromise = testAudio.play();

			if (playPromise) {
				await playPromise;
				testAudio.pause();
				testAudio.remove?.();
				return "allowed-muted";
			}
		} catch (error) {
			return "disallowed";
		}

		return "unknown";
	}, []);

	// Attempt to play with various fallback strategies
	const attemptAutoplay = useCallback(async (): Promise<boolean> => {
		if (!audioRef.current) return false;

		const audio = audioRef.current;

		try {
			// Strategy 1: Try muted autoplay first
			const originalVolume = audio.volume;
			const originalMuted = audio.muted;

			audio.muted = true;
			audio.volume = 0;

			const playPromise = audio.play();
			if (playPromise) {
				await playPromise;

				// If muted autoplay works, gradually unmute if user preference allows
				if (!isMuted && volume > 0) {
					setTimeout(() => {
						if (audio && !audio.paused) {
							audio.muted = originalMuted;
							audio.volume = originalVolume;
						}
					}, 1000); // Wait 1 second before unmuting
				}

				return true;
			}
		} catch (error: any) {
			console.warn("Autoplay attempt failed:", error.name);

			// Strategy 2: Set up interaction-based autoplay
			if (error.name === "NotAllowedError") {
				const interactionHandler = () => {
					if (audioRef.current && autoPlay) {
						audioRef.current.play().catch(console.warn);
					}
					// Remove listeners after first interaction
					document.removeEventListener("click", interactionHandler);
					document.removeEventListener("keydown", interactionHandler);
					document.removeEventListener("touchstart", interactionHandler);
				};

				// Wait for any user interaction
				document.addEventListener("click", interactionHandler, {
					once: true,
					passive: true,
				});
				document.addEventListener("keydown", interactionHandler, {
					once: true,
					passive: true,
				});
				document.addEventListener("touchstart", interactionHandler, {
					once: true,
					passive: true,
				});
			}
		}

		return false;
	}, [isMuted, volume, autoPlay]);

	const value = {
		isPlaying,
		togglePlayPause,
		currentTime,
		duration,
		volume,
		setVolume,
		seek,
		isLoading,
		error,
		clearError,
		audioSrc,
		setAudioSrc: contextSetAudioSrc,
		isMuted,
		toggleMute,
		loop,
		toggleLoop,
		autoPlay,
		toggleAutoPlay,
		attemptAutoplay,
		isAutoplaySupported,
	};

	return (
		<MusicPlayerContext.Provider value={value}>
			{children}
		</MusicPlayerContext.Provider>
	);
};
