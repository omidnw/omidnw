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

const CyberpunkDubaiMap: React.FC = () => {
	const [initialViewState] = useState({
		longitude: 55.2708,
		latitude: 25.2048,
		zoom: 11,
		pitch: 45,
		bearing: -10,
	});

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
