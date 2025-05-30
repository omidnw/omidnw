import React, { useState, useRef, useEffect } from "react";
import Map, {
	Marker,
	Source,
	Layer,
	NavigationControl,
	MapRef as ReactMapGlMapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";

// Use the environment variable for the Maptiler API Key
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

interface LocationMarkerInterface {
	longitude: number;
	latitude: number;
	name: string;
	type: "sector" | "node";
	color: string;
}

const locations: LocationMarkerInterface[] = [
	{
		longitude: 55.2708,
		latitude: 25.2048,
		name: "SECTOR_01: Downtown",
		type: "sector",
		color: "cyan",
	},
	{
		longitude: 55.1478,
		latitude: 25.0867,
		name: "SECTOR_02: Marina",
		type: "sector",
		color: "pink",
	},
	{
		longitude: 55.2567,
		latitude: 25.1875,
		name: "SECTOR_03: Business Bay",
		type: "sector",
		color: "yellow",
	},
	{
		longitude: 55.2768,
		latitude: 25.1879,
		name: "SECTOR_04: DIFC",
		type: "sector",
		color: "green",
	},
	{
		longitude: 55.1696,
		latitude: 25.0955,
		name: "NODE_DIC: Internet City",
		type: "node",
		color: "blue",
	},
	{
		longitude: 55.153,
		latitude: 25.0779,
		name: "NODE_JLT: JLT",
		type: "node",
		color: "purple",
	},
];

// Define a basic line layer style for connections
const connectionLineStyle: any = {
	id: "connections",
	type: "line",
	paint: {
		"line-color": "rgba(0, 220, 255, 0.6)", // Neon blue/cyan
		"line-width": 1,
		"line-dasharray": [2, 2],
	},
};

const lineFeatures = locations.slice(0, -1).map((loc, i) => ({
	type: "Feature" as const, // Add 'as const' for stricter typing
	geometry: {
		type: "LineString" as const,
		coordinates: [
			[loc.longitude, loc.latitude],
			[
				locations[(i + 1) % locations.length].longitude,
				locations[(i + 1) % locations.length].latitude,
			], // Connect to next, wrap around for last to first
		],
	},
	properties: {},
}));

const geojsonConnections: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
	type: "FeatureCollection" as const,
	features: lineFeatures,
};

