/**
 * Shared navigation content.
 *
 * Single source of truth for the site navigation. Every theme header imports
 * this array, so nav labels and paths are declared once.
 */
export interface NavItem {
	name: string;
	path: string;
}

export const navigationItems: NavItem[] = [
	{ name: "Home", path: "/" },
	{ name: "Work", path: "/projects" },
	{ name: "Blog", path: "/blog" },
	{ name: "About", path: "/about" },
	{ name: "Contact", path: "/contact" },
];

/**
 * A nav item is active when the current location is the item path, or a
 * nested route beneath it. `/` would otherwise match every path, so the root
 * item is matched exactly.
 */
export const isNavItemActive = (pathname: string, path: string): boolean =>
	path === "/" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);