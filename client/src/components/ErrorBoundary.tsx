import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({
			error,
			errorInfo,
		});

		// Log to error reporting service
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReload = () => {
		window.location.reload();
	};

	handleGoHome = () => {
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="max-w-2xl w-full"
					>
						<Card variant="cyberpunk" className="p-8 text-center">
							<motion.div
								initial={{ rotate: 0 }}
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
								className="mx-auto mb-6 w-16 h-16 flex items-center justify-center"
							>
								<AlertTriangle className="w-12 h-12 text-destructive neon-glow" />
							</motion.div>

							<h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary neon-glow">
								SYSTEM ERROR
							</h1>

							<p className="text-lg text-muted-foreground font-mono mb-6">
								A critical error has occurred in the matrix. The system has been
								compromised.
							</p>

							<div className="bg-muted p-4 rounded-md mb-6 text-left">
								<p className="font-mono text-sm text-destructive">
									ERROR_CODE: {this.state.error?.name || "UNKNOWN"}
								</p>
								<p className="font-mono text-sm text-muted-foreground mt-2">
									{this.state.error?.message || "An unexpected error occurred"}
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									variant="cyberpunk"
									onClick={this.handleReload}
									className="w-full sm:w-auto"
								>
									<RefreshCw className="w-4 h-4 mr-2" />
									Restart System
								</Button>
								<Button
									variant="neon"
									onClick={this.handleGoHome}
									className="w-full sm:w-auto"
								>
									<Home className="w-4 h-4 mr-2" />
									Return Home
								</Button>
							</div>

							{process.env.NODE_ENV === "development" &&
								this.state.errorInfo && (
									<details className="mt-6 text-left">
										<summary className="cursor-pointer font-mono text-sm text-muted-foreground hover:text-foreground">
											Show error details (Development only)
										</summary>
										<pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto max-h-40">
											{this.state.error && this.state.error.stack}
											{this.state.errorInfo.componentStack}
										</pre>
									</details>
								)}
						</Card>
					</motion.div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
