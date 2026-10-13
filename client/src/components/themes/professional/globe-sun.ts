/** Approximate subsolar coordinates from NOAA's solar equations, using UTC only.
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * Longitude is positive east; this calculation needs no user location or network request.
 */
export function subsolarCoordinates(timestamp: number) {
	const date = new Date(timestamp);
	const year = date.getUTCFullYear();
	const days = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
	const day = Math.floor((Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - Date.UTC(year, 0, 1)) / 86400000) + 1;
	const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
	const gamma = 2 * Math.PI / days * (day - 1 + (minutes / 60 - 12) / 24);
	const equation = 229.18 * (.000075 + .001868 * Math.cos(gamma) - .032077 * Math.sin(gamma) - .014615 * Math.cos(2 * gamma) - .040849 * Math.sin(2 * gamma));
	const declination = .006918 - .399912 * Math.cos(gamma) + .070257 * Math.sin(gamma) - .006758 * Math.cos(2 * gamma) + .000907 * Math.sin(2 * gamma) - .002697 * Math.cos(3 * gamma) + .00148 * Math.sin(3 * gamma);
	const longitude = (720 - minutes - equation) / 4;
	return { longitude: ((longitude + 180) % 360 + 360) % 360 - 180, latitude: declination * 180 / Math.PI };
}
