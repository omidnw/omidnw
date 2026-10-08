import { Check, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSiteTheme, type SiteTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface SiteThemeOption {
	value: SiteTheme;
	label: string;
	description: string;
}

const SITE_THEME_OPTIONS: SiteThemeOption[] = [
	{
		value: "professional",
		label: "Professional",
		description: "Restrained, modern, premium",
	},
	{
		value: "cyberpunk",
		label: "CyberPunk",
		description: "Neon, terminal, glitch",
	},
];

/**
 * Switches the site theme identity (CyberPunk / Professional). Independent of
 * the light/dark toggle sitting beside it.
 *
 * Mounted in the Professional header per the reference design.
 */
export default function ThemeSwitcher({ className }: { className?: string }) {
	const { siteTheme, setSiteTheme } = useSiteTheme();
	const active =
		SITE_THEME_OPTIONS.find((option) => option.value === siteTheme) ??
		SITE_THEME_OPTIONS[0];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"pf-focus inline-flex h-11 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground sm:px-3",
						className,
					)}
					aria-label={`Site theme: ${active.label}. Change theme`}
				>
					<span>{active.label}</span>
					<ChevronDown
						className="h-4 w-4 shrink-0 text-muted-foreground"
						aria-hidden="true"
					/>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="min-w-[13rem]">
				<DropdownMenuLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
					Site theme
				</DropdownMenuLabel>
				{SITE_THEME_OPTIONS.map((option) => {
					const selected = option.value === siteTheme;
					return (
						<DropdownMenuItem
							key={option.value}
							onSelect={() => setSiteTheme(option.value)}
							className="flex items-center justify-between gap-3"
							aria-current={selected ? "true" : undefined}
						>
							<span className="flex flex-col">
								<span className="font-medium">{option.label}</span>
								<span className="text-xs text-muted-foreground">
									{option.description}
								</span>
							</span>
							{selected ? (
								<Check
									className="h-4 w-4 shrink-0 text-primary"
									aria-hidden="true"
								/>
							) : null}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}