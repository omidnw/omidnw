import { Link } from "wouter";
import { ArrowRight, FileText, Mail } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa";
import { EMAIL, RESUME_FILENAME, socialLinks } from "@/lib/social";

/**
 * Professional-theme contact band.
 *
 * The closing statement and its actions sit in two columns that meet at the
 * baseline, with the social row under the copy — so the card is filled rather
 * than leaving a void opposite the buttons.
 *
 * Social and email details come from client/src/lib/social.ts, which holds the
 * same real URLs the rest of the site already uses. No contact detail is
 * invented, and no location, timezone or availability indicator is shown.
 */

/**
 * The two icon sets expose incompatible component types, so they are keyed
 * separately and rendered by name rather than through a shared record.
 */
const GITHUB = SiGithub;
const LINKEDIN = FaLinkedinIn;

const socialIcon = (name: string) =>
	name === "GitHub" ? GITHUB : name === "LinkedIn" ? LINKEDIN : null;

export default function ProfessionalContact() {
	return (
		<section className="pf-section" aria-labelledby="contact-heading">
			<div className="rounded-2xl border border-border bg-card/60 p-7 shadow-(--pf-shadow-card) sm:p-10 lg:p-12">
				<div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
					<div>
						<p className="pf-label">Let&rsquo;s Connect</p>
						<h2 id="contact-heading" className="pf-heading">
							Let&rsquo;s Build Something Meaningful
						</h2>
						<p className="pf-lede">
							Interested in collaborating on a project, discussing engineering
							challenges, or exploring new opportunities? I&rsquo;m always open
							to meaningful conversations.
						</p>

						{/* Social */}
						<ul className="mt-7 flex flex-wrap items-center gap-2.5">
							{socialLinks.map((social) => {
								const Icon = socialIcon(social.name);
								return (
									<li key={social.name}>
										<a
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={social.ariaLabel}
											className="pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
										>
											{Icon ? (
												<Icon className="h-4 w-4" aria-hidden="true" />
											) : (
												<span className="text-xs font-semibold">{social.name}</span>
											)}
										</a>
									</li>
								);
							})}

							<li>
								<a
									href={`mailto:${EMAIL}`}
									aria-label="Send an email"
									className="pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
								>
									<Mail className="h-4 w-4" aria-hidden="true" />
								</a>
							</li>
						</ul>
					</div>

					{/* Actions, aligned to the bottom edge of the copy column. */}
					<div className="flex flex-wrap items-center gap-3 lg:justify-end">
						<Link
							href="/contact"
							className="pf-focus inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:translate-y-px"
						>
							Get in Touch
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>

						<a
							href={RESUME_FILENAME}
							download
							className="pf-focus inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
						>
							<FileText className="h-4 w-4" aria-hidden="true" />
							Download Résumé
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}