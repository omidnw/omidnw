// SEO Configuration and Utilities for OmidReza Keshtkar's Cyberpunk Portfolio
export interface SEOData {
	title: string;
	description: string;
	keywords: string[];
	canonicalUrl?: string;
	ogImage?: string;
	twitterImage?: string;
	type?: "website" | "article" | "profile";
	structuredData?: any;
}

// Base SEO configuration
export const BASE_SEO = {
	siteName: "Omid Reza Keshtkar - Cyberpunk Developer Portfolio",
	siteUrl: "https://omidrezakeshtkar.dev", // Update with your actual domain
	author: "Omid Reza Keshtkar",
	defaultImage: "/images/og-image.jpg", // You'll need to add this image
	twitterHandle: "@omidnw",
	locale: "en_US",
};

// Page-specific SEO configurations
export const SEO_CONFIGS: Record<string, SEOData> = {
	home: {
		title: "Omid Reza Keshtkar | Cyberpunk Software QA & Full Stack Developer",
		description:
			"Cyberpunk-inspired portfolio of OmidReza Keshtkar, Software QA Engineer and Full Stack Developer from Dubai. Explore cutting-edge web experiences, AI projects, and neural network innovations.",
		keywords: [
			"OmidReza Keshtkar",
			"Omid Reza Keshtkar",
			"cyberpunk developer",
			"software QA engineer",
			"full stack developer",
			"Dubai developer",
			"TypeScript developer",
			"React developer",
			"cyberpunk portfolio",
			"neural network",
			"AI developer",
			"web developer",
			"software engineer",
			"cyberpunk 2077 style",
			"neon portfolio",
			"futuristic portfolio",
		],
		type: "profile",
		structuredData: {
			"@context": "https://schema.org",
			"@type": "Person",
			name: "OmidReza Keshtkar",
			alternateName: "Omid Reza Keshtkar",
			jobTitle: ["Software QA Engineer", "Full Stack Developer"],
			worksFor: {
				"@type": "Organization",
				name: "Troweb Inc.",
				address: {
					"@type": "PostalAddress",
					addressLocality: "Dubai",
					addressCountry: "UAE",
				},
			},
			address: {
				"@type": "PostalAddress",
				addressLocality: "Dubai",
				addressCountry: "UAE",
			},
			url: BASE_SEO.siteUrl,
			sameAs: [
				"https://github.com/omidrezakeshtkar",
				"https://github.com/omidnw",
				"https://www.linkedin.com/in/omid-reza-keshtkar",
				"https://gitlab.com/omidrezakeshtkar",
				"https://gitlab.com/omidnw",
			],
			knowsAbout: [
				"Software Quality Assurance",
				"Full Stack Development",
				"TypeScript",
				"React",
				"Node.js",
				"Playwright Testing",
				"Cyberpunk Design",
				"AI Development",
			],
		},
	},
	about: {
		title: "About OmidReza Keshtkar | Cyberpunk Developer from Dubai",
		description:
			"Learn about OmidReza Keshtkar's journey from Tehran to Dubai as a Software QA Engineer and Full Stack Developer. Discover his cyberpunk-inspired approach to technology and innovation.",
		keywords: [
			"OmidReza Keshtkar biography",
			"Omid Reza Keshtkar about",
			"Dubai software developer",
			"Iranian developer Dubai",
			"cyberpunk developer story",
			"Troweb Inc developer",
			"software QA engineer background",
			"full stack developer experience",
			"Shamsipour Technical College",
			"Veresk Rail Cars developer",
		],
		type: "profile",
	},
	projects: {
		title: "Cyberpunk Projects by OmidReza Keshtkar | Developer Portfolio",
		description:
			"Explore cutting-edge cyberpunk projects and digital innovations by OmidReza Keshtkar. From AI applications to web development, discover futuristic coding experiences.",
		keywords: [
			"OmidReza Keshtkar projects",
			"cyberpunk web projects",
			"developer portfolio projects",
			"AI projects",
			"full stack projects",
			"TypeScript projects",
			"React applications",
			"cyberpunk design projects",
			"neural network projects",
			"innovative web development",
		],
		type: "website",
		structuredData: {
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: "OmidReza Keshtkar's Projects",
			description:
				"A collection of cyberpunk-inspired software projects and innovations",
			author: {
				"@type": "Person",
				name: "OmidReza Keshtkar",
			},
		},
	},
	blog: {
		title: "Cyberpunk Developer Blog | OmidReza Keshtkar's Tech Insights",
		description:
			"Neural transmissions from the digital frontier. Read OmidReza Keshtkar's insights on cyberpunk development, AI, full stack technologies, and the future of coding.",
		keywords: [
			"OmidReza Keshtkar blog",
			"cyberpunk developer blog",
			"tech blog Dubai",
			"AI development blog",
			"full stack development insights",
			"cyberpunk programming",
			"developer thoughts",
			"technology trends",
			"coding tutorials",
			"software development blog",
		],
		type: "website",
		structuredData: {
			"@context": "https://schema.org",
			"@type": "Blog",
			name: "OmidReza Keshtkar's Cyberpunk Developer Blog",
			description:
				"Insights and tutorials on cyberpunk development, AI, and modern web technologies",
			author: {
				"@type": "Person",
				name: "OmidReza Keshtkar",
			},
			publisher: {
				"@type": "Person",
				name: "OmidReza Keshtkar",
			},
		},
	},
	contact: {
		title: "Contact OmidReza Keshtkar | Cyberpunk Developer Dubai",
		description:
			"Get in touch with OmidReza Keshtkar, Software QA Engineer and Full Stack Developer based in Dubai. Available for cyberpunk projects, collaborations, and innovative opportunities.",
		keywords: [
			"contact OmidReza Keshtkar",
			"hire Dubai developer",
			"cyberpunk developer contact",
			"software QA engineer Dubai",
			"full stack developer contact",
			"freelance developer Dubai",
			"omidrezakeshtkar contact",
			"Dubai tech professional",
			"software engineer contact",
		],
		type: "website",
		structuredData: {
			"@context": "https://schema.org",
			"@type": "ContactPage",
			name: "Contact OmidReza Keshtkar",
			description:
				"Contact information for OmidReza Keshtkar, Software QA Engineer and Full Stack Developer",
			author: {
				"@type": "Person",
				name: "OmidReza Keshtkar",
			},
		},
	},
	terminal: {
		title: "Cyberpunk Terminal | OmidReza Keshtkar's Interactive Shell",
		description:
			"Experience OmidReza Keshtkar's cyberpunk terminal interface. An interactive command-line experience showcasing developer skills and futuristic design aesthetics.",
		keywords: [
			"cyberpunk terminal",
			"interactive terminal",
			"developer terminal",
			"cyberpunk command line",
			"OmidReza Keshtkar terminal",
			"futuristic interface",
			"developer tools",
			"command line portfolio",
		],
		type: "website",
	},
	notFound: {
		title: "Neural Pathway Not Found | OmidReza Keshtkar Portfolio",
		description:
			"The requested page could not be located in the cyberpunk digital matrix. Return to OmidReza Keshtkar's main portfolio to continue exploring.",
		keywords: [
			"404 error",
			"page not found",
			"OmidReza Keshtkar 404",
			"cyberpunk error page",
		],
		type: "website",
	},
};

