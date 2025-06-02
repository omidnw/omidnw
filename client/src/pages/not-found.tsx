import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { LazyMotion, m, domMax } from "framer-motion";

export default function NotFound() {
	return (
		<LazyMotion features={domMax}>
			<div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
				<m.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
					className="w-full max-w-sm sm:max-w-md mx-auto"
				>
					<Card variant="cyberpunk" className="relative overflow-hidden">
						{/* Background effects */}
						<div className="absolute inset-0 opacity-10">
							<div className="absolute top-4 right-4 w-8 h-8 border border-red-500/30 rounded-lg rotate-12 animate-pulse" />
							<div className="absolute bottom-6 left-6 w-6 h-6 border border-primary/20 rounded-full animate-bounce" />
						</div>

						<CardContent className="pt-6 pb-6 px-4 sm:px-6 relative z-10">
							<div className="text-center space-y-4 sm:space-y-6">
								{/* Error Icon */}
								<m.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ duration: 0.6, delay: 0.2 }}
									className="flex justify-center"
								>
									<div className="relative">
										<div className="absolute inset-0 bg-red-500/20 rounded-full blur animate-pulse" />
										<div className="relative bg-background border-2 border-red-500 rounded-full p-3 sm:p-4">
											<AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
										</div>
									</div>
								</m.div>

								{/* Error Code */}
								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.4 }}
									className="space-y-2"
								>
									<h1 className="text-4xl sm:text-5xl font-heading font-black text-red-500 neon-glow">
										404
									</h1>
									<h2 className="text-lg sm:text-xl font-heading font-bold text-foreground">
										Neural Pathway Not Found
									</h2>
								</m.div>

								{/* Error Message */}
								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.6 }}
									className="space-y-3"
								>
									<p className="text-sm sm:text-base text-muted-foreground font-mono leading-relaxed">
										The requested page could not be located in the digital
										matrix.
									</p>
									<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
										<p className="text-xs font-mono text-red-400">
											ERROR_CODE: PAGE_NOT_FOUND
											<br />
											STATUS: DISCONNECTED
										</p>
									</div>
								</m.div>

								{/* Action Buttons */}
								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.8 }}
									className="flex flex-col sm:flex-row gap-3 pt-2"
								>
									<Link href="/" className="flex-1">
										<Button
											variant="neon"
											className="w-full font-mono h-10 sm:h-12 touch-manipulation min-h-[44px]"
										>
											<Home className="w-4 h-4 mr-2" />
											Return to Base
										</Button>
									</Link>
									<Button
										variant="outline"
										onClick={() => window.history.back()}
										className="w-full sm:w-auto font-mono h-10 sm:h-12 touch-manipulation min-h-[44px] px-4"
									>
										<ArrowLeft className="w-4 h-4 mr-2" />
										Go Back
									</Button>
								</m.div>

								{/* Terminal-style footer */}
								<m.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.6, delay: 1.0 }}
									className="pt-4 border-t border-border"
								>
									<p className="text-xs font-mono text-muted-foreground">
										<span className="text-green-400">&gt;</span> Scanning for
										alternative routes...
									</p>
								</m.div>
							</div>
						</CardContent>
					</Card>
				</m.div>
			</div>
		</LazyMotion>
	);
}
