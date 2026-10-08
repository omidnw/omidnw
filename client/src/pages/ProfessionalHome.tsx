import { LazyMotion, MotionConfig, domMax } from "framer-motion";
import ProfessionalHero from "@/components/themes/professional/ProfessionalHero";
import ProfessionalHighlights from "@/components/themes/professional/ProfessionalHighlights";
import ProfessionalProjects from "@/components/themes/professional/ProfessionalProjects";
import ProfessionalTech from "@/components/themes/professional/ProfessionalTech";
import ProfessionalJourney from "@/components/themes/professional/ProfessionalJourney";
import ProfessionalAbout from "@/components/themes/professional/ProfessionalAbout";
import ProfessionalContact from "@/components/themes/professional/ProfessionalContact";
import ProfessionalFooter from "@/components/themes/professional/ProfessionalFooter";
import { useSEO } from "@/lib/seo";

/**
 * Professional-theme landing page.
 *
 * Section order follows the design spec. Every section links into the existing
 * multi-page routes; no route was added and no existing page was replaced.
 * The CyberPunk theme keeps its own Home untouched.
 */
export default function ProfessionalHome() {
	useSEO("home");

	return (
		/* LazyMotion supplies the animation features the `m.*` components need.
		   Without it every `m.*` animation silently never runs and elements stay
		   stuck at their `initial` state — the Earth image renders at opacity 0. */
		<LazyMotion features={domMax}>
			{/* reducedMotion="user" makes every animation on this page honour the
			   operating system's reduced-motion preference. Scoped here so the
			   CyberPunk theme's own animations are unaffected. */}
			<MotionConfig reducedMotion="user">
				<div className="text-foreground selection:bg-accent selection:text-background">
					<ProfessionalHero />
					<ProfessionalHighlights />
					<ProfessionalProjects />
					<ProfessionalTech />
					<ProfessionalJourney />
					<ProfessionalAbout />
					<ProfessionalContact />
					<ProfessionalFooter />
				</div>
			</MotionConfig>
		</LazyMotion>
	);
}