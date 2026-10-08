import { useEffect, useState } from "react";
import { useParams } from "wouter";
import ProfessionalArticle, {
	type MetaItem,
} from "@/components/themes/professional/ProfessionalArticle";
import { formatDate } from "@/lib/dates";
import { loadLocalBlogPostById } from "@/lib/local-blogs";
import type { BlogPostData } from "@/lib/github-api";

/**
 * Professional-theme blog detail (`/blog/:slug`).
 *
 * `ProfessionalArticle` owns the layout; this supplies the metadata row. There
 * are no outbound actions to offer here — the CyberPunk page's share/copy
 * buttons are chrome that the Professional theme does not use.
 */

export default function ProfessionalBlogDetail() {
	const { slug = "" } = useParams<{ slug: string }>();
	const [post, setPost] = useState<BlogPostData | null>(null);

	useEffect(() => {
		let active = true;
		setPost(null);
		loadLocalBlogPostById(slug).then((found) => {
			if (active) setPost(found);
		});
		return () => {
			active = false;
		};
	}, [slug]);

	const meta: MetaItem[] | undefined = post
		? [
				{ label: "Published", value: formatDate(post.date) },
				{ label: "Read Time", value: post.readTime },
				...(post.tags?.length
					? [{ label: "Tags", value: post.tags.join(", ") }]
					: []),
			]
		: undefined;

	return <ProfessionalArticle source="post" meta={meta} />;
}