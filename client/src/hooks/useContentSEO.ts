import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { BASE_SEO, SEO_CONFIGS, useSEO, type SEOData } from "@/lib/seo";
import { loadLocalProjectById } from "@/lib/local-projects";
import { loadBlogPostById } from "@/lib/blogs";

/** Keep detail-page metadata correct after client-side navigation in either theme. */
export function useContentSEO(source: "projects" | "blog") {
	const { slug = "" } = useParams<{ slug: string }>();
	const [location] = useLocation();
	const [result, setResult] = useState<{ path: string; seo: Partial<SEOData> } | null>(null);
	const canonicalUrl = `${BASE_SEO.siteUrl}/${source}/${encodeURIComponent(slug)}/`;
	useEffect(() => {
		let active = true;
		const load = source === "projects" ? loadLocalProjectById : loadBlogPostById;
		load(slug).then((record) => {
			if (!active) return;
			setResult({ path: location, seo: record ? {
				title: `${record.title} | ${BASE_SEO.author}`,
				description: "description" in record ? record.description : record.excerpt,
				type: source === "blog" ? "article" : "website",
				structuredData: undefined,
			} : SEO_CONFIGS.notFound });
		}).catch(() => {
			// A temporary network error does not mean that an article was removed.
		});
		return () => { active = false; };
	}, [source, slug, location]);
	useSEO(source, { structuredData: undefined, ...(result?.path === location ? result.seo : {}), canonicalUrl });
}
