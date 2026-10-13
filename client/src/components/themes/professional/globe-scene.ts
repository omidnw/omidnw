import * as THREE from "three";
import { subsolarCoordinates } from "./globe-sun";

const RAD = Math.PI / 180;
const surface = (lon: number, lat: number, radius = 1.004) =>
	new THREE.Vector3(radius * Math.cos(lat * RAD) * Math.sin(lon * RAD), radius * Math.sin(lat * RAD), radius * Math.cos(lat * RAD) * Math.cos(lon * RAD));

function geometry(points: THREE.Vector3[]) {
	return new THREE.BufferGeometry().setFromPoints(points);
}

/** Geographic surface and city lights share one coherent rotating Earth. */
export function createGlobeScene(cities: number[][], surfaceMask: THREE.Texture, compact: boolean, accent: string) {
	const scene = new THREE.Scene();
	const sun = { value: new THREE.Vector3() };
	const sunView = { value: new THREE.Vector3() };
	let solarSecond = -1;
	const presentation = new THREE.Group();
	scene.add(presentation);
	const axis = new THREE.Group();
	axis.rotation.z = -23.4 * RAD;
	presentation.add(axis);
	const earth = new THREE.Group();
	earth.rotation.y = -28 * RAD;
	axis.add(earth);
	const sphereGeometry = new THREE.SphereGeometry(1, compact ? 48 : 80, compact ? 32 : 56);
	// Geography is sampled in longitude/latitude space, so texture and points stay aligned.
	const ocean = new THREE.ShaderMaterial({
		uniforms: { sun, landMask: { value: surfaceMask }, accent: { value: new THREE.Color(accent) } },
		vertexShader: `varying vec3 globePosition; varying vec3 viewNormal;
		void main(){globePosition=position;viewNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
		fragmentShader: `uniform sampler2D landMask; uniform vec3 accent; uniform vec3 sun; varying vec3 globePosition; varying vec3 viewNormal;
		void main(){
		 vec3 p=normalize(globePosition); vec3 n=normalize(viewNormal);
		 vec2 uv=vec2(.5+atan(p.x,p.z)/6.2831853,.5+asin(clamp(p.y,-1.,1.))/3.14159265);
		 vec2 map=texture2D(landMask,uv).rg;
		 float light=smoothstep(-.18,.85,dot(p,sun));
		 float grain=.5+.5*sin(p.x*18.+sin(p.z*13.))*sin(p.y*21.+p.z*11.);
		 vec3 water=mix(vec3(.006,.016,.026),vec3(.016,.043,.058),light);
		 vec3 land=mix(vec3(.024,.049,.056),vec3(.065,.125,.133),light)*(.97+.04*grain);
		 vec3 color=mix(water,land,map.r)+map.g*mix(accent,vec3(.28,.47,.48),.3)*(.065+.105*light);
		 float rim=pow(1.-max(0.,n.z),7.);float horizon=max(0.,dot(p,sun));
		 color+=rim*horizon*vec3(.065,.19,.21);
		 gl_FragColor=vec4(color,1.);
		 #include <colorspace_fragment>
		}`,
	});
	earth.add(new THREE.Mesh(sphereGeometry, ocean));

	// Continuous land shading avoids the high-frequency shimmer of a dense point matrix.

	const grid: THREE.Vector3[] = [];
	for (let lat = -60; lat <= 60; lat += 30)
		for (let lon = -180; lon < 180; lon += 2) grid.push(surface(lon, lat, 1.002), surface(lon + 2, lat, 1.002));
	for (let lon = -180; lon < 180; lon += 30)
		for (let lat = -90; lat < 90; lat += 2) grid.push(surface(lon, lat, 1.002), surface(lon, lat + 2, 1.002));
	earth.add(new THREE.LineSegments(geometry(grid), new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: .065, depthWrite: false })));

	const cityPositions: number[] = [], population: number[] = [];
	for (const [lon, lat, pop] of cities) {
		if (compact && pop < 100000) continue;
		const p = surface(lon, lat, 1.007);
		cityPositions.push(p.x, p.y, p.z);
		// Log population keeps small cities visible without giant metropolitan sprites.
		population.push(THREE.MathUtils.clamp((Math.log10(Math.max(1000,pop))-3)/4.5,0,1));
	}
	const cityGeometry = new THREE.BufferGeometry();
	cityGeometry.setAttribute("position",new THREE.Float32BufferAttribute(cityPositions,3));
	cityGeometry.setAttribute("population",new THREE.Float32BufferAttribute(population,1));
	const cityMaterial = new THREE.ShaderMaterial({
		transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
		uniforms: { sun, pixelRatio: { value: 1 } },
		vertexShader: `attribute float population; uniform float pixelRatio; uniform vec3 sun; varying float intensity; varying float facing; varying float night;
		void main(){night=1.-smoothstep(-.16,.12,dot(normalize(position),sun));intensity=population;vec3 n=normalize(normalMatrix*normalize(position));facing=smoothstep(0.,.16,n.z);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=(1.5+population*3.4)*pixelRatio;}`,
		fragmentShader: `varying float intensity;varying float facing;varying float night;
		void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float core=exp(-d*d*48.);float glow=exp(-d*d*18.)*(1.-smoothstep(.35,.5,d));vec3 warm=mix(vec3(.83,.87,.8),vec3(1.,.79,.52),intensity*.65);vec3 color=mix(warm,vec3(.65,.87,.91),.12*(1.-intensity));gl_FragColor=vec4(color,(core*.65+glow*.16)*(.38+.62*sqrt(intensity))*facing*(.08+.92*night));
		#include <colorspace_fragment>
		}`,
	});
	earth.add(new THREE.Points(cityGeometry,cityMaterial));

	const atmosphere = new THREE.ShaderMaterial({
		transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
		uniforms: { sunView, tint: { value: new THREE.Color(accent) } },
		vertexShader: `varying vec3 n; varying vec3 eye;
		void main(){ vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); eye=normalize(-p.xyz); gl_Position=projectionMatrix*p; }`,
		fragmentShader: `varying vec3 n; varying vec3 eye; uniform vec3 tint; uniform vec3 sunView;
		void main(){ float rim=pow(1.-abs(dot(normalize(n),normalize(eye))),5.); float lit=.16+.84*smoothstep(-.15,.8,dot(normalize(n),sunView)); gl_FragColor=vec4(mix(tint,vec3(.48,.76,.77),.22),rim*lit*.46);
		#include <colorspace_fragment>
		}`,
	});
	presentation.add(new THREE.Mesh(new THREE.SphereGeometry(compact ? 1.012 : 1.018, compact ? 48 : 80, 40), atmosphere));

	const orbits: THREE.LineLoop[] = [];
	for (let i = 0; i < (compact ? 1 : 2); i++) {
		const points = Array.from({ length: 241 }, (_, j) => {
			const t = j / 240 * Math.PI * 2;
			return new THREE.Vector3(Math.cos(t) * 1.37, Math.sin(t) * 1.22, 0);
		});
		const ring = new THREE.LineLoop(geometry(points), new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: .38, depthWrite: false }));
		ring.rotation.set(i ? .65 : 1.18, i ? -.4 : .1, i ? -.6 : .12);
		orbits.push(ring);
		presentation.add(ring);
	}

	const satelliteGeometry = geometry(orbits.map(() => new THREE.Vector3()));
	// Moving vertices need a fixed bound encompassing the entire orbit, not just initial positions.
	satelliteGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.37);
	const satelliteMaterial = new THREE.PointsMaterial({color:"#c7f7f0",size:compact ? 2 : 2.8,sizeAttenuation:false,transparent:true,opacity:.95,depthWrite:false});
	presentation.add(new THREE.Points(satelliteGeometry,satelliteMaterial));
	const satellitePosition = new THREE.Vector3();
	function animate(time: number) {
		const positions = satelliteGeometry.getAttribute("position") as THREE.BufferAttribute;
		orbits.forEach((orbit,i) => {
			const t=time*.035+i*2.3;
			satellitePosition.set(Math.cos(t)*1.37,Math.sin(t)*1.22,0).applyEuler(orbit.rotation);
			positions.setXYZ(i,satellitePosition.x,satellitePosition.y,satellitePosition.z);
		});
		positions.needsUpdate=true;
	}
	animate(0);

	if (!compact) {
		// One restrained great-circle link between actual network endpoints.
		const from = surface(-74,40.7,1).normalize(), to = surface(2.35,48.86,1).normalize();
		const angle = Math.acos(THREE.MathUtils.clamp(from.dot(to),-1,1));
		const arc = Array.from({length:65},(_,i) => {
			const t=i/64;
			return from.clone().multiplyScalar(Math.sin((1-t)*angle)).addScaledVector(to,Math.sin(t*angle)).divideScalar(Math.sin(angle)).multiplyScalar(1.012+.07*Math.sin(t*Math.PI));
		});
		earth.add(new THREE.Line(geometry(arc),new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.18,depthWrite:false})));
	}

	// Decorative network endpoints, with no labels or user-location claim.
	const nodeGeometry = geometry([[-74,40.7], [2.35,48.86], [103.8,1.35], [139.7,35.7], [18.4,-33.9], [-46.6,-23.5]].map(([lon,lat]) => surface(lon,lat,1.012)));
	const nodes = new THREE.ShaderMaterial({
		transparent: true, depthWrite: false,
		uniforms: { time: { value: 0 }, moving: { value: 0 }, tint: { value: new THREE.Color(accent) } },
		vertexShader: `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=12.;}`,
		fragmentShader: `uniform float time; uniform float moving; uniform vec3 tint;
		void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float core=1.-smoothstep(.02,.16,d);float halo=pow(1.-d*2.,3.);float pulse=1.-moving*.12*(1.+sin(time*.8));gl_FragColor=vec4(mix(tint,vec3(.9,1.,.97),core),max(core,halo*.6)*pulse);
		#include <colorspace_fragment>
		}`,
	});
	earth.add(new THREE.Points(nodeGeometry, nodes));
	return {
		scene, presentation, earth, nodes, animate,
		updateSolarLighting(timestamp: number, camera: THREE.Camera) {
			const second = Math.floor(timestamp / 1000);
			if (second !== solarSecond) {
				const location = subsolarCoordinates(timestamp);
				sun.value.copy(surface(location.longitude, location.latitude, 1));
				solarSecond = second;
			}
			// Display rotation never changes which geographic regions are actually in daylight.
			scene.updateMatrixWorld(true);
			camera.updateMatrixWorld();
			sunView.value.copy(sun.value).transformDirection(earth.matrixWorld).transformDirection(camera.matrixWorldInverse);
		},
		setPixelRatio(dpr: number) { cityMaterial.uniforms.pixelRatio.value=dpr; satelliteMaterial.size=(compact ? 2 : 2.8)*dpr; },
		dispose() {
			// The host owns the asynchronously loaded texture and disposes it once.
			scene.traverse(object => {
				const drawable = object as THREE.Mesh;
				drawable.geometry?.dispose();
				if (drawable.material) (Array.isArray(drawable.material) ? drawable.material : [drawable.material]).forEach(material => material.dispose());
			});
		},
	};
}

export { THREE };
