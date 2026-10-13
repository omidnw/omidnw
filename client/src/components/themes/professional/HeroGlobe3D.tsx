import { useEffect, useRef, useState } from "react";
import { pictureSource } from "@/lib/images";

const fallback = pictureSource("/images/futuristic-earth.png");

/** Lazy Three.js import keeps the renderer out of other themes and routes. */
export default function HeroGlobe3D() {
	const host = useRef<HTMLDivElement>(null);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const element = host.current;
		if (!element) return;
		const controller = new AbortController();
		let stopped = false;
		let teardown: (() => void) | undefined;
		let surfaceTexture: import("three").Texture | undefined;
		const disposeTexture = () => { surfaceTexture?.dispose(); surfaceTexture = undefined; };
		async function initialize() {
			try {
				const [{ THREE, createGlobeScene }, cityResponse] = await Promise.all([
					import("./globe-scene"),
					fetch("/data/earth-city-lights.json", { signal: controller.signal }),
				]);
				if (!cityResponse.ok) throw new Error("City data unavailable");
				const cities: unknown = await cityResponse.json();
				if (!Array.isArray(cities) || !cities.every(city => Array.isArray(city) && city.length === 3 && city.every(n => typeof n === "number" && Number.isFinite(n)))) throw new Error("Invalid city data");
				if (stopped) return;
				surfaceTexture = await new THREE.TextureLoader().loadAsync("/data/earth-surface-mask.png");
				surfaceTexture.colorSpace = THREE.NoColorSpace;
				surfaceTexture.wrapS = THREE.RepeatWrapping;
				if (stopped) { disposeTexture(); return; }
				const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
				teardown = () => { renderer.dispose(); renderer.domElement.remove(); };
				renderer.setClearColor(0, 0);
				renderer.domElement.setAttribute("aria-hidden", "true");
				const compact = window.matchMedia("(max-width: 1023px)").matches;
				const accentToken = getComputedStyle(element).getPropertyValue("--primary").trim();
				const accent = accentToken ? `hsl(${accentToken.split(/\s+/).join(",")})` : "#79d2c5";
				const world = createGlobeScene(cities, surfaceTexture, compact, accent);
				teardown = () => { world.dispose(); renderer.dispose(); renderer.domElement.remove(); };
				const camera = new THREE.OrthographicCamera(-1.65, 1.65, 1.1, -1.1, .1, 20);
				camera.position.set(0, .08, 5);
				camera.lookAt(0, 0, 0);
				element.appendChild(renderer.domElement);
				const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
				const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
				let visible = true, frame = 0, previous = 0, elapsed = 0;
				let targetX = 0, targetY = 0;
				let dragPointer: number | null = null;
				let lastX = 0, lastY = 0, lastInteraction = 0;
				let dragYaw = 0, dragPitch = 0;
				const canDrag = () => !motion.matches && finePointer.matches && window.innerWidth >= 768 && renderer.domElement.style.visibility !== "hidden";
				const endDrag = () => {
					if (dragPointer !== null) {
						const pointer = dragPointer; dragPointer = null;
						if (element.hasPointerCapture(pointer)) element.releasePointerCapture(pointer);
						lastInteraction = performance.now();
					}
					renderer.domElement.style.cursor = canDrag() ? "grab" : "";
				};
				const fail = () => {
					cancelAnimationFrame(frame); frame = 0;
					const firstFailure = renderer.domElement.style.visibility !== "hidden";
					renderer.domElement.style.visibility = "hidden";
					if (!stopped && firstFailure) setReady(false);
				};
				renderer.debug.onShaderError = fail;
				const render = () => {
					if (stopped || !visible || document.hidden || renderer.domElement.style.visibility === "hidden") return;
					try { world.updateSolarLighting(Date.now(), camera); renderer.render(world.scene, camera); } catch { fail(); }
				};
				const resize = () => {
					const width = element.clientWidth, height = element.clientHeight;
					if (!width || !height) return;
					const ratio = width / height;
					camera.left = -1.1 * ratio; camera.right = 1.1 * ratio;
					camera.updateProjectionMatrix();
					const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.75);
					renderer.setPixelRatio(dpr); renderer.setSize(width, height);
					world.setPixelRatio(dpr);
					render();
				};
				const tick = (now: number) => {
					frame = 0;
					if (stopped || !visible || document.hidden || motion.matches) return;
					const delta = previous ? Math.min((now - previous) / 1000, .1) : 0;
					previous = now; elapsed += delta;
					// Bound the artistic angle without changing orientation or geographic solar time.
					world.earth.rotation.y = (world.earth.rotation.y + delta * Math.PI * 2 / 120) % (Math.PI * 2);
					// Keep the automatic baseline running; release the manual offset after 10 seconds.
					if (dragPointer === null && lastInteraction && now - lastInteraction >= 10000) {
						dragYaw = dragPitch = 0; targetX = targetY = 0;
						if (Math.abs(world.presentation.rotation.x) + Math.abs(world.presentation.rotation.y) < .001) lastInteraction = 0;
					}
					const blend = 1 - Math.exp(-delta * (dragPointer !== null ? 12 : 3));
					world.presentation.rotation.x += (targetY + dragPitch - world.presentation.rotation.x) * blend;
					world.presentation.rotation.y += (targetX + dragYaw - world.presentation.rotation.y) * blend;
					world.nodes.uniforms.time.value = elapsed;
					world.animate(elapsed);
					render();
					if (renderer.domElement.style.visibility !== "hidden") frame = requestAnimationFrame(tick);
				};
				const synchronize = () => {
					cancelAnimationFrame(frame); frame = 0; previous = 0;
					world.nodes.uniforms.moving.value = motion.matches ? 0 : 1;
					if (dragPointer === null) renderer.domElement.style.cursor = canDrag() ? "grab" : "";
					if (!visible || document.hidden || !canDrag()) endDrag();
					if (!visible || document.hidden) { targetX = targetY = 0; }
					if (motion.matches) { dragYaw = dragPitch = lastInteraction = 0; targetX = targetY = 0; world.presentation.rotation.set(0,0,0); }
					if (visible && !document.hidden) { render(); if (!motion.matches && renderer.domElement.style.visibility !== "hidden") frame = requestAnimationFrame(tick); }
				};
				const move = (event: PointerEvent) => {
					if (!canDrag() || event.pointerType !== "mouse") return;
					if (dragPointer === event.pointerId) {
						dragYaw = THREE.MathUtils.clamp(dragYaw + (event.clientX - lastX) * .006, -Math.PI, Math.PI);
						dragPitch = THREE.MathUtils.clamp(dragPitch + (event.clientY - lastY) * .004, -.45, .45);
						lastX = event.clientX; lastY = event.clientY; lastInteraction = performance.now();
						return;
					}
					if (lastInteraction) return;
					const bounds = element.getBoundingClientRect();
					targetX = ((event.clientX - bounds.left) / bounds.width - .5) * .12;
					targetY = ((event.clientY - bounds.top) / bounds.height - .5) * .08;
				};
				const startDrag = (event: PointerEvent) => {
					if (!canDrag() || event.pointerType !== "mouse" || event.button !== 0 || dragPointer !== null) return;
					event.preventDefault();
					dragPointer = event.pointerId; lastX = event.clientX; lastY = event.clientY;
					lastInteraction = performance.now(); targetX = targetY = 0;
					// Capture keeps dragging predictable even when the mouse leaves the artwork.
					element.setPointerCapture(event.pointerId);
					renderer.domElement.style.cursor = "grabbing";
				};
				const finishDrag = (event: PointerEvent) => { if (event.pointerId === dragPointer) endDrag(); };
				const leave = () => { targetX = targetY = 0; };
				const pointerModeChanged = () => { leave(); endDrag(); };
				const lost = (event: Event) => { event.preventDefault(); endDrag(); fail(); };
				const restored = () => { renderer.domElement.style.visibility = ""; resize(); if (renderer.domElement.style.visibility !== "hidden") setReady(true); synchronize(); };
				const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; synchronize(); });
				const sizing = new ResizeObserver(resize);
				teardown = () => {
					cancelAnimationFrame(frame); observer.disconnect(); sizing.disconnect();
					motion.removeEventListener("change", synchronize);
					finePointer.removeEventListener("change", pointerModeChanged);
					endDrag();
					element.removeEventListener("pointerdown", startDrag);
					element.removeEventListener("pointerup", finishDrag);
					element.removeEventListener("pointercancel", finishDrag);
					element.removeEventListener("lostpointercapture", finishDrag);
					document.removeEventListener("visibilitychange", synchronize);
					element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave);
					renderer.domElement.removeEventListener("webglcontextlost", lost);
					renderer.domElement.removeEventListener("webglcontextrestored", restored);
					world.dispose(); renderer.dispose(); renderer.domElement.remove();
				};
				observer.observe(element); sizing.observe(element);
				motion.addEventListener("change", synchronize);
				finePointer.addEventListener("change", pointerModeChanged);
				element.addEventListener("pointerdown", startDrag);
				element.addEventListener("pointerup", finishDrag);
				element.addEventListener("pointercancel", finishDrag);
				element.addEventListener("lostpointercapture", finishDrag);
				document.addEventListener("visibilitychange", synchronize);
				element.addEventListener("pointermove", move); element.addEventListener("pointerleave", leave);
				renderer.domElement.addEventListener("webglcontextlost", lost);
				renderer.domElement.addEventListener("webglcontextrestored", restored);
				resize();
				if (renderer.domElement.style.visibility !== "hidden") setReady(true);
				synchronize();
			} catch {
				teardown?.(); teardown = undefined; disposeTexture();
				if (!stopped) setReady(false);
			}
		}
		void initialize();
		return () => { stopped = true; controller.abort(); teardown?.(); disposeTexture(); };
	}, []);
	return (
		<div className="pf-globe-3d relative z-10 w-full" aria-hidden="true">
			<picture className="block w-full" style={{ visibility: ready ? "hidden" : "visible" }}>
				<source type="image/webp" srcSet={fallback.srcSet} sizes="(min-width: 1024px) 40rem, (min-width: 640px) 30rem, 26rem" />
				<img {...fallback} alt="" draggable={false} className="pf-globe-img block w-full select-none" />
			</picture>
			<div ref={host} className="absolute inset-0 overflow-hidden" />
		</div>
	);
}
