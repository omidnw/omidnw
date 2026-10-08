/**
 * Responsive image helpers.
 *
 * The screenshots in `client/public/images` are large PNGs (1.5–4 MB each)
 * captured at full desktop resolution, and the hero globe is 2.4 MB. Every one of
 * them is displayed far below its native size, so WebP derivatives were generated
 * at the widths actually rendered (4 KB–220 KB instead of 956 KB–4 MB).
 *
 * These helpers only describe those derivatives. The original PNGs are untouched
 * and remain the `<img>` fallback for any client without WebP support.
 */

interface Asset {
	/** Original PNG, kept as the `<img>` src so nothing regresses to a blank box. */
	src: string;
	/** Intrinsic size of the original, so the browser can reserve layout space. */
	width: number;
	height: number;
	/** Basename of the generated WebP derivatives. */
	stem: string;
	/** Rendered widths the derivatives were generated for, smallest first. */
	widths: readonly number[];
}

const ASSETS: Record<string, Asset> = {
	"/images/futuristic-earth.png": {
		src: "/images/futuristic-earth.png",
		width: 1536,
		height: 1024,
		stem: "globe",
		widths: [640, 960, 1280],
	},
	"/images/ork-logo.png": {
		src: "/images/ork-logo.png",
		width: 1774,
		height: 887,
		stem: "ork",
		widths: [96, 192],
	},
	"/images/anime-management.png": {
		src: "/images/anime-management.png",
		width: 2784,
		height: 1826,
		stem: "shot-anime-management",
		widths: [640, 1180],
	},
	"/images/anime-schedule.png": {
		src: "/images/anime-schedule.png",
		width: 3648,
		height: 2190,
		stem: "shot-anime-schedule",
		widths: [640, 1180],
	},
	"/images/room-organizer.png": {
		src: "/images/room-organizer.png",
		width: 3648,
		height: 2190,
		stem: "shot-room-organizer",
		widths: [640, 1180],
	},
	"/images/orbitalnc/orbitalnc-landing.png": {
		src: "/images/orbitalnc/orbitalnc-landing.png",
		width: 3336,
		height: 1882,
		stem: "shot-orbitalnc",
		widths: [640, 1180],
	},
	"/images/orbitalnc/orbitalnc-card.png": {
		src: "/images/orbitalnc/orbitalnc-card.png",
		width: 1296,
		height: 1882,
		stem: "shot-orbitalnc-card",
		widths: [320, 640],
	},
};

export interface PictureSource {
	src: string;
	srcSet: string;
	width: number;
	height: number;
}

const FALLBACK: Asset = {
	src: "",
	width: 1600,
	height: 900,
	stem: "",
	widths: [],
};

/**
 * Build the `src` / `srcSet` / `width` / `height` a responsive `<picture>` needs.
 * Unknown assets pass through untouched, so adding a project without regenerating
 * derivatives still renders from the original file.
 */
export function pictureSource(src: string): PictureSource {
	const asset = ASSETS[src] ?? { ...FALLBACK, src };
	return {
		src: asset.src,
		srcSet: asset.widths.map((w) => `/images/${asset.stem}-${w}.webp ${w}w`).join(", "),
		width: asset.width,
		height: asset.height,
	};
}