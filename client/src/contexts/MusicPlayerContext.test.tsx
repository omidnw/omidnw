// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MusicPlayerProvider, useMusicPlayer } from "./MusicPlayerContext";

const players: FakeAudio[] = [];
class FakeAudio extends EventTarget {
	src = "";
	preload = "auto";
	paused = true;
	loop = false;
	volume = 1;
	muted = false;
	duration = 180;
	currentTime = 0;
	readyState = 0;
	error = null;
	load = vi.fn();
	play = vi.fn(async () => {
		this.paused = false;
		this.dispatchEvent(new Event("play"));
	});
	pause = vi.fn(() => {
		this.paused = true;
		this.dispatchEvent(new Event("pause"));
	});
	constructor() { super(); players.push(this); }
}

beforeEach(() => {
	localStorage.clear();
	players.length = 0;
	vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("music loads when requested", () => {
	it("leaves idle music unloaded and lets the visitor press play", async () => {
		const { result } = renderHook(useMusicPlayer, { wrapper: MusicPlayerProvider });
		expect(players[0].preload).toBe("none");
		expect(players[0].load).not.toHaveBeenCalled();
		expect(players[0].play).not.toHaveBeenCalled();
		expect(result.current.isLoading).toBe(false);
		await act(async () => result.current.togglePlayPause());
		expect(players[0].preload).toBe("auto");
		expect(players[0].play).toHaveBeenCalledOnce();
		expect(result.current.isPlaying).toBe(true);
		act(() => players[0].dispatchEvent(new Event("canplay")));
		expect(result.current.isLoading).toBe(false);
	});
	it("continues a saved autoplay session and restores its playback position", async () => {
		localStorage.setItem("cyberpunkMusicPlayerState", JSON.stringify({ src: "/cyberpunk-music.mp3", currentTime: 42, isPlaying: true, volume: 0.5, isMuted: false, loop: true, autoPlay: true }));
		const { result } = renderHook(useMusicPlayer, { wrapper: MusicPlayerProvider });
		expect(players[0].preload).toBe("auto");
		expect(players[0].load).toHaveBeenCalledOnce();
		await act(async () => players[0].dispatchEvent(new Event("loadedmetadata")));
		expect(players[0].currentTime).toBe(42);
		expect(players[0].play).toHaveBeenCalledOnce();
		expect(result.current.duration).toBe(180);
	});
	it("keeps the controls usable if playback is denied", async () => {
		const { result } = renderHook(useMusicPlayer, { wrapper: MusicPlayerProvider });
		players[0].play.mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"));
		await act(async () => result.current.togglePlayPause());
		expect(result.current.isLoading).toBe(false);
		expect(result.current.isPlaying).toBe(false);
		expect(result.current.error).toContain("autoplay policy");
	});
});
