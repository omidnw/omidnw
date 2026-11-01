// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { startVisibleGlobe } from "./start-visible-globe";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("decorative globe scheduling", () => {
	it("waits for load, paint and visibility, then starts once", () => {
		vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
		const frames: FrameRequestCallback[] = [];
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
		const disconnect = vi.fn();
		vi.stubGlobal("IntersectionObserver", class {
			constructor(callback: typeof notify) { notify = callback; }
			observe() {}
			disconnect = disconnect;
		});
		const start = vi.fn();
		const cancel = startVisibleGlobe(document.body, start);
		expect(frames).toHaveLength(0);
		window.dispatchEvent(new Event("load"));
		frames.shift()!(0);
		expect(start).not.toHaveBeenCalled();
		frames.shift()!(16);
		notify([{ isIntersecting: false }]);
		expect(start).not.toHaveBeenCalled();
		notify([{ isIntersecting: true }]);
		notify([{ isIntersecting: true }]);
		expect(start).toHaveBeenCalledOnce();
		cancel();
	});
	it("does not initialize after unmounting before load", () => {
		vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
		const request = vi.fn();
		vi.stubGlobal("requestAnimationFrame", request);
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		const start = vi.fn();
		startVisibleGlobe(document.body, start)();
		window.dispatchEvent(new Event("load"));
		expect(request).not.toHaveBeenCalled();
		expect(start).not.toHaveBeenCalled();
	});
});