// Generate meta tags for a page
export function generateMetaTags(
	pageKey: string,
	customData?: Partial<SEOData>
): string {
	const seoData = { ...SEO_CONFIGS[pageKey], ...customData };
	const canonicalUrl =
		seoData.canonicalUrl ||
		`${BASE_SEO.siteUrl}${pageKey === "home" ? "" : `/${pageKey}`}`;
	const ogImage = seoData.ogImage || BASE_SEO.defaultImage;
	const twitterImage = seoData.twitterImage || ogImage;

	return `
		<!-- Primary Meta Tags -->
		<title>${seoData.title}</title>
		<meta name="title" content="${seoData.title}" />
		<meta name="description" content="${seoData.description}" />
		<meta name="keywords" content="${seoData.keywords.join(", ")}" />
		<meta name="author" content="${BASE_SEO.author}" />
		<meta name="robots" content="index, follow" />
		<meta name="language" content="English" />
		<link rel="canonical" href="${canonicalUrl}" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="${seoData.type || "website"}" />
		<meta property="og:url" content="${canonicalUrl}" />
		<meta property="og:title" content="${seoData.title}" />
		<meta property="og:description" content="${seoData.description}" />
		<meta property="og:image" content="${BASE_SEO.siteUrl}${ogImage}" />
		<meta property="og:site_name" content="${BASE_SEO.siteName}" />
		<meta property="og:locale" content="${BASE_SEO.locale}" />

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content="${canonicalUrl}" />
		<meta property="twitter:title" content="${seoData.title}" />
		<meta property="twitter:description" content="${seoData.description}" />
		<meta property="twitter:image" content="${BASE_SEO.siteUrl}${twitterImage}" />
		<meta property="twitter:creator" content="${BASE_SEO.twitterHandle}" />

		<!-- Additional Meta Tags -->
		<meta name="theme-color" content="#ff00ff" />
		<meta name="msapplication-TileColor" content="#ff00ff" />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	`;
}

