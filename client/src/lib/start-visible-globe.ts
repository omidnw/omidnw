/** Let critical images/fonts finish and paint before starting decorative WebGL. */
export function startVisibleGlobe(element: Element, start: () => void): () => void {
	let frame = 0;
	let observer: IntersectionObserver | undefined;
	let cancelled = false;
	const observe = () => {
		frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				if (cancelled) return;
				observer = new IntersectionObserver((entries) => {
					if (!cancelled && entries.some((entry) => entry.isIntersecting)) {
						observer?.disconnect();
						cancelled = true;
						start();
					}
				});
				observer.observe(element);
			});
		});
	};
	if (document.readyState === "complete") observe();
	else window.addEventListener("load", observe, { once: true });
	return () => {
		cancelled = true;
		window.removeEventListener("load", observe);
		cancelAnimationFrame(frame);
		observer?.disconnect();
	};
}
