import { Link } from "wouter";
import ProfessionalPageHeader from "@/components/themes/professional/ProfessionalPageHeader";
import { navigationItems } from "@/lib/navigation";

/**
 * Professional-theme 404.
 *
 * Same page header as every other Professional route, then the real navigation
 * so a mistyped URL still lands somewhere useful. The CyberPunk 404 keeps its
 * own "neural pathway" treatment.
 */
export default function ProfessionalNotFoundPage() {
	return (
		<div className="pf-section">
			<ProfessionalPageHeader
				label="Error 404"
				title="Page Not Found"
				lede="That address doesn't match anything on this site. It may have been renamed, or the link may be out of date."
				regionLabel="Page not found"
			/>

			<div className="pf-shell mt-10">
				<Link
					href="/"
					className="pf-focus inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
				>
					Back to Home
				</Link>

				<nav aria-label="Site sections" className="mt-10 border-t border-border pt-8">
					<p className="pf-label">Or try a section</p>
					<ul className="mt-4 flex flex-wrap gap-2">
						{navigationItems
							.filter((item) => item.path !== "/")
							.map((item) => (
								<li key={item.path}>
									<Link
										href={item.path}
										className="pf-focus inline-flex h-11 items-center rounded-lg border border-border bg-card px-4 text-sm text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
									>
										{item.name}
									</Link>
								</li>
							))}
					</ul>
				</nav>
			</div>
		</div>
	);
}