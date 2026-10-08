import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, Terminal, X } from "lucide-react";
import { navigationItems, isNavItemActive } from "@/lib/navigation";
import { socialLinks } from "@/lib/social";
import CircuitBackground from "@/components/CircuitBackground";
import { cn } from "@/lib/utils";

interface ProfessionalMenuProps {
	className?: string;
	onTerminalOpen?: () => void;
}

export default function ProfessionalMenu({ className, onTerminalOpen }: ProfessionalMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [location] = useLocation();
	const terminalRequested = useRef(false);

	useEffect(() => { setIsOpen(false); }, [location]);
	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 1024px)");
		const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
		desktop.addEventListener("change", closeOnDesktop);
		return () => desktop.removeEventListener("change", closeOnDesktop);
	}, []);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				<button type="button" aria-label="Open navigation menu" className={cn("pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-foreground hover:border-primary/50", className)}>
					<Menu className="h-5 w-5" aria-hidden="true" />
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="pf-menu-overlay fixed inset-0 z-[9998] bg-background/80" />
				<Dialog.Content className="pf-menu-panel fixed inset-y-0 right-0 z-[9999] w-full overflow-y-auto bg-background" aria-describedby={undefined}
					onCloseAutoFocus={(event) => {
						if (terminalRequested.current) {
							event.preventDefault();
							terminalRequested.current = false;
							onTerminalOpen?.();
						}
					}}>
					<CircuitBackground className="absolute inset-0" instanceId="circuit-vignette-menu" />
					<div className="relative flex min-h-full flex-col p-6 sm:p-8">
						<div className="flex items-center justify-between gap-4 border-b border-border/50 pb-5">
							<Dialog.Title className="pf-label">Navigation</Dialog.Title>
							<Dialog.Close asChild><button type="button" aria-label="Close navigation menu" className="pf-focus inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card"><X className="h-5 w-5" aria-hidden="true" /></button></Dialog.Close>
						</div>
						<nav aria-label="Main navigation" className="pf-menu-links my-6 flex-1">
							{navigationItems.map((item, index) => {
								const active = isNavItemActive(location, item.path);
								return <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)} aria-current={active ? "page" : undefined} className="pf-focus flex items-center gap-4 rounded-lg px-3 py-4">
									<span className="font-mono text-xs text-muted-foreground" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
									<span className="flex-1 text-2xl font-semibold tracking-tight">{item.name}</span><ArrowUpRight className="h-5 w-5" aria-hidden="true" />
								</Link>;
							})}
						</nav>
						<div className="border-t border-border/50 pt-5">
							<button type="button" onClick={() => { terminalRequested.current = true; setIsOpen(false); }} className="pf-focus flex min-h-11 w-full items-center gap-3 rounded-lg border border-border/50 bg-card px-4 text-sm"><Terminal className="h-4 w-4 text-primary" aria-hidden="true" />Open Terminal<ArrowUpRight className="ml-auto h-4 w-4" aria-hidden="true" /></button>
							<div className="mt-4 flex flex-wrap gap-x-5 gap-y-1" aria-label="Social links">{socialLinks.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="pf-focus inline-flex min-h-11 items-center gap-1 text-xs text-muted-foreground hover:text-primary">{social.name}<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></a>)}</div>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
