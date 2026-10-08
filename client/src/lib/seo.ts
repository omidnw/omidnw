// SEO configuration for Omid Reza Keshtkar's portfolio, shared by both themes.
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
	siteName: "Omid Reza Keshtkar — Software Engineering Portfolio",
	siteUrl: "https://omidrezakeshtkar.dev", // Update with your actual domain
	author: "Omid Reza Keshtkar",
	defaultImage: "/images/og-image.jpg",
	twitterHandle: "@omidrezakeshtka",
	locale: "en_US",
};

// Page-specific SEO configurations
export const SEO_CONFIGS: Record<string, SEOData> = {
	home: {
		title: "Omid Reza Keshtkar | Senior Software QA Engineer & Full-Stack Developer",
		description:
			"Portfolio of Omid Reza Keshtkar, Senior Software QA Engineer and Full-Stack Developer. Reliable software, test automation, and AI-assisted engineering workflows.",
		keywords: [
			"OmidReza Keshtkar",
			"Omid Reza Keshtkar",
			"quality automation engineer",
			"software QA engineer",
			"full stack developer",
			"software developer",
			"TypeScript developer",
			"React developer",
			"software engineering portfolio",
			"neural network",
			"AI developer",
			"web developer",
			"software engineer",
			"test automation",
			"quality engineering",
			"developer portfolio",
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
				"Test Automation",
				"AI Development",
			],
		},
	},
	about: {
		title: "About | Omid Reza Keshtkar",
		description:
			"Explore Omid Reza Keshtkar’s experience in software engineering, quality automation, full-stack development, and AI-assisted workflows.",
		keywords: [
			"OmidReza Keshtkar biography",
			"Omid Reza Keshtkar about",
			"software developer",
			"quality automation engineer",
			"software engineering experience",
			"Troweb Inc developer",
			"software QA engineer background",
			"full stack developer experience",
			"Shamsipour Technical College",
			"Veresk Rail Cars developer",
		],
		type: "profile",
	},
	projects: {
		title: "Selected Work | Omid Reza Keshtkar",
		description:
			"Explore software projects by Omid Reza Keshtkar across web platforms, desktop applications, automation, and AI.",
		keywords: [
			"OmidReza Keshtkar projects",
			"web development projects",
			"developer portfolio projects",
			"AI projects",
			"full stack projects",
			"TypeScript projects",
			"React applications",
			"automation projects",
			"neural network projects",
			"innovative web development",
		],
		type: "website",
		structuredData: {
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: "OmidReza Keshtkar's Projects",
			description:
				"A collection of software projects across web platforms, desktop applications, automation, and AI",
			author: {
				"@type": "Person",
				name: "OmidReza Keshtkar",
			},
		},
	},
	blog: {
		title: "Blog | Omid Reza Keshtkar",
		description:
			"Notes on quality engineering, test automation, full-stack development, and AI-assisted workflows by Omid Reza Keshtkar.",
		keywords: [
			"OmidReza Keshtkar blog",
			"quality engineering blog",
			"software engineering blog",
			"AI development blog",
			"full stack development insights",
			"test automation",
			"developer thoughts",
			"technology trends",
			"coding tutorials",
			"software development blog",
		],
		type: "website",
		structuredData: {
			"@context": "https://schema.org",
			"@type": "Blog",
			name: "Omid Reza Keshtkar’s Engineering Blog",
			description:
				"Insights on quality engineering, automation, AI, and modern web technologies",
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
		title: "Contact | Omid Reza Keshtkar",
		description:
			"Get in touch with Omid Reza Keshtkar about software engineering, test automation, and full-stack development opportunities.",
		keywords: [
			"contact OmidReza Keshtkar",
			"hire software developer",
			"software engineer contact",
			"software QA engineer",
			"full stack developer contact",
			"freelance developer",
			"omidrezakeshtkar contact",
			"software engineering professional",
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
		title: "Page Not Found | Omid Reza Keshtkar",
		description:
			"The requested page could not be found. Explore the portfolio of Omid Reza Keshtkar.",
		keywords: [
			"404 error",
			"page not found",
			"OmidReza Keshtkar 404",
			"portfolio error page",
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
		<meta name="theme-color" content="#080D0E" />
		<meta name="msapplication-TileColor" content="#080D0E" />
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
