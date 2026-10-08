import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Page chrome shared by every Professional inner page.
 *
 * One header shape across `/work`, `/blog`, `/about`, `/contact` and the 404
 * route: a mono label, the page title, an optional lede, and an optional row of
 * actions or a back link. It builds on the same `.pf-label` / `.pf-heading`
 * primitives the landing page uses, so the inner pages read as part of the same
 * document rather than as a second design.
 */

interface ProfessionalPageHeaderProps {
	/** Short mono kicker above the title. */
	label: string;
	/** Rendered as the page's single `h1`. */
	title: string;
	/** One or two sentences under the title. */
	lede?: string;
	/** Right-aligned actions, aligned to the title's baseline. */
	actions?: ReactNode;
	/** When set, renders a back link above the label. */
	backTo?: string;
	backLabel?: string;
	/** Accessible name for the page, used by the `aria-label` on the region. */
	regionLabel?: string;
}

export default function ProfessionalPageHeader({
	label,
	title,
	lede,
	actions,
	backTo,
	backLabel = "Back",
	regionLabel,
}: ProfessionalPageHeaderProps) {
	return (
		<div className="pf-shell pf-page-header pb-2 pt-[calc(var(--pf-section-y)*0.62)]">
			{backTo ? (
				<Link
					href={backTo}
					className="pf-focus group mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
				>
					<ArrowLeft
						className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
						aria-hidden="true"
					/>
					{backLabel}
				</Link>
			) : null}

			<div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
				<div className="min-w-0">
					<p className="pf-label">{label}</p>
					<h1
						className="pf-heading text-[clamp(2rem,1.4rem+2.4vw,2.75rem)]"
						aria-label={regionLabel}
					>
						{title}
					</h1>
					{lede ? <p className="pf-lede">{lede}</p> : null}
				</div>

				{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
			</div>
		</div>
	);
}