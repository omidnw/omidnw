import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";

function Router() {
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
			{/* Add more routes here */}
			{/* Fallback to 404 */}
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	return (
		<ErrorBoundary>
			<MusicPlayerProvider>
				<QueryClientProvider client={queryClient}>
					<TooltipProvider>
						<Layout>
							<Toaster />
							<Router />
						</Layout>
					</TooltipProvider>
				</QueryClientProvider>
			</MusicPlayerProvider>
		</ErrorBoundary>
	);
}

export default App;
