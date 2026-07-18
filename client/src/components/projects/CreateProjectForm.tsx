import React, { useState, useEffect } from "react";
import { X, Save, Folder, Star, Globe, Image } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";

interface CreateProjectFormProps {
	onClose: () => void;
	onSuccess: () => void;
	editProject?: any;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
	onClose,
	onSuccess,
	editProject,
}) => {
	const { apiCall } = useAdmin();
	const { toast } = useToast();
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		githubUrl: "",
		liveUrl: "",
		technologies: [] as string[],
		images: [] as string[],
		isPublished: false,
		featured: false,
	});
	const [techInput, setTechInput] = useState("");
	const [imageInput, setImageInput] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (editProject) {
			setFormData({
				title: editProject.title,
				description: editProject.description,
				githubUrl: editProject.githubUrl || "",
				liveUrl: editProject.liveUrl || "",
				technologies: editProject.technologies || [],
				images: editProject.images || [],
				isPublished: editProject.isPublished,
				featured: editProject.featured,
			});
		} else {
			// Load template default values
			const loadTemplate = async () => {
				try {
					const response = await apiCall("/templates/project");
					const data = await response.json();
					if (data.success && data.template) {
						setFormData((prev) => ({
							...prev,
							isPublished: true,
						}));
					}
				} catch (error) {
					console.error("Failed to load template", error);
				}
			};
			loadTemplate();
		}
	}, [apiCall, editProject]);

	const handleAddTech = () => {
		if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
			setFormData({
				...formData,
				technologies: [...formData.technologies, techInput.trim()],
			});
			setTechInput("");
		}
	};

	const handleRemoveTech = (tech: string) => {
		setFormData({
			...formData,
			technologies: formData.technologies.filter((t) => t !== tech),
		});
	};

	const handleAddImage = () => {
		if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
			setFormData({
				...formData,
				images: [...formData.images, imageInput.trim()],
			});
			setImageInput("");
		}
	};

	const handleRemoveImage = (image: string) => {
		setFormData({
			...formData,
			images: formData.images.filter((img) => img !== image),
		});
	};

	const handleSave = async () => {
		if (!formData.title.trim()) {
			toast({
				title: "Validation Error",
				description: "Title is required",
				variant: "destructive",
			});
			return;
		}
		if (!formData.description.trim()) {
			toast({
				title: "Validation Error",
				description: "Description is required",
				variant: "destructive",
			});
			return;
		}

		setSaving(true);

		try {
			let response;
			if (editProject) {
				response = await apiCall(`/projects/${editProject.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				});
			} else {
				response = await apiCall("/projects", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				});
			}
			const data = await response.json();

			if (data.success) {
				toast({
					title: editProject ? "Project Updated" : "Project Created",
					description: "Your project has been saved successfully.",
				});
				onSuccess();
			} else {
				throw new Error(data.error || "Failed to save project");
			}
		} catch (error) {
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to save project",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-500/30">
				<CardHeader className="border-b border-purple-500/20">
					<div className="flex items-center justify-between">
						<CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
							{editProject ? "EDIT_PROJECT" : "CREATE_NEW_PROJECT"}
						</CardTitle>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="text-gray-400 hover:text-white"
						>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</CardHeader>

				<CardContent className="p-6 space-y-6">
					<div className="space-y-2">
						<Label htmlFor="title" className="text-purple-400 font-mono">
							<Folder className="w-4 h-4 inline mr-2" />
							Title *
						</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							placeholder="Enter project title..."
							className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description" className="text-purple-400 font-mono">
							Description *
						</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Brief description of your project..."
							rows={4}
							className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="githubUrl" className="text-purple-400 font-mono">
								<SiGithub className="w-4 h-4 inline mr-2" />
								GitHub URL
							</Label>
							<Input
								id="githubUrl"
								value={formData.githubUrl}
								onChange={(e) =>
									setFormData({ ...formData, githubUrl: e.target.value })
								}
								placeholder="https://github.com/..."
								className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="liveUrl" className="text-purple-400 font-mono">
								<Globe className="w-4 h-4 inline mr-2" />
								Live URL
							</Label>
							<Input
								id="liveUrl"
								value={formData.liveUrl}
								onChange={(e) =>
									setFormData({ ...formData, liveUrl: e.target.value })
								}
								placeholder="https://..."
								className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="technologies" className="text-purple-400 font-mono">
							Technologies
						</Label>
						<div className="flex gap-2">
							<Input
								id="technologies"
								value={techInput}
								onChange={(e) => setTechInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddTech();
									}
								}}
								placeholder="Add technology (e.g. React, TypeScript)..."
								className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
							/>
							<Button
								type="button"
								onClick={handleAddTech}
								variant="outline"
								className="border-purple-500/30 hover:border-purple-500"
							>
								Add
							</Button>
						</div>
						{formData.technologies.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.technologies.map((tech) => (
									<Badge
										key={tech}
										variant="secondary"
										className="cursor-pointer hover:bg-destructive/20"
										onClick={() => handleRemoveTech(tech)}
									>
										{tech}
										<X className="w-3 h-3 ml-1" />
									</Badge>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="images" className="text-purple-400 font-mono">
							<Image className="w-4 h-4 inline mr-2" />
							Images (URLs)
						</Label>
						<div className="flex gap-2">
							<Input
								id="images"
								value={imageInput}
								onChange={(e) => setImageInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddImage();
									}
								}}
								placeholder="Add image URL..."
								className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
							/>
							<Button
								type="button"
								onClick={handleAddImage}
								variant="outline"
								className="border-purple-500/30 hover:border-purple-500"
							>
								Add
							</Button>
						</div>
						{formData.images.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.images.map((img) => (
									<Badge
										key={img}
										variant="secondary"
										className="cursor-pointer hover:bg-destructive/20 max-w-xs truncate"
										onClick={() => handleRemoveImage(img)}
									>
										{img}
										<X className="w-3 h-3 ml-1 flex-shrink-0" />
									</Badge>
								))}
							</div>
						)}
					</div>

					<div className="flex items-center space-x-6">
						<div className="flex items-center space-x-2">
							<Switch
								id="published"
								checked={formData.isPublished}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, isPublished: checked })
								}
							/>
							<Label htmlFor="published" className="text-purple-400 font-mono">
								Published
							</Label>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="featured"
								checked={formData.featured}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, featured: checked })
								}
							/>
							<Label htmlFor="featured" className="text-purple-400 font-mono">
								<Star className="w-4 h-4 inline mr-1" />
								Featured
							</Label>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
						<Button
							variant="outline"
							onClick={onClose}
							className="border-gray-600 hover:border-gray-500"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={saving}
							className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)]"
						>
							<Save className="w-4 h-4 mr-2" />
							{saving ? "Saving..." : "Save Project"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default CreateProjectForm;
