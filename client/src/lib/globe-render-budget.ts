/** Lower decorative rendering cost only after sustained slow frame submissions. */
export class GlobeRenderBudget {
	private warmup = 2;
	private frames = 0;
	private elapsed = 0;
	constructor(public pixelRatio: number, public frameInterval: number) {}
	observe(duration: number): boolean {
		if (!Number.isFinite(duration) || duration < 0) return false;
		if (this.warmup > 0) { this.warmup--; return false; }
		this.frames++;
		this.elapsed += duration;
		if (this.frames < 12) return false;
		const slow = this.elapsed / this.frames > 16;
		this.frames = this.elapsed = 0;
		if (!slow) return false;
		const ratio = Math.min(this.pixelRatio, Math.max(0.75, this.pixelRatio - 0.25));
		const interval = Math.max(this.frameInterval, 50);
		const changed = ratio !== this.pixelRatio || interval !== this.frameInterval;
		this.pixelRatio = ratio;
		this.frameInterval = interval;
		return changed;
	}
}
