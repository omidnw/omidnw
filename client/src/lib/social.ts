/**
 * Shared social and contact links.
 *
 * Single source of truth for the social URLs already used across the site, so
 * the Professional landing page, its menu, and the CyberPunk menu cannot drift
 * apart. Values are the real accounts; nothing here is invented.
 */
export interface SocialLink {
	name: string;
	url: string;
	ariaLabel: string;
}

export const socialLinks: SocialLink[] = [
	{
		name: "GitHub",
		url: "https://github.com/omidnw",
		ariaLabel: "Visit GitHub profile",
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/omid-reza-keshtkar",
		ariaLabel: "Visit LinkedIn profile",
	},
	{
		name: "X",
		url: "https://x.com/omidrezakeshtka",
		ariaLabel: "Visit X profile",
	},
];

export const EMAIL = "omidrezakeshtkar@icloud.com";

/**
 * Résumé file name under client/public/. No such file exists in the repo yet —
 * the download actions point here and will 404 until one is added. No fake
 * document is generated.
 */
export const RESUME_FILENAME = "/Omid-Reza-Keshtkar-Resume.pdf";