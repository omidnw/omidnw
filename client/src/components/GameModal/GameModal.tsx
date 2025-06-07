import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import SnakeGameComponent from "./SnakeGame";
import TetrisGameComponent from "./TetrisGame";

export type GameType = "tetris" | "snake";

interface GameModalProps {
	isOpen: boolean;
	onClose: () => void;
	gameType: GameType;
}

export default function GameModal({
	isOpen,
	onClose,
	gameType,
}: GameModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	// Focus modal when it opens
	useEffect(() => {
		if (isOpen && modalRef.current) {
			modalRef.current.focus();
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="bg-gray-900 border-2 border-purple-500 p-3 lg:p-6 rounded-lg w-full mx-2 lg:mx-4 focus:outline-none max-w-7xl max-h-[95vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
				tabIndex={-1}
			>
				{/* Header */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text">
						{gameType === "tetris"
							? "🎮 CYBER TETRIS v2.077 🎮"
							: "🐍 CYBER SNAKE v2.077 🐍"}
					</h2>
					<button
						onClick={onClose}
						className="text-pink-500 hover:text-pink-300 transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				{/* Game Content */}
				{gameType === "snake" ? (
					<SnakeGameComponent onClose={onClose} />
				) : (
					<TetrisGameComponent onClose={onClose} />
				)}
			</div>
		</div>
	);
}