// Generate structured data script
export function generateStructuredData(pageKey: string): string {
	const seoData = SEO_CONFIGS[pageKey];
	if (!seoData.structuredData) return "";

	return `
		<script type="application/ld+json">
			${JSON.stringify(seoData.structuredData, null, 2)}
		</script>
	`;
}

// Hook for setting document head
export function useSEO(pageKey: string, customData?: Partial<SEOData>) {
	React.useEffect(() => {
		const seoData = { ...SEO_CONFIGS[pageKey], ...customData };

		// Set document title
		document.title = seoData.title;

		// Set meta description
		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute("content", seoData.description);
		} else {
			const meta = document.createElement("meta");
			meta.name = "description";
			meta.content = seoData.description;
			document.head.appendChild(meta);
		}

		// Set keywords
		const metaKeywords = document.querySelector('meta[name="keywords"]');
		if (metaKeywords) {
			metaKeywords.setAttribute("content", seoData.keywords.join(", "));
		} else {
			const meta = document.createElement("meta");
			meta.name = "keywords";
			meta.content = seoData.keywords.join(", ");
			document.head.appendChild(meta);
		}

		// Set canonical URL
		const canonical = document.querySelector('link[rel="canonical"]');
		const canonicalUrl =
			seoData.canonicalUrl ||
			`${BASE_SEO.siteUrl}${pageKey === "home" ? "" : `/${pageKey}`}`;
		if (canonical) {
			canonical.setAttribute("href", canonicalUrl);
		} else {
			const link = document.createElement("link");
			link.rel = "canonical";
			link.href = canonicalUrl;
			document.head.appendChild(link);
		}

		// Set Open Graph tags
		const setOgTag = (property: string, content: string) => {
			let tag = document.querySelector(`meta[property="${property}"]`);
			if (tag) {
				tag.setAttribute("content", content);
			} else {
				tag = document.createElement("meta");
				tag.setAttribute("property", property);
				tag.setAttribute("content", content);
				document.head.appendChild(tag);
			}
		};

		setOgTag("og:title", seoData.title);
		setOgTag("og:description", seoData.description);
		setOgTag("og:type", seoData.type || "website");
		setOgTag("og:url", canonicalUrl);
		setOgTag("og:site_name", BASE_SEO.siteName);
		setOgTag(
			"og:image",
			`${BASE_SEO.siteUrl}${seoData.ogImage || BASE_SEO.defaultImage}`
		);

		// Set Twitter tags
		const setTwitterTag = (name: string, content: string) => {
			let tag = document.querySelector(`meta[name="${name}"]`);
			if (tag) {
				tag.setAttribute("content", content);
			} else {
				tag = document.createElement("meta");
				tag.setAttribute("name", name);
				tag.setAttribute("content", content);
				document.head.appendChild(tag);
			}
		};

		setTwitterTag("twitter:card", "summary_large_image");
		setTwitterTag("twitter:title", seoData.title);
		setTwitterTag("twitter:description", seoData.description);
		setTwitterTag(
			"twitter:image",
			`${BASE_SEO.siteUrl}${
				seoData.twitterImage || seoData.ogImage || BASE_SEO.defaultImage
			}`
		);
		setTwitterTag("twitter:creator", BASE_SEO.twitterHandle);

		// Add structured data
		if (seoData.structuredData) {
			const existingScript = document.querySelector(
				'script[type="application/ld+json"]'
			);
			if (existingScript) {
				existingScript.textContent = JSON.stringify(
					seoData.structuredData,
					null,
					2
				);
			} else {
				const script = document.createElement("script");
				script.type = "application/ld+json";
				script.textContent = JSON.stringify(seoData.structuredData, null, 2);
				document.head.appendChild(script);
			}
		}
	}, [pageKey, customData]);
}

// React import for the hook
import React from "react";

// Export utility functions for manual meta tag generation
export const SEOUtils = {
	generateMetaTags,
	generateStructuredData,
	BASE_SEO,
	SEO_CONFIGS,
};
