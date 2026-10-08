/**
 * Animated circuit-board backdrop.
 *
 * A fixed, non-interactive layer behind all page content. The artwork is SVG
 * and the motion is CSS, so it adds no bundle weight and no dependency.
 *
 * Colours resolve through the theme tokens (`--primary`, `--border`), so the
 * same component reads as neon in CyberPunk and as calm teal in Professional
 * without any per-theme branching.
 */

interface Trace {
	d: string;
	/** Seconds for one full signal pass. */
	duration: number;
	/** Negative delays stagger the signals so they never pulse in unison. */
	delay: number;
}

const TRACES: Trace[] = [
	{ d: "M -40 150 H 300 L 380 70 H 700", duration: 9, delay: 0 },
	{ d: "M -40 150 V 380 L 80 460 H 420", duration: 11, delay: -2.5 },
	{ d: "M 300 330 H 720 L 820 230 H 1180", duration: 8, delay: -1.2 },
	{ d: "M 820 230 V 500 L 920 600 H 1300", duration: 12, delay: -6 },
	{ d: "M 1180 420 H 1460 L 1560 520 V 760", duration: 10, delay: -3.4 },
	{ d: "M 420 740 V 620 L 520 520", duration: 9.5, delay: -7.2 },
	{ d: "M -40 700 H 260 L 360 800 H 700", duration: 13, delay: -4.1 },
	{ d: "M 980 860 H 1260 L 1360 760 H 1620", duration: 9.5, delay: -0.8 },
	{ d: "M 200 980 V 800 L 300 700 H 560", duration: 11.5, delay: -8.6 },
	{ d: "M 700 680 H 980 L 1080 580 H 1380", duration: 10.5, delay: -5.3 },
	{ d: "M 1500 200 V 40", duration: 8.5, delay: -2 },
	{ d: "M 60 520 V 300", duration: 12.5, delay: -9.1 },
];

/** Vias and pads sitting on the trace network. */
const VIAS: Array<[number, number, number]> = [
	[300, 150, 5],
	[380, 70, 4],
	[80, 460, 4],
	[420, 740, 4],
	[720, 330, 5],
	[820, 230, 5],
	[1180, 420, 4],
	[1300, 600, 5],
	[1560, 520, 4],
	[520, 520, 4],
	[360, 800, 5],
	[700, 800, 4],
	[980, 860, 5],
	[1360, 760, 4],
	[300, 700, 4],
	[560, 700, 5],
	[1080, 580, 4],
	[1500, 200, 4],
	[60, 300, 4],
	[200, 980, 5],
];

export default function CircuitBackground() {
	return (
		<div
			aria-hidden="true"
			className="circuit-board pointer-events-none fixed inset-0 z-0 overflow-hidden"
		>
			<svg
				className="h-full w-full"
				viewBox="0 0 1600 1000"
				preserveAspectRatio="xMidYMid slice"
				focusable="false"
			>
				<defs>
					<radialGradient id="circuit-vignette" cx="50%" cy="45%" r="70%">
						<stop offset="0%" stopColor="currentColor" stopOpacity="0.09" />
						<stop offset="55%" stopColor="currentColor" stopOpacity="0.05" />
						<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* Soft wash so the pattern is strongest behind the centre. */}
				<rect width="1600" height="1000" fill="url(#circuit-vignette)" />

				{/* Static copper traces. */}
				<g className="circuit-traces">
					{TRACES.map((trace) => (
						<path key={trace.d} d={trace.d} />
					))}
				</g>

				{/* Vias and pads. */}
				<g className="circuit-vias">
					{VIAS.map(([cx, cy, r]) => (
						<circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
					))}
				</g>

				{/* Signals travelling along the same paths. */}
				<g className="circuit-signals">
					{TRACES.map((trace) => (
						<path
							key={`signal-${trace.d}`}
							d={trace.d}
							style={{
								animationDuration: `${trace.duration}s`,
								animationDelay: `${trace.delay}s`,
							}}
						/>
					))}
				</g>

				{/* Nodes that breathe. */}
				<g className="circuit-nodes">
					{VIAS.filter((_, i) => i % 3 === 0).map(([cx, cy, r]) => (
						<circle
							key={`node-${cx}-${cy}`}
							cx={cx}
							cy={cy}
							r={r * 0.55}
							style={{ animationDelay: `${-(cx % 7) * 0.4}s` }}
						/>
					))}
				</g>
			</svg>
		</div>
	);
}