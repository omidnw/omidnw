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
	};

	return (
		<MusicPlayerContext.Provider value={value}>
			{children}
		</MusicPlayerContext.Provider>
	);
};
