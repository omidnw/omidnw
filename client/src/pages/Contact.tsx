import React, { useState } from "react";
import { LazyMotion, m, AnimatePresence, domMax } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Mail,
	MapPin,
	Github,
	Linkedin,
	Twitter,
	Send,
	Terminal,
	Zap,
	Globe,
	MessageSquare,
	User,
	CheckCircle,
	AlertCircle,
	Loader2,
	Gitlab,
	Code,
	ExternalLink,
	Building,
	Phone,
	Clock,
} from "lucide-react";
import CyberpunkDubaiMap from "@/components/CyberpunkDubaiMap";

interface ContactForm {
	name: string;
	email: string;
	subject: string;
	message: string;
}

interface FormErrors {
	name?: string;
	email?: string;
	subject?: string;
	message?: string;
}

export default function Contact() {
	const [formData, setFormData] = useState<ContactForm>({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	// Time zone functionality
	const [currentTime, setCurrentTime] = useState(new Date());

	React.useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// Get UAE time (UTC+4)
	const getUAETime = () => {
		const now = new Date();
		const uaeTime = new Date(
			now.getTime() + 4 * 60 * 60 * 1000 + now.getTimezoneOffset() * 60 * 1000
		);
		return uaeTime;
	};

	// Get user's timezone
	const getUserTimezone = () => {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	};

	// Calculate time difference between user and UAE
	const getTimeDifference = () => {
		const userOffset = -currentTime.getTimezoneOffset() / 60; // User's UTC offset in hours
		const uaeOffset = 4; // UAE is UTC+4
		const difference = uaeOffset - userOffset;

		if (difference === 0) {
			return "Same timezone";
		} else if (difference > 0) {
			return `UAE +${difference}h ahead`;
		} else {
			return `UAE ${Math.abs(difference)}h behind`;
		}
	};

	// Format time for display
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	};

	// Validate form
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email format";
		}

		if (!formData.subject.trim()) {
			newErrors.subject = "Subject is required";
		}

		if (!formData.message.trim()) {
			newErrors.message = "Message is required";
		} else if (formData.message.trim().length < 10) {
			newErrors.message = "Message must be at least 10 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		// Simulate API call
		setTimeout(() => {
			setIsSubmitting(false);
			setIsSubmitted(true);
			setFormData({ name: "", email: "", subject: "", message: "" });
			setErrors({});

			// Reset success message after 5 seconds
			setTimeout(() => {
				setIsSubmitted(false);
			}, 5000);
		}, 2000);
	};

	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user starts typing
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	// Contact information
	const contactInfo = [
		{
			icon: Mail,
			label: "Email",
			value: "omidrezakeshtkar@icloud.com",
			href: "mailto:omidrezakeshtkar@icloud.com",
		},
		{
			icon: MapPin,
			label: "Location",
			value: "Dubai, UAE",
			href: "https://maps.google.com/?q=Dubai, UAE",
		},
		{
			icon: Linkedin,
			label: "LinkedIn Profile",
			value: "linkedin.com/in/omid-reza-keshtkar",
			href: "https://www.linkedin.com/in/omid-reza-keshtkar",
		},
	];

	// Social links
	const socialLinks = [
		{
			icon: Github,
			label: "GitHub",
			value: "Work: @omidrezakeshtkar | Personal: @omidnw",
			href: "https://github.com/omidrezakeshtkar",
			secondaryHref: "https://github.com/omidnw",
			color: "text-white",
		},
		{
			icon: Gitlab,
			label: "GitLab",
			value: "Work: @omidrezakeshtkar | Personal: @omidnw",
			href: "https://gitlab.com/omidrezakeshtkar",
			secondaryHref: "https://gitlab.com/omidnw",
			color: "text-orange-400",
		},
		{
			icon: Linkedin,
			label: "LinkedIn",
			value: "Omid Reza Keshtkar",
			href: "https://www.linkedin.com/in/omid-reza-keshtkar",
			color: "text-blue-400",
		},
		{
			icon: MessageSquare,
			label: "Discord",
			value: "omidnw",
			href: "#",
			color: "text-indigo-400",
		},
	];

	return (
		<LazyMotion features={domMax}>
			<div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Hero Section */}
				<m.header
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center py-6 sm:py-8 mb-6 sm:mb-8"
				>
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black mb-3 sm:mb-4 neon-glow text-primary">
						CONTACT_MATRIX.init()
					</h1>
					<p className="text-base sm:text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto px-2 sm:px-4">
						Initiate connection protocol - let's build something extraordinary
						together
					</p>
				</m.header>

				<div className="grid grid-cols-1 xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8">
					{/* Contact Form */}
					<m.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="order-2 xl:order-1 xl:col-span-4 relative space-y-4 sm:space-y-6"
					>
						{/* Background decorative elements */}
						<div className="absolute inset-0 opacity-5 pointer-events-none">
							<div className="absolute top-4 left-4 w-16 h-16 border border-primary/30 rounded-lg rotate-12"></div>
							<div className="absolute top-1/3 right-8 w-8 h-8 border border-secondary/40 rounded-full"></div>
							<div className="absolute bottom-1/4 left-8 w-12 h-12 border border-accent/30 rounded-lg -rotate-12"></div>
							<div className="absolute bottom-8 right-12 w-6 h-6 border border-primary/20 rounded-full"></div>
						</div>

						{/* Contact Form Card */}
						<Card variant="cyberpunk" className="relative z-10">
							<CardHeader className="pb-4 sm:pb-6">
								<CardTitle className="text-primary font-heading flex items-center text-lg sm:text-xl md:text-2xl">
									<Terminal className="w-5 h-5 sm:w-6 sm:h-6 mr-2 neon-glow" />
									NEURAL_INTERFACE.transmit()
								</CardTitle>
								<p className="text-muted-foreground font-mono text-sm sm:text-base">
									Send me a message through the secure neural link
								</p>

								{/* Connection status indicator */}
								<div className="flex items-center gap-2 mt-2">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
									<span className="text-xs sm:text-sm font-mono text-green-400">
										Neural link established
									</span>
								</div>
							</CardHeader>

							<CardContent className="pt-0 space-y-4 sm:space-y-6">
								{/* Form completion progress */}
								<div className="mb-4 sm:mb-6">
									<div className="flex justify-between items-center mb-2">
										<span className="text-xs sm:text-sm font-mono text-muted-foreground">
											Form completion
										</span>
										<span className="text-xs sm:text-sm font-mono text-primary">
											{Math.round(
												(Object.values(formData).filter(
													(value) => value.trim().length > 0
												).length /
													4) *
													100
											)}
											%
										</span>
									</div>
									<div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
										<m.div
											className="h-full bg-gradient-to-r from-primary to-secondary"
											initial={{ width: 0 }}
											animate={{
												width: `${
													(Object.values(formData).filter(
														(value) => value.trim().length > 0
													).length /
														4) *
													100
												}%`,
											}}
											transition={{ duration: 0.3 }}
										/>
									</div>
								</div>

								{/* Success Message */}
								<AnimatePresence>
									{isSubmitted && (
										<m.div
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/30"
										>
											<div className="flex items-center gap-2 text-green-400">
												<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
												<span className="font-mono text-sm sm:text-base">
													Message transmitted successfully! I'll respond soon.
												</span>
											</div>
										</m.div>
									)}
								</AnimatePresence>

								<form
									onSubmit={handleSubmit}
									className="space-y-4 sm:space-y-6"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
										{/* Name Field */}
										<div className="space-y-2">
											<Label
												htmlFor="name"
												className="font-mono text-primary text-sm sm:text-base font-medium"
											>
												<User className="w-4 h-4 inline mr-2" />
												Name
											</Label>
											<Input
												id="name"
												name="name"
												value={formData.name}
												onChange={handleChange}
												placeholder="Your neural ID..."
												className={`font-mono bg-background/50 h-10 sm:h-12 text-sm sm:text-base transition-all duration-200 touch-manipulation ${
													errors.name
														? "border-red-500 focus:border-red-500 shadow-red-500/25"
														: "border-primary/30 focus:border-primary hover:border-primary/50"
												}`}
											/>
											{errors.name && (
												<m.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="flex items-center gap-1 text-red-400 text-xs sm:text-sm font-mono"
												>
													<AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
													{errors.name}
												</m.div>
											)}
										</div>

										{/* Email Field */}
										<div className="space-y-2">
											<Label
												htmlFor="email"
												className="font-mono text-primary text-sm sm:text-base font-medium"
											>
												<Mail className="w-4 h-4 inline mr-2" />
												Email
											</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={formData.email}
												onChange={handleChange}
												placeholder="your@email.protocol"
												className={`font-mono bg-background/50 h-10 sm:h-12 text-sm sm:text-base transition-all duration-200 touch-manipulation ${
													errors.email
														? "border-red-500 focus:border-red-500 shadow-red-500/25"
														: "border-primary/30 focus:border-primary hover:border-primary/50"
												}`}
											/>
											{errors.email && (
												<m.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="flex items-center gap-1 text-red-400 text-xs sm:text-sm font-mono"
												>
													<AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
													{errors.email}
												</m.div>
											)}
										</div>
									</div>

									{/* Subject Field */}
									<div className="space-y-2">
										<Label
											htmlFor="subject"
											className="font-mono text-primary text-sm sm:text-base font-medium"
										>
											<Zap className="w-4 h-4 inline mr-2" />
											Subject
										</Label>
										<Input
											id="subject"
											name="subject"
											value={formData.subject}
											onChange={handleChange}
											placeholder="Project collaboration, job opportunity, general inquiry..."
											className={`font-mono bg-background/50 h-10 sm:h-12 text-sm sm:text-base transition-all duration-200 touch-manipulation ${
												errors.subject
													? "border-red-500 focus:border-red-500 shadow-red-500/25"
													: "border-primary/30 focus:border-primary hover:border-primary/50"
											}`}
										/>
										{errors.subject && (
											<m.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="flex items-center gap-1 text-red-400 text-xs sm:text-sm font-mono"
											>
												<AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
												{errors.subject}
											</m.div>
										)}
									</div>

									{/* Message Field */}
									<div className="space-y-2">
										<Label
											htmlFor="message"
											className="font-mono text-primary text-sm sm:text-base font-medium"
										>
											<MessageSquare className="w-4 h-4 inline mr-2" />
											Message
										</Label>
										<Textarea
											id="message"
											name="message"
											value={formData.message}
											onChange={handleChange}
											placeholder="Transmit your message through the neural network..."
											rows={5}
											className={`font-mono bg-background/50 resize-none text-sm sm:text-base transition-all duration-200 touch-manipulation ${
												errors.message
													? "border-red-500 focus:border-red-500 shadow-red-500/25"
													: "border-primary/30 focus:border-primary hover:border-primary/50"
											}`}
										/>
										{errors.message && (
											<m.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="flex items-center gap-1 text-red-400 text-xs sm:text-sm font-mono"
											>
												<AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
												{errors.message}
											</m.div>
										)}
										<div className="text-xs sm:text-sm text-muted-foreground font-mono text-right">
											{formData.message.length}/1000 characters
										</div>
									</div>

									{/* Submit Button */}
									<div className="pt-2">
										<Button
											type="submit"
											variant="neon"
											size="lg"
											disabled={isSubmitting}
											className="w-full font-mono h-12 sm:h-14 text-base sm:text-lg touch-manipulation min-h-[44px]"
										>
											{isSubmitting ? (
												<>
													<Loader2 className="w-5 h-5 mr-2 animate-spin" />
													Transmitting...
												</>
											) : (
												<>
													<Send className="w-5 h-5 mr-2" />
													TRANSMIT_MESSAGE()
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						{/* Interactive Cyberpunk Dubai Map */}
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="relative z-10"
						>
							<Card variant="cyberpunk" className="overflow-hidden">
								<CardHeader className="pb-3 sm:pb-4">
									<CardTitle className="text-primary font-heading flex items-center text-lg sm:text-xl md:text-2xl">
										<MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 neon-glow" />
										LOCATION_MATRIX.dubai()
									</CardTitle>
									<p className="text-muted-foreground font-mono text-sm sm:text-base">
										Neural network nodes across Dubai cybernetic grid
									</p>
								</CardHeader>
								<CardContent className="p-0">
									<div className="relative">
										<CyberpunkDubaiMap />
										{/* Mobile-optimized overlay info */}
										<div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-primary/30">
											<div className="text-xs sm:text-sm font-mono text-primary flex items-center gap-1 sm:gap-2">
												<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
												<span>GRID_STATUS: ONLINE</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</m.div>
					</m.div>

					{/* Contact Information & Social Links */}
					<m.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="space-y-4 sm:space-y-6 order-1 xl:order-2 xl:col-span-3"
					>
						{/* Contact Information */}
						<Card variant="hologram">
							<CardHeader className="pb-3 sm:pb-4">
								<CardTitle className="text-primary font-heading flex items-center text-base sm:text-lg md:text-xl">
									<Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 neon-glow" />
									DIRECT_CHANNELS.list()
								</CardTitle>
								<p className="text-muted-foreground font-mono text-xs sm:text-sm">
									Primary communication protocols
								</p>
							</CardHeader>

							<CardContent className="space-y-3 sm:space-y-4">
								{contactInfo.map((item, index) => (
									<m.a
										key={item.label}
										href={item.href}
										target={item.href.startsWith("http") ? "_blank" : undefined}
										rel={
											item.href.startsWith("http")
												? "noopener noreferrer"
												: undefined
										}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
										className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-background/50 hover:bg-primary/10 transition-all duration-200 group border border-transparent hover:border-primary/30 touch-manipulation min-h-[44px]"
									>
										<div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors flex-shrink-0">
											<item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-xs sm:text-sm font-mono text-muted-foreground">
												{item.label}
											</div>
											<div className="font-mono text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
												{item.value}
											</div>
										</div>
									</m.a>
								))}
							</CardContent>
						</Card>

						{/* Social Links */}
						<Card variant="cyberpunk">
							<CardHeader className="pb-3 sm:pb-4">
								<CardTitle className="text-primary font-heading flex items-center text-base sm:text-lg md:text-xl">
									<Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 neon-glow" />
									SOCIAL_NETWORK.connect()
								</CardTitle>
								<p className="text-muted-foreground font-mono text-xs sm:text-sm">
									Find me across the digital realm
								</p>
							</CardHeader>

							<CardContent className="space-y-3 sm:space-y-4">
								{socialLinks.map((social, index) => (
									<m.a
										key={social.label}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="block p-3 sm:p-4 rounded-lg border border-primary/20 hover:border-primary/50 bg-background/30 hover:bg-background/50 transition-all group touch-manipulation min-h-[44px]"
									>
										<div className="flex items-start gap-3 sm:gap-4">
											<div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
												<social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<h3 className="font-mono font-semibold text-foreground text-sm sm:text-base">
														{social.label}
													</h3>
													<ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
												<p className="font-mono text-primary text-xs sm:text-sm break-all">
													{social.value}
												</p>
												<p className="text-muted-foreground text-xs sm:text-sm">
													{social.label === "GitHub"
														? "Open source contributions"
														: social.label === "GitLab"
														? "Project repositories"
														: social.label === "LinkedIn"
														? "Professional network"
														: "Discord communication"}
												</p>
											</div>
										</div>
									</m.a>
								))}
							</CardContent>
						</Card>

						{/* Connection Status */}
						<Card variant="cyberpunk">
							<CardHeader className="pb-3 sm:pb-4">
								<CardTitle className="text-primary font-heading flex items-center text-base sm:text-lg md:text-xl">
									<Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 neon-glow" />
									CONNECTION_STATUS.matrix()
								</CardTitle>
								<p className="text-muted-foreground font-mono text-xs sm:text-sm">
									Neural network synchronization data
								</p>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-3 sm:gap-4">
									{/* Availability Status */}
									<div className="text-center p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
										<div className="flex items-center justify-center mb-2">
											<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
											<span className="text-xs sm:text-sm font-mono text-green-400">
												ONLINE
											</span>
										</div>
										<p className="text-xs sm:text-sm text-muted-foreground">
											Available for new projects
										</p>
									</div>

									{/* Time Zone Matrix */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{/* UAE Time (Primary) */}
										<div className="text-center p-3 sm:p-4 bg-primary/10 border border-primary/30 rounded-lg">
											<div className="flex items-center justify-center mb-2">
												<Clock className="w-3 h-3 mr-2 text-primary animate-pulse" />
												<span className="text-xs sm:text-sm font-mono text-primary">
													DUBAI_TIME
												</span>
											</div>
											<div className="text-lg sm:text-xl font-mono text-primary font-bold mb-1">
												{formatTime(getUAETime())}
											</div>
											<p className="text-xs text-muted-foreground">
												UTC+4 | Primary Node
											</p>
										</div>

										{/* User Time Zone */}
										<div className="text-center p-3 sm:p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
											<div className="flex items-center justify-center mb-2">
												<Globe className="w-3 h-3 mr-2 text-secondary" />
												<span className="text-xs sm:text-sm font-mono text-secondary">
													YOUR_TIME
												</span>
											</div>
											<div className="text-lg sm:text-xl font-mono text-secondary font-bold mb-1">
												{formatTime(currentTime)}
											</div>
											<p className="text-xs text-muted-foreground">
												{getUserTimezone().split("/").pop()?.replace("_", " ")}
											</p>
										</div>
									</div>

									{/* Time Sync Status */}
									<div className="text-center p-3 sm:p-4 bg-accent/10 border border-accent/30 rounded-lg">
										<div className="flex items-center justify-center mb-2">
											<Zap className="w-3 h-3 mr-2 text-accent" />
											<span className="text-xs sm:text-sm font-mono text-accent">
												SYNC_DELTA
											</span>
										</div>
										<div className="text-base sm:text-lg font-mono text-accent font-bold mb-1">
											{getTimeDifference()}
										</div>
										<p className="text-xs text-muted-foreground">
											Time differential matrix
										</p>
									</div>

									{/* Response Time & Status */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<div className="text-center p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
											<div className="flex items-center justify-center mb-2">
												<Phone className="w-3 h-3 mr-2 text-blue-400" />
												<span className="text-xs sm:text-sm font-mono text-blue-400">
													RESPONSE_TIME
												</span>
											</div>
											<div className="text-base font-mono text-blue-400 font-bold">
												24-48H
											</div>
										</div>

										<div className="text-center p-3 sm:p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
											<div className="flex items-center justify-center mb-2">
												<Code className="w-3 h-3 mr-2 text-purple-400" />
												<span className="text-xs sm:text-sm font-mono text-purple-400">
													DEV_STATUS
												</span>
											</div>
											<div className="text-base font-mono text-purple-400 font-bold">
												ACTIVE
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Info */}
						<Card variant="cyberpunk">
							<CardContent className="p-4 sm:p-6">
								<div className="text-center space-y-3 sm:space-y-4">
									<div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/20 rounded-lg flex items-center justify-center">
										<Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
									</div>
									<div>
										<h3 className="font-heading font-bold text-lg sm:text-xl text-primary mb-2">
											Cybernetic Developer
										</h3>
										<p className="font-mono text-muted-foreground text-xs sm:text-sm leading-relaxed">
											Specializing in full-stack development, modern web
											technologies, and creating seamless digital experiences.
											Always interested in innovative projects and collaborative
											opportunities.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</m.div>
				</div>
			</div>
		</LazyMotion>
	);
}
