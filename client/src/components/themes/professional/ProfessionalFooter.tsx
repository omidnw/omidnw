import { Link } from "wouter";
import { Mail } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa";
import { pictureSource } from "@/lib/images";
import { EMAIL, RESUME_FILENAME, socialLinks } from "@/lib/social";

/**
 * Professional-theme footer.
 *
 * Intentionally a different shape from the header: a compact multi-column block
 * with grouped links, not a navigation bar. No theme switcher, no oversized
 * links, not sticky.
 *
 * It repeats nothing the page has already said at length — the brand column is
 * the identity, the two link groups are destinations, and the bottom bar is the
 * only place the copyright and the signature line appear.
 */

/** The two icon sets expose incompatible component types. */
const GITHUB = SiGithub;
const LINKEDIN = FaLinkedinIn;

const LOGO = pictureSource("/images/ork-logo.png");

/** Every social entry gets an icon here, so the column reads as one set. */
const socialIcon = (name: string) =>
	name === "GitHub" ? GITHUB : name === "LinkedIn" ? LINKEDIN : null;

const EXPLORE = [
	{ label: "Work", href: "/projects" },
	{ label: "Blog", href: "/blog" },
	{ label: "Tech Stack", href: "/about#tech-stack" },
	{ label: "About", href: "/about" },
	{ label: "Contact", href: "/contact" },
];

export default function ProfessionalFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-card/30">
			<div className="pf-shell pb-8 pt-12 sm:pt-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.85fr_0.85fr] lg:gap-12">
					{/* Brand */}
					<div>
						<div className="flex items-center gap-3">
							<picture>
								<source type="image/webp" srcSet={LOGO.srcSet} sizes="32px" />
								<img
									{...LOGO}
									sizes="32px"
									alt=""
									className="h-8 w-auto select-none"
									draggable={false}
								/>
							</picture>
							<span className="text-base font-semibold text-foreground">
								Omid Reza Keshtkar
							</span>
						</div>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
							Building reliable software and the test infrastructure that keeps it
							reliable.
						</p>
					</div>

					{/* Explore */}
					<nav aria-labelledby="footer-explore">
						<h2
							id="footer-explore"
							className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-foreground"
						>
							Explore
						</h2>
						<ul className="mt-2 space-y-0.5">
							{EXPLORE.map((item) => (
								<li key={item.href + item.label}>
									<Link
										href={item.href}
										className="pf-focus inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Connect */}
					<div>
						<h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-foreground">
							Connect
						</h2>
						<ul className="mt-2 space-y-0.5">
							{socialLinks.map((social) => {
								const Icon = socialIcon(social.name);
								return (
									<li key={social.name}>
										<a
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="pf-focus inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
										>
											{Icon ? (
												<Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
											) : null}
											{social.name}
										</a>
									</li>
								);
							})}
							<li>
								<a
									href={`mailto:${EMAIL}`}
									className="pf-focus inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
								>
									<Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
									Email
								</a>
							</li>
							<li>
								<a
									href={RESUME_FILENAME}
									download
									className="pf-focus inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
								>
									Résumé
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-muted-foreground">
						© {year} Omid Reza Keshtkar. All rights reserved.
					</p>
					<p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
						Designed &amp; engineered with purpose.
					</p>
				</div>
			</div>
		</footer>
	);
}