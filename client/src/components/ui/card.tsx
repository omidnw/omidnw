import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		variant?: "default" | "cyberpunk" | "hologram" | "neon";
	}
>(({ className, variant = "default", ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"rounded-lg border bg-card text-card-foreground shadow-sm",
			{
				"bg-card/80 backdrop-blur-sm": variant === "default",
				"bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-md border-primary/30 neon-border hologram":
					variant === "cyberpunk",
				"bg-card/20 backdrop-blur-lg border-accent/40 hologram scan-lines":
					variant === "hologram",
				"bg-card/60 backdrop-blur-sm border-primary neon-border shadow-lg shadow-primary/20":
					variant === "neon",
			},
			className
		)}
		{...props}
	/>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 p-6", className)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		variant?: "default" | "neon" | "glitch";
	}
>(({ className, variant = "default", ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"text-2xl font-semibold leading-none tracking-tight font-heading",
			{
				"": variant === "default",
				"neon-glow text-primary animate-pulse-neon": variant === "neon",
				"glitch-text text-accent": variant === "glitch",
			},
			className
		)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-sm text-muted-foreground font-mono", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-center p-6 pt-0", className)}
		{...props}
	/>
));
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
};
