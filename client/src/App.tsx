import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Projects from "@/pages/Projects";
import Contact from "@/pages/Contact";
import Terminal from "@/pages/Terminal";
import BlogPost from "@/pages/BlogPost";
import ProjectPost from "@/pages/ProjectPost";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { RescueModeProvider } from "@/contexts/RescueModeContext";
import RescueModeOverlay from "@/components/RescueModeOverlay";
import { ThemeProvider } from "@/contexts/ThemeContext";

function Router() {
	const [location] = useLocation();

	// Check for dynamic admin routes - only allow randomly generated URLs
	if (location.startsWith("/admin-")) {
		return <Login />;
	}

	if (location.startsWith("/dashboard-")) {
		return <Admin />;
	}

	return (
		<Switch>
			<Route path="/" component={Home} />
			<Route path="/about" component={About} />
			<Route path="/blog" component={Blog} />
			<Route path="/blog/:slug" component={BlogPost} />
			<Route path="/projects" component={Projects} />
			<Route path="/projects/:slug" component={ProjectPost} />
			<Route path="/contact" component={Contact} />
			<Route path="/terminal" component={Terminal} />
			{/* No hardcoded admin routes - only dynamic URLs work */}

			{/* Fallback to 404 */}
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	const [location] = useLocation();

	// Admin routes should not use the main Layout
	const isAdminRoute =
		location.startsWith("/admin") || location.startsWith("/dashboard");

	return (
		<ErrorBoundary>
			<ThemeProvider>
				<RescueModeProvider>
					<MusicPlayerProvider>
						<QueryClientProvider client={queryClient}>
							<TooltipProvider>
								{isAdminRoute ? (
									<>
										<Toaster />
										<Router />
									</>
								) : (
									<Layout>
										<Toaster />
										<Router />
									</Layout>
								)}
								{/* Rescue Mode Overlay - Always rendered, shows when rescue mode is active */}
								<RescueModeOverlay />
							</TooltipProvider>
						</QueryClientProvider>
					</MusicPlayerProvider>
				</RescueModeProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
