import React from "react";
import { Edit, Star, Globe } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Project {
	id: number;
	title: string;
	description: string;
	isPublished: boolean;
	featured: boolean;
	githubUrl?: string;
	liveUrl?: string;
	technologies?: string[];
	images?: string[];
	createdAt: string;
}

interface ProjectCardProps {
	project: Project;
	onEdit?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
	return (
		<Card className="group relative bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-gray-900/90 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 overflow-hidden backdrop-blur-xl h-full">
			{/* Animated gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

			{/* Glow effect */}
			<div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

			{/* Featured star indicator */}
			{project.featured && (
				<div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
					<div className="absolute top-2 right-2 transform rotate-45">
						<Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
					</div>
				</div>
			)}

			<CardContent className="relative p-6 z-10 flex flex-col h-full">
				<div className="flex items-start justify-between mb-4">
					<h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-mono group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300 flex-1">
						{project.title}
					</h3>
					<div className="flex flex-col items-end space-y-2 ml-4">
						{project.featured && (
							<Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-mono shadow-lg shadow-yellow-500/20">
								<Star className="w-3 h-3 mr-1 fill-yellow-400" />
								FEATURED
							</Badge>
						)}
						<Badge
							className={
								project.isPublished
									? "bg-green-500/20 text-green-400 border border-green-500/30 font-mono shadow-lg shadow-green-500/20"
									: "bg-gray-500/20 text-gray-400 border border-gray-500/30 font-mono"
							}
						>
							{project.isPublished ? "● LIVE" : "○ DRAFT"}
						</Badge>
					</div>
				</div>

				<p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed flex-grow">
					{project.description}
				</p>

				{/* Links */}
				<div className="flex items-center space-x-4 text-sm mb-4">
					{project.githubUrl && (
						<a
							href={project.githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center space-x-1 text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-mono group/link"
						>
							<SiGithub className="w-4 h-4 group-hover/link:animate-pulse" />
							<span>GitHub</span>
						</a>
					)}
					{project.liveUrl && (
						<a
							href={project.liveUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 transition-colors duration-300 font-mono group/link"
						>
							<Globe className="w-4 h-4 group-hover/link:animate-pulse" />
							<span>Live Demo</span>
						</a>
					)}
				</div>

				{/* Technologies and Edit button */}
				<div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
					<div className="flex flex-wrap gap-2">
						{project.technologies &&
							project.technologies.slice(0, 3).map((tech) => (
								<Badge
									key={tech}
									variant="outline"
									className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10 font-mono"
								>
									{tech}
								</Badge>
							))}
						{project.technologies && project.technologies.length > 3 && (
							<Badge
								variant="outline"
								className="text-xs border-gray-500/30 text-gray-400 bg-gray-500/10 font-mono"
							>
								+{project.technologies.length - 3}
							</Badge>
						)}
					</div>
					{onEdit && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => onEdit(project)}
							className="border-2 border-purple-500/40 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/60 hover:text-purple-300 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/30"
						>
							<Edit className="w-4 h-4" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default ProjectCard;