const CyberpunkDubaiMap: React.FC = () => {
	const [initialViewState] = useState({
		longitude: 55.2708,
		latitude: 25.2048,
		zoom: 11,
		pitch: 45,
		bearing: -10,
	});

	const [hoveredMarker, setHoveredMarker] =
		useState<LocationMarkerInterface | null>(null);

	// Define mapStyle using the environment variable
	const mapStyle = `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`;

	// Function to generate the blueprint grid as an SVG data URL
	const getBlueprintGridPattern = (
		lineColor = "rgba(0, 120, 150, 0.3)", // Darker blue for grid
		lineWidth = 0.5,
		cellSize = 20
	) => {
		const svg = `
      <svg width="${cellSize}" height="${cellSize}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprint_grid" width="${cellSize}" height="${cellSize}" patternUnits="userSpaceOnUse">
            <path d="M ${cellSize} 0 L 0 0 0 ${cellSize}" fill="none" stroke="${lineColor}" strokeWidth="${lineWidth}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint_grid)" />
      </svg>
    `;
		return `data:image/svg+xml;base64,${btoa(svg)}`;
	};

	const mapRef = useRef<ReactMapGlMapRef>(null);

	useEffect(() => {
		const map = mapRef.current?.getMap();
		if (map) {
			map.on("load", () => {
				// Only add grid layer if a Maptiler key is provided and the map style seems to be from Maptiler
				const currentMapStyle = map.getStyle();
				const isMaptilerStyle =
					(currentMapStyle?.name &&
						currentMapStyle.name.toLowerCase().includes("maptiler")) ||
					(typeof mapStyle === "string" &&
						mapStyle.toLowerCase().includes("maptiler"));

				if (MAPTILER_KEY && isMaptilerStyle) {
					if (!map.getLayer("blueprint-background-grid")) {
						map.addLayer(
							{
								id: "blueprint-background-grid",
								type: "background",
								paint: {
									"background-pattern": getBlueprintGridPattern(),
								},
							},
							"waterway-label"
						);
					}
				}
			});
		}
	}, [mapRef, MAPTILER_KEY, mapStyle]); // Add mapStyle to dependencies

	if (!MAPTILER_KEY) {
		return (
			<div className="relative h-[300px] md:h-[350px] rounded-lg overflow-hidden border border-yellow-500/50 shadow-inner shadow-yellow-500/30 bg-black flex flex-col items-center justify-center p-4">
				<MapPin className="w-12 h-12 text-yellow-500 mb-4" />
				<p className="text-center font-mono text-yellow-400">
					Map Configuration Error
				</p>
				<p className="text-center font-mono text-xs text-muted-foreground mt-1">
					Maptiler API Key is missing. Please set{" "}
					<code className="bg-muted/50 px-1 py-0.5 rounded text-accent">
						VITE_MAPTILER_API_KEY
					</code>{" "}
					in your{" "}
					<code className="bg-muted/50 px-1 py-0.5 rounded text-accent">
						.env
					</code>{" "}
					file.
				</p>
			</div>
		);
	}

	return (
		<div className="relative h-[300px] md:h-[350px] rounded-lg overflow-hidden border border-blue-500/50 shadow-inner shadow-blue-500/30 bg-black">
			<Map
				ref={mapRef}
				initialViewState={initialViewState}
				style={{ width: "100%", height: "100%" }}
				mapStyle={mapStyle}
			>
				<NavigationControl position="top-right" />

				{/* Render Markers */}
				{locations.map((loc) => (
					<Marker
						key={loc.name}
						longitude={loc.longitude}
						latitude={loc.latitude}
						anchor="center"
					>
						<div
							className="group cursor-pointer"
							onMouseEnter={() => setHoveredMarker(loc)}
							onMouseLeave={() => setHoveredMarker(null)}
						>
							<MapPin
								className={`w-5 h-5 transition-all duration-200 ease-in-out stroke-1
                  ${
										hoveredMarker === loc
											? "scale-150 fill-opacity-80"
											: "fill-opacity-50"
									}
                  text-${loc.color}-400 fill-${loc.color}-500/30`}
							/>
							{hoveredMarker === loc && (
								<div
									className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                             whitespace-nowrap rounded-md bg-background/90 px-2 py-1
                             text-xs font-mono shadow-lg border border-primary/50 text-${loc.color}-400`}
								>
									{loc.name}
									<div
										className="absolute left-1/2 top-full h-0 w-0 transform -translate-x-1/2
                               border-x-4 border-x-transparent border-t-4 border-t-background/90"
									/>
								</div>
							)}
						</div>
					</Marker>
				))}

				{/* Render Connection Lines */}
				<Source id="route-connections" type="geojson" data={geojsonConnections}>
					<Layer {...connectionLineStyle} />
				</Source>

				{/* Technical Annotations & Status (Can be overlaid using absolute positioning if needed) */}
				<div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs font-mono z-20 pointer-events-none">
					<div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
					<div className="w-1.5 h-1.5 bg-green-400 rounded-full absolute left-[1px] top-[1px] transform translate-y-[4px]"></div>
					<span className="text-green-300/80 text-[10px] uppercase">
						GRID_ONLINE
					</span>
				</div>
				<div className="absolute bottom-2 right-2 text-xs font-mono text-blue-300/70 z-20 pointer-events-none text-[10px] uppercase">
					GEO-SIG: DXB_25.2N_55.3E
				</div>
				<div className="absolute top-2 left-2 text-xs font-mono text-purple-400/70 z-20 pointer-events-none text-[10px] uppercase">
					DUBAI_RELAY::ACTIVE
				</div>
			</Map>
		</div>
	);
};

export default CyberpunkDubaiMap;
