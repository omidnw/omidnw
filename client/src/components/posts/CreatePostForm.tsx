import React, { useState, useEffect } from "react";
import { X, Save, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";

interface CreatePostFormProps {
	onClose: () => void;
	onSuccess: () => void;
	editPost?: any;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({
	onClose,
	onSuccess,
	editPost,
}) => {
	const { apiCall } = useAdmin();
	const { toast } = useToast();
	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		excerpt: "",
		content: "",
		tags: [] as string[],
		isPublished: false,
	});
	const [tagInput, setTagInput] = useState("");
	const [saving, setSaving] = useState(false);

	// Load template on mount if not editing
	useEffect(() => {
		if (editPost) {
			setFormData({
				title: editPost.title,
				slug: editPost.slug,
				excerpt: editPost.excerpt || "",
				content: editPost.content,
				tags: editPost.tags || [],
				isPublished: editPost.isPublished,
			});
		} else {
			const loadTemplate = async () => {
				try {
					const response = await apiCall("/templates/post");
					const data = await response.json();
					if (data.success && data.template) {
						// Template is full MDX, let's just set some defaults
						setFormData((prev) => ({
							...prev,
							excerpt: "A brief description of your post",
							isPublished: true,
						}));
					}
				} catch (error) {
					console.error("Failed to load template", error);
				}
			};
			loadTemplate();
		}
	}, [apiCall, editPost]);

	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, tagInput.trim()],
			});
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	// Auto-generate slug when title changes
	useEffect(() => {
		if (!editPost) {
			setFormData((prev) => ({
				...prev,
				slug: generateSlug(prev.title),
			}));
		}
	}, [formData.title, editPost]);

	const handleSave = async () => {
		if (!formData.title.trim()) {
			toast({
				title: "Validation Error",
				description: "Title is required",
				variant: "destructive",
			});
			return;
		}
		if (!formData.slug.trim()) {
			toast({
				title: "Validation Error",
				description: "Slug is required",
				variant: "destructive",
			});
			return;
		}
		if (!formData.content.trim()) {
			toast({
				title: "Validation Error",
				description: "Content is required",
				variant: "destructive",
			});
			return;
		}

		setSaving(true);

		try {
			let response;
			if (editPost) {
				response = await apiCall(`/posts/${editPost.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				});
			} else {
				response = await apiCall("/posts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				});
			}
			const data = await response.json();

			if (data.success) {
				toast({
					title: editPost ? "Post Updated" : "Post Created",
					description: "Your post has been saved successfully.",
				});
				onSuccess();
			} else {
				throw new Error(data.error || "Failed to save post");
			}
		} catch (error) {
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to save post",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-cyan-500/30">
				<CardHeader className="border-b border-cyan-500/20">
					<div className="flex items-center justify-between">
						<CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
							{editPost ? "EDIT_POST" : "CREATE_NEW_POST"}
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="title" className="text-cyan-400 font-mono">
								<FileText className="w-4 h-4 inline mr-2" />
								Title *
							</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Enter post title..."
								className="bg-gray-800/50 border-gray-600 focus:border-cyan-500"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="slug" className="text-cyan-400 font-mono">
								Slug *
							</Label>
							<Input
								id="slug"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
								placeholder="enter-post-slug"
								className="bg-gray-800/50 border-gray-600 focus:border-cyan-500"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="excerpt" className="text-cyan-400 font-mono">
							Excerpt
						</Label>
						<Textarea
							id="excerpt"
							value={formData.excerpt}
							onChange={(e) =>
								setFormData({ ...formData, excerpt: e.target.value })
							}
							placeholder="Brief description of your post..."
							rows={2}
							className="bg-gray-800/50 border-gray-600 focus:border-cyan-500"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tags" className="text-cyan-400 font-mono">
							<Tag className="w-4 h-4 inline mr-2" />
							Tags
						</Label>
						<div className="flex gap-2">
							<Input
								id="tags"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddTag();
									}
								}}
								placeholder="Add tags..."
								className="bg-gray-800/50 border-gray-600 focus:border-cyan-500"
							/>
							<Button
								type="button"
								onClick={handleAddTag}
								variant="outline"
								className="border-cyan-500/30 hover:border-cyan-500"
							>
								Add
							</Button>
						</div>
						{formData.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.tags.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="cursor-pointer hover:bg-destructive/20"
										onClick={() => handleRemoveTag(tag)}
									>
										{tag}
										<X className="w-3 h-3 ml-1" />
									</Badge>
								))}
							</div>
						)}
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							id="published"
							checked={formData.isPublished}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, isPublished: checked })
							}
						/>
						<Label htmlFor="published" className="text-cyan-400 font-mono">
							Published
						</Label>
					</div>

					<div className="space-y-2">
						<Label htmlFor="content" className="text-cyan-400 font-mono">
							Content (Markdown) *
						</Label>
						<Textarea
							id="content"
							value={formData.content}
							onChange={(e) =>
								setFormData({ ...formData, content: e.target.value })
							}
							placeholder="Write your post content in markdown..."
							rows={12}
							className="bg-gray-800/50 border-gray-600 focus:border-cyan-500 font-mono text-sm"
						/>
						<p className="text-xs text-gray-400 font-mono">
							Supports full markdown syntax including code blocks, lists, links,
							etc.
						</p>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-cyan-500/20">
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
							className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)]"
						>
							<Save className="w-4 h-4 mr-2" />
							{saving ? "Saving..." : "Save Post"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default CreatePostForm;
