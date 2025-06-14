import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string | null;
	altText?: string;
}

export default function ImageModal({
	isOpen,
	onClose,
	imageUrl,
	altText = "Enlarged image",
}: ImageModalProps) {
	const [isZoomed, setIsZoomed] = useState(false);

	// Close modal on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	// Reset zoom when image changes or modal closes
	useEffect(() => {
		if (!isOpen || !imageUrl) {
			setIsZoomed(false);
		}
	}, [isOpen, imageUrl]);

	const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
		e.stopPropagation(); // Prevent click from closing modal if image is part of the backdrop click area
		setIsZoomed(!isZoomed);
	};

	if (!imageUrl) return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4"
					onClick={onClose} // Close on backdrop click
				>
					{/* Modal Content Container */}
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
						className="relative bg-background/80 border border-primary/50 rounded-lg shadow-2xl shadow-primary/30 overflow-hidden w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
						onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
					>
						{/* Terminal-style Header */}
						<div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/30 px-3 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
							<div className="flex items-center space-x-1.5 sm:space-x-2">
								<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full" />
								<div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full" />
								<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
							</div>
							<span className="text-xs font-mono text-primary/80 uppercase tracking-wider hidden sm:block">
								IMAGE_VIEW.SYS
							</span>
							<span className="text-xs font-mono text-primary/80 uppercase tracking-wider sm:hidden">
								IMG.SYS
							</span>
							<motion.button
								onClick={onClose}
								className="group relative p-1.5 sm:p-1 rounded-sm hover:bg-red-500/20 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
								aria-label="Close image viewer"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300 transition-colors" />
							</motion.button>
						</div>

						{/* Image Display Area */}
						<div
							className={`relative overflow-auto p-3 sm:p-4 flex-grow flex items-center justify-center ${
								isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
							}`}
						>
							<motion.img
								src={imageUrl}
								alt={altText}
								className={`block max-w-full max-h-full object-contain transition-transform duration-300 ease-out touch-manipulation ${
									isZoomed ? "scale-150" : "scale-100"
								}`}
								onClick={handleImageClick}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
								transition={{ duration: 0.3 }}
							/>
						</div>

						{/* Footer with Alt Text */}
						{altText && altText.trim() !== "" && (
							<div className="bg-background/50 border-t border-primary/30 px-3 sm:px-4 py-2 text-center flex-shrink-0">
								<p className="text-xs font-mono text-muted-foreground italic">
									{altText}
								</p>
							</div>
						)}
					</motion.div>

					{/* Hint to close */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.5 }}
						className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2"
					>
						<p className="text-xs font-mono text-muted-foreground/70 bg-black/50 px-2 sm:px-3 py-1 rounded-full">
							Press <kbd className="font-sans text-primary/90">ESC</kbd> or
							<span className="hidden sm:inline"> click background</span>
							<span className="sm:hidden"> tap outside</span> to close
						</p>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
}
