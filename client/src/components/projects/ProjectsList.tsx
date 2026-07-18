import React from "react";
import { Plus, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";

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

interface ProjectsListProps {
	projects: Project[];
	loading: boolean;
	onCreateClick: () => void;
	onEditProject?: (project: Project) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
	projects,
	loading,
	onCreateClick,
	onEditProject,
}) => {
	return (
		<div className="space-y-6 relative">
			{/* Background effects */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
			</div>

			{/* Header */}
			<div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-gray-900/90 border border-purple-500/20 backdrop-blur-xl">
				<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent rounded-2xl"></div>
				<div className="relative z-10 flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-mono mb-2">
							PROJECTS_MANAGEMENT
						</h1>
						<p className="text-gray-400 font-mono text-sm tracking-wide">
							Showcase your work and achievements
						</p>
					</div>
					<Button
						onClick={onCreateClick}
						className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all duration-300 font-mono border-0 overflow-hidden"
					>
						<span className="relative z-10 flex items-center">
							<Plus className="w-4 h-4 mr-2" />
							Add Project
						</span>
						<div className="absolute inset-0 bg-black/20"></div>
					</Button>
				</div>
			</div>

			{/* Projects grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{loading ? (
					<>
						<LoadingSkeleton type="project-card" />
						<LoadingSkeleton type="project-card" />
						<LoadingSkeleton type="project-card" />
						<LoadingSkeleton type="project-card" />
					</>
				) : projects.length === 0 ? (
					<div className="col-span-full">
						<EmptyState
							icon={Folder}
							title="No projects yet"
							description="Add your first project to showcase your work!"
							action={
								<Button
									onClick={onCreateClick}
									className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-0 overflow-hidden"
								>
									<span className="relative z-10 flex items-center">
										<Plus className="w-4 h-4 mr-2" />
										Add Project
									</span>
									<div className="absolute inset-0 bg-black/20"></div>
								</Button>
							}
						/>
					</div>
				) : (
					projects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onEdit={onEditProject}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default ProjectsList;
