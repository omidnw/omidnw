import React, { useEffect, useRef, useState } from "react";
import {
	SnakeGame as SnakeGameLogic,
	SnakeScoreManager,
	SNAKE_BOARD_WIDTH,
	SNAKE_BOARD_HEIGHT,
	SNAKE_MOVE_INTERVAL,
	SnakeScore,
} from "./snake";

interface SnakeGameProps {
	onClose: () => void;
}

export default function SnakeGame({ onClose }: SnakeGameProps) {
	const snakeGameRef = useRef<SnakeGameLogic>(new SnakeGameLogic());
	const [gameState, setGameState] = useState(() =>
		snakeGameRef.current.getState()
	);
	const [scores, setScores] = useState<SnakeScore[]>([]);
	const [highScore, setHighScore] = useState(0);
	const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load scores when component mounts
	useEffect(() => {
		const loadScores = () => {
			setScores(SnakeScoreManager.getScores());
			setHighScore(SnakeScoreManager.getHighScore());
		};
		loadScores();
	}, []);

	// Setup game callbacks
	useEffect(() => {
		snakeGameRef.current.setMoveCallback(() => {
			setGameState(snakeGameRef.current.getState());
		});
		snakeGameRef.current.setGameOverCallback(() => {
			setGameState(snakeGameRef.current.getState());
			// Refresh scores after game over
			setScores(SnakeScoreManager.getScores());
			setHighScore(SnakeScoreManager.getHighScore());
		});
	}, []);

	// Game loop - with mobile-optimized timing
	useEffect(() => {
		if (gameState.gameStarted && !gameState.gameOver) {
			// Slower speed for mobile devices for better control
			const isMobile = window.innerWidth < 1024; // lg breakpoint
			const mobileInterval = isMobile
				? SNAKE_MOVE_INTERVAL * 1.3
				: SNAKE_MOVE_INTERVAL;

			gameIntervalRef.current = setInterval(() => {
				snakeGameRef.current.moveSnake();
			}, mobileInterval);
		}

		return () => {
			if (gameIntervalRef.current) {
				clearInterval(gameIntervalRef.current);
			}
		};
	}, [gameState.gameStarted, gameState.gameOver]);

	// Keyboard controls
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			// ESC key to close game modal
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}

			e.preventDefault();

			if (e.key === " ") {
				if (!gameState.gameStarted) {
					snakeGameRef.current.startGame();
					setGameState(snakeGameRef.current.getState());
				}
				return;
			}

			// Reset functionality with 'R' key
			if (e.key.toLowerCase() === "r") {
				snakeGameRef.current.resetGame();
				setGameState(snakeGameRef.current.getState());
				return;
			}

			// Pause functionality with 'P' key
			if (e.key.toLowerCase() === "p") {
				snakeGameRef.current.togglePause();
				setGameState(snakeGameRef.current.getState());
				return;
			}

			if (gameState.gameStarted && !gameState.gameOver) {
				switch (e.key.toLowerCase()) {
					case "w":
					case "arrowup":
						snakeGameRef.current.changeDirection("UP");
						break;
					case "s":
					case "arrowdown":
						snakeGameRef.current.changeDirection("DOWN");
						break;
					case "a":
					case "arrowleft":
						snakeGameRef.current.changeDirection("LEFT");
						break;
					case "d":
					case "arrowright":
						snakeGameRef.current.changeDirection("RIGHT");
						break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [gameState.gameStarted, gameState.gameOver, onClose]);

	// Virtual button handlers for mobile with haptic feedback
	const handleVirtualButton = (action: string) => {
		// Add haptic feedback for mobile devices
		const triggerHaptic = () => {
			if ("vibrate" in navigator) {
				navigator.vibrate(50); // Short vibration
			}
		};

		switch (action) {
			case "start":
				if (!gameState.gameStarted) {
					triggerHaptic();
					snakeGameRef.current.startGame();
					setGameState(snakeGameRef.current.getState());
				}
				break;
			case "reset":
				triggerHaptic();
				snakeGameRef.current.resetGame();
				setGameState(snakeGameRef.current.getState());
				break;
			case "pause":
				triggerHaptic();
				snakeGameRef.current.togglePause();
				setGameState(snakeGameRef.current.getState());
				break;
			case "up":
				if (gameState.gameStarted && !gameState.gameOver) {
					triggerHaptic();
					snakeGameRef.current.changeDirection("UP");
				}
				break;
			case "down":
				if (gameState.gameStarted && !gameState.gameOver) {
					triggerHaptic();
					snakeGameRef.current.changeDirection("DOWN");
				}
				break;
			case "left":
				if (gameState.gameStarted && !gameState.gameOver) {
					triggerHaptic();
					snakeGameRef.current.changeDirection("LEFT");
				}
				break;
			case "right":
				if (gameState.gameStarted && !gameState.gameOver) {
					triggerHaptic();
					snakeGameRef.current.changeDirection("RIGHT");
				}
				break;
		}
	};

	// Score management functions
	const handleExportScores = () => {
		const jsonData = SnakeScoreManager.exportScores();
		const blob = new Blob([jsonData], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "snake_scores.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleImportScores = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				if (SnakeScoreManager.importScores(content)) {
					setScores(SnakeScoreManager.getScores());
					setHighScore(SnakeScoreManager.getHighScore());
					alert("Scores imported successfully!");
				} else {
					alert("Failed to import scores. Invalid file format.");
				}
			};
			reader.readAsText(file);
		}
		// Reset the input
		if (event.target) {
			event.target.value = "";
		}
	};

	const handleClearScores = () => {
		if (confirm("Are you sure you want to clear all snake scores?")) {
			SnakeScoreManager.clearScores();
			setScores([]);
			setHighScore(0);
		}
	};

	// Add swipe gesture support for mobile (only for tablet and desktop)
	useEffect(() => {
		// Only enable swipe on tablet/desktop, not on mobile since we have touch zones
		const isMobile = window.innerWidth < 768; // md breakpoint
		if (isMobile) return;

		let touchStartX = 0;
		let touchStartY = 0;
		let touchEndX = 0;
		let touchEndY = 0;

		const handleTouchStart = (e: TouchEvent) => {
			touchStartX = e.changedTouches[0].screenX;
			touchStartY = e.changedTouches[0].screenY;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			touchEndX = e.changedTouches[0].screenX;
			touchEndY = e.changedTouches[0].screenY;
			handleSwipe();
		};

		const handleSwipe = () => {
			if (!gameState.gameStarted || gameState.gameOver) return;

			const deltaX = touchEndX - touchStartX;
			const deltaY = touchEndY - touchStartY;
			const minSwipeDistance = 50;

			// Check if swipe is significant enough
			if (
				Math.abs(deltaX) < minSwipeDistance &&
				Math.abs(deltaY) < minSwipeDistance
			) {
				return;
			}

			// Determine primary direction
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				// Horizontal swipe
				if (deltaX > 0) {
					snakeGameRef.current.changeDirection("RIGHT");
				} else {
					snakeGameRef.current.changeDirection("LEFT");
				}
			} else {
				// Vertical swipe
				if (deltaY > 0) {
					snakeGameRef.current.changeDirection("DOWN");
				} else {
					snakeGameRef.current.changeDirection("UP");
				}
			}

			// Trigger haptic feedback
			if ("vibrate" in navigator) {
				navigator.vibrate(30);
			}
		};

		// Add touch event listeners to the document for swipe detection
		document.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});
		document.addEventListener("touchend", handleTouchEnd, { passive: true });

		return () => {
			document.removeEventListener("touchstart", handleTouchStart);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [gameState.gameStarted, gameState.gameOver]);

	// Reset game when component mounts
	useEffect(() => {
		snakeGameRef.current.resetGame();
		setGameState(snakeGameRef.current.getState());
	}, []);

	return (
		<div className="w-full mx-auto">
			{/* Hidden file input for import */}
			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				onChange={handleImportScores}
				className="hidden"
			/>

			{/* Mobile Layout (Below md) - Touch-based design */}
			<div className="md:hidden">
				{/* Mobile: Game Board with Touch Zones */}
				<div className="relative p-1">
					{/* Compact Game Board - Smaller for mobile */}
					<div
						className="border border-pink-500 p-1 bg-gradient-to-br from-black to-gray-900 shadow-lg shadow-pink-500/20 rounded-lg mx-auto"
						style={{ width: "fit-content" }}
					>
						<div className="bg-black p-1 rounded border border-gray-700 relative">
							<div
								className="grid gap-px relative"
								style={{
									gridTemplateColumns: `repeat(${SNAKE_BOARD_WIDTH}, 0.7rem)`,
									gridTemplateRows: `repeat(${SNAKE_BOARD_HEIGHT}, 0.7rem)`,
								}}
							>
								{Array(SNAKE_BOARD_HEIGHT)
									.fill(null)
									.map((_, y) =>
										Array(SNAKE_BOARD_WIDTH)
											.fill(null)
											.map((_, x) => {
												const cellType = snakeGameRef.current.getCellType(x, y);
												let cellClass = "bg-gray-900";

												switch (cellType) {
													case "head":
														cellClass =
															"bg-red-500 shadow-sm shadow-red-500/50";
														break;
													case "body":
														cellClass =
															"bg-blue-500 shadow-sm shadow-blue-500/30";
														break;
													case "food":
														cellClass =
															"bg-green-500 shadow-sm shadow-green-500/50";
														break;
													default:
														cellClass = "bg-gray-900";
												}

												return (
													<div
														key={`${y}-${x}`}
														className={`w-3 h-3 transition-all duration-100 rounded-sm ${cellClass}`}
													/>
												);
											})
									)}
							</div>

							{/* Touch Zones Overlay - Smaller and cleaner */}
							<div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-auto">
								{/* Top row */}
								<div></div>
								<div
									className="bg-transparent active:bg-white/20 transition-colors duration-100 flex items-center justify-center cursor-pointer"
									onTouchStart={(e) => {
										e.preventDefault();
										handleVirtualButton("up");
									}}
									onClick={() => handleVirtualButton("up")}
								>
									<div className="text-white/10 text-sm pointer-events-none select-none">
										⬆️
									</div>
								</div>
								<div></div>

								{/* Middle row */}
								<div
									className="bg-transparent active:bg-white/20 transition-colors duration-100 flex items-center justify-center cursor-pointer"
									onTouchStart={(e) => {
										e.preventDefault();
										handleVirtualButton("left");
									}}
									onClick={() => handleVirtualButton("left")}
								>
									<div className="text-white/10 text-sm pointer-events-none select-none">
										⬅️
									</div>
								</div>
								<div></div>
								<div
									className="bg-transparent active:bg-white/20 transition-colors duration-100 flex items-center justify-center cursor-pointer"
									onTouchStart={(e) => {
										e.preventDefault();
										handleVirtualButton("right");
									}}
									onClick={() => handleVirtualButton("right")}
								>
									<div className="text-white/10 text-sm pointer-events-none select-none">
										➡️
									</div>
								</div>

								{/* Bottom row */}
								<div></div>
								<div
									className="bg-transparent active:bg-white/20 transition-colors duration-100 flex items-center justify-center cursor-pointer"
									onTouchStart={(e) => {
										e.preventDefault();
										handleVirtualButton("down");
									}}
									onClick={() => handleVirtualButton("down")}
								>
									<div className="text-white/10 text-sm pointer-events-none select-none">
										⬇️
									</div>
								</div>
								<div></div>
							</div>
						</div>
					</div>

					{/* Mobile Stats & Controls Below Game */}
					<div className="mt-2 space-y-1">
						{/* Compact Stats */}
						<div className="grid grid-cols-3 gap-1 text-xs">
							<div className="bg-black p-1 rounded border border-gray-700 text-center">
								<div className="text-yellow-400 font-bold">SCORE</div>
								<div className="text-green-400 font-mono">
									{gameState.score}
								</div>
							</div>
							<div className="bg-black p-1 rounded border border-gray-700 text-center">
								<div className="text-yellow-400 font-bold">LENGTH</div>
								<div className="text-purple-400 font-mono">
									{gameState.snake.length}
								</div>
							</div>
							<div className="bg-black p-1 rounded border border-gray-700 text-center">
								<div className="text-yellow-400 font-bold">HIGH</div>
								<div className="text-green-400 font-mono">{highScore}</div>
							</div>
						</div>

						{/* Game Controls */}
						<div className="grid grid-cols-3 gap-1">
							<button
								onClick={() => handleVirtualButton("start")}
								disabled={gameState.gameStarted}
								className="bg-green-600 hover:bg-green-500 active:bg-green-400 disabled:bg-gray-600 text-white text-xs py-2 rounded font-bold active:scale-95"
							>
								▶️ START
							</button>
							<button
								onClick={() => handleVirtualButton("pause")}
								disabled={!gameState.gameStarted || gameState.gameOver}
								className="bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 disabled:bg-gray-600 text-white text-xs py-2 rounded font-bold active:scale-95"
							>
								⏸️ PAUSE
							</button>
							<button
								onClick={() => handleVirtualButton("reset")}
								className="bg-red-600 hover:bg-red-500 active:bg-red-400 text-white text-xs py-2 rounded font-bold active:scale-95"
							>
								🔄 RESET
							</button>
						</div>

						{/* Status & Tips */}
						<div className="bg-black p-1 rounded border border-cyan-400 text-center">
							<div className="text-xs">
								{!gameState.gameStarted ? (
									<div className="text-yellow-400">
										🐍 Tap START or touch game area!
									</div>
								) : gameState.gameOver ? (
									<div className="text-red-500">💀 Game Over! Tap RESET</div>
								) : gameState.isPaused ? (
									<div className="text-yellow-400">⏸️ Paused</div>
								) : (
									<div className="text-green-400">
										🎯 Touch areas to control snake
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Tablet Layout (md to lg) */}
			<div className="hidden md:block lg:hidden space-y-4">
				{/* Tablet Top Bar - Stats & Status */}
				<div className="grid grid-cols-2 gap-3">
					{/* Game Stats Panel */}
					<div className="border-2 border-yellow-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-yellow-400/20">
						<div className="text-yellow-400 text-sm font-bold mb-2 text-center tracking-wider">
							🎯 STATS
						</div>
						<div className="space-y-2">
							<div className="bg-black p-2 rounded-lg border border-gray-700">
								<div className="text-yellow-400 text-xs font-bold mb-1">
									SCORE
								</div>
								<div className="text-lg font-mono text-green-400 tracking-wider">
									{gameState.score.toString().padStart(4, "0")}
								</div>
							</div>
							<div className="bg-black p-2 rounded-lg border border-gray-700">
								<div className="text-yellow-400 text-xs font-bold mb-1">
									LENGTH
								</div>
								<div className="text-sm text-purple-400 font-mono">
									{gameState.snake.length}
								</div>
							</div>
						</div>
					</div>

					{/* Snake Info & Status */}
					<div className="space-y-3">
						{/* Snake Direction */}
						<div className="border-2 border-green-400 bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-2xl shadow-green-400/20">
							<div className="text-green-400 text-xs font-bold mb-2 text-center tracking-wider">
								🐍 DIRECTION
							</div>
							<div className="bg-black p-2 rounded border border-gray-700">
								<div className="text-cyan-400 text-center text-sm">
									{gameState.direction === "UP" && "⬆️ UP"}
									{gameState.direction === "DOWN" && "⬇️ DOWN"}
									{gameState.direction === "LEFT" && "⬅️ LEFT"}
									{gameState.direction === "RIGHT" && "➡️ RIGHT"}
								</div>
							</div>
						</div>

						{/* Game Status */}
						<div className="border-2 border-cyan-400 bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-2xl shadow-cyan-400/20">
							<div className="text-xs text-center">
								{!gameState.gameStarted ? (
									<div className="text-yellow-400">
										🐍 Press SPACE to start!
									</div>
								) : gameState.gameOver ? (
									<div className="text-red-500">💀 Game Over! Press R</div>
								) : gameState.isPaused ? (
									<div className="text-yellow-400">⏸️ Paused. Press P</div>
								) : (
									<div className="text-green-400">🎯 Snake moving...</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Tablet Game Board */}
				<div className="flex justify-center px-2">
					<div className="border-3 border-pink-500 p-2 bg-gradient-to-br from-black to-gray-900 shadow-2xl shadow-pink-500/40 rounded-2xl max-w-full">
						<div className="bg-black p-3 rounded-xl border-2 border-gray-700">
							<div
								className="grid gap-1"
								style={{
									gridTemplateColumns: `repeat(${SNAKE_BOARD_WIDTH}, 1.4rem)`,
									gridTemplateRows: `repeat(${SNAKE_BOARD_HEIGHT}, 1.4rem)`,
								}}
							>
								{Array(SNAKE_BOARD_HEIGHT)
									.fill(null)
									.map((_, y) =>
										Array(SNAKE_BOARD_WIDTH)
											.fill(null)
											.map((_, x) => {
												const cellType = snakeGameRef.current.getCellType(x, y);
												let cellClass = "bg-gray-900 border-gray-800";

												switch (cellType) {
													case "head":
														cellClass =
															"bg-red-500 shadow-lg shadow-red-500/50 border-red-400";
														break;
													case "body":
														cellClass =
															"bg-blue-500 shadow-md shadow-blue-500/30 border-blue-400";
														break;
													case "food":
														cellClass =
															"bg-green-500 shadow-lg shadow-green-500/50 border-green-400";
														break;
													default:
														cellClass = "bg-gray-900 border-gray-800";
												}

												return (
													<div
														key={`${y}-${x}`}
														className={`w-5.5 h-5.5 border transition-all duration-100 rounded-sm aspect-square ${cellClass}`}
													/>
												);
											})
									)}
							</div>
						</div>
					</div>
				</div>

				{/* Tablet Virtual Controls */}
				<div className="space-y-3">
					{/* Game Action Buttons - Tablet optimized */}
					<div className="grid grid-cols-3 gap-3">
						<button
							onClick={() => handleVirtualButton("start")}
							disabled={gameState.gameStarted}
							className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 active:from-green-400 active:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm py-4 px-3 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
						>
							▶️ START
						</button>
						<button
							onClick={() => handleVirtualButton("pause")}
							disabled={!gameState.gameStarted || gameState.gameOver}
							className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 active:from-yellow-400 active:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm py-4 px-3 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
						>
							⏸️ PAUSE
						</button>
						<button
							onClick={() => handleVirtualButton("reset")}
							className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-400 active:to-red-500 text-white text-sm py-4 px-3 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
						>
							🔄 RESET
						</button>
					</div>

					{/* Snake Direction Controls - Optimized for tablet */}
					<div className="border-2 border-purple-400 bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl shadow-2xl shadow-purple-400/20">
						<div className="text-purple-400 text-sm font-bold mb-4 text-center tracking-wider">
							🐍 TOUCH CONTROLS
						</div>

						{/* D-pad style layout for better mobile gaming */}
						<div className="relative">
							{/* Top Row - Up */}
							<div className="flex justify-center mb-3">
								<button
									onClick={() => handleVirtualButton("up")}
									disabled={!gameState.gameStarted || gameState.gameOver}
									className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 active:from-green-400 active:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl py-4 px-8 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									⬆️
								</button>
							</div>

							{/* Middle Row - Left/Right */}
							<div className="flex justify-center items-center gap-8 mb-3">
								<button
									onClick={() => handleVirtualButton("left")}
									disabled={!gameState.gameStarted || gameState.gameOver}
									className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-400 active:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl py-4 px-8 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									⬅️
								</button>
								<button
									onClick={() => handleVirtualButton("right")}
									disabled={!gameState.gameStarted || gameState.gameOver}
									className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-400 active:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl py-4 px-8 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									➡️
								</button>
							</div>

							{/* Bottom Row - Down */}
							<div className="flex justify-center">
								<button
									onClick={() => handleVirtualButton("down")}
									disabled={!gameState.gameStarted || gameState.gameOver}
									className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 active:from-orange-400 active:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl py-4 px-8 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									⬇️
								</button>
							</div>
						</div>

						{/* Tablet tips */}
						<div className="mt-4 text-center space-y-1">
							<div className="text-xs text-yellow-400 opacity-75">
								💡 Tap directions or swipe to guide your snake
							</div>
							<div className="text-xs text-cyan-400 opacity-60">
								📱 Swipe anywhere on screen for quick control
							</div>
						</div>
					</div>

					{/* High Score Display */}
					<div className="border-2 border-pink-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-pink-400/20">
						<div className="text-pink-400 text-sm font-bold mb-2 text-center tracking-wider">
							🏆 HIGH SCORE
						</div>
						<div className="bg-black p-2 rounded-lg border border-gray-700">
							<div className="text-lg text-green-400 font-mono tracking-wider text-center">
								{highScore.toString().padStart(4, "0")}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop Layout (lg and above) */}
			<div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
				{/* Left Column - Game Stats & Status */}
				<div className="col-span-1 flex flex-col gap-4">
					{/* Game Info Panel */}
					<div className="border-2 border-yellow-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-yellow-400/20">
						<div className="text-yellow-400 text-base font-bold mb-3 text-center tracking-wider">
							🎯 STATS 🎯
						</div>
						<div className="space-y-3">
							<div className="bg-black p-3 rounded-lg border border-gray-700">
								<div className="text-yellow-400 text-xs font-bold mb-1">
									SCORE
								</div>
								<div className="text-2xl font-mono text-green-400 tracking-wider">
									{gameState.score.toString().padStart(4, "0")}
								</div>
							</div>
							<div className="bg-black p-2 rounded-lg border border-gray-700">
								<div className="text-yellow-400 text-xs font-bold mb-1">
									LENGTH
								</div>
								<div className="text-xl text-purple-400 font-mono">
									{gameState.snake.length}
								</div>
							</div>
						</div>
					</div>

					{/* Game Status */}
					<div className="border-2 border-cyan-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-cyan-400/20">
						<div className="text-cyan-400 text-base font-bold mb-3 text-center tracking-wider">
							⚡ STATUS ⚡
						</div>
						<div className="p-3 bg-black rounded-lg border border-gray-700">
							{!gameState.gameStarted ? (
								<div className="text-yellow-400 text-sm text-center">
									🐍 Press SPACE to start!
								</div>
							) : gameState.gameOver ? (
								<div className="text-red-500 text-sm text-center">
									💀 Game Over!
									<br />
									Press R to restart.
								</div>
							) : gameState.isPaused ? (
								<div className="text-yellow-400 text-sm text-center">
									⏸️ Game paused
									<br />
									Press P to resume.
								</div>
							) : (
								<div className="text-green-400 text-sm text-center">
									🎯 Snake is moving...
								</div>
							)}
						</div>
					</div>

					{/* Snake Info */}
					<div className="border-2 border-green-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-green-400/20">
						<div className="text-green-400 text-base font-bold mb-3 text-center tracking-wider">
							🐍 SNAKE INFO 🐍
						</div>
						<div className="space-y-2 text-xs">
							<div className="bg-black p-2 rounded border border-gray-700">
								<div className="text-yellow-400 text-xs font-bold mb-1">
									DIRECTION
								</div>
								<div className="text-cyan-400 text-center">
									{gameState.direction === "UP" && "⬆️ UP"}
									{gameState.direction === "DOWN" && "⬇️ DOWN"}
									{gameState.direction === "LEFT" && "⬅️ LEFT"}
									{gameState.direction === "RIGHT" && "➡️ RIGHT"}
								</div>
							</div>
							<div className="text-yellow-400 text-xs text-center">
								🍎 Snake moves automatically!
							</div>
						</div>
					</div>
				</div>

				{/* Center Column - Game Board */}
				<div className="col-span-3 flex justify-center">
					<div className="border-3 border-pink-500 p-4 bg-gradient-to-br from-black to-gray-900 shadow-2xl shadow-pink-500/40 rounded-2xl">
						<div className="bg-black p-3 rounded-xl border-2 border-gray-700">
							<div
								className="grid gap-0.5"
								style={{
									gridTemplateColumns: `repeat(${SNAKE_BOARD_WIDTH}, 1.5rem)`,
									gridTemplateRows: `repeat(${SNAKE_BOARD_HEIGHT}, 1.5rem)`,
								}}
							>
								{Array(SNAKE_BOARD_HEIGHT)
									.fill(null)
									.map((_, y) =>
										Array(SNAKE_BOARD_WIDTH)
											.fill(null)
											.map((_, x) => {
												const cellType = snakeGameRef.current.getCellType(x, y);
												let cellClass =
													"bg-gray-900 border-gray-800 hover:bg-gray-800";

												switch (cellType) {
													case "head":
														cellClass =
															"bg-red-500 shadow-lg shadow-red-500/50 border-red-400";
														break;
													case "body":
														cellClass =
															"bg-blue-500 shadow-md shadow-blue-500/30 border-blue-400";
														break;
													case "food":
														cellClass =
															"bg-green-500 shadow-lg shadow-green-500/50 border-green-400";
														break;
													default:
														cellClass =
															"bg-gray-900 border-gray-800 hover:bg-gray-800";
												}

												return (
													<div
														key={`${y}-${x}`}
														className={`w-6 h-6 border transition-all duration-100 rounded-sm aspect-square ${cellClass}`}
													/>
												);
											})
									)}
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Controls & High Scores */}
				<div className="col-span-1 flex flex-col gap-4">
					{/* Controls Panel */}
					<div className="border-2 border-purple-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-purple-400/20">
						<div className="text-purple-400 text-base font-bold mb-3 text-center tracking-wider">
							🎮 CONTROLS 🎮
						</div>
						<div className="space-y-2 text-xs">
							<div className="flex justify-between">
								<span className="text-gray-300">W</span>
								<span className="text-cyan-400">Turn Up</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">S</span>
								<span className="text-cyan-400">Turn Down</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">A</span>
								<span className="text-cyan-400">Turn Left</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">D</span>
								<span className="text-cyan-400">Turn Right</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">SPACE</span>
								<span className="text-cyan-400">Start</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">P</span>
								<span className="text-cyan-400">Pause</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">R</span>
								<span className="text-cyan-400">Reset</span>
							</div>
						</div>
					</div>

					{/* High Scores Panel */}
					<div className="border-2 border-pink-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-pink-400/20">
						<div className="text-pink-400 text-base font-bold mb-3 text-center tracking-wider">
							🏆 HIGH SCORES 🏆
						</div>
						<div className="bg-black p-2 rounded-lg border border-gray-700 mb-3">
							<div className="text-yellow-400 text-xs font-bold mb-1">
								CURRENT HIGH
							</div>
							<div className="text-lg text-green-400 font-mono tracking-wider">
								{highScore.toString().padStart(4, "0")}
							</div>
						</div>
						<div className="space-y-2">
							<div className="text-yellow-400 text-xs font-bold text-center">
								TOP SCORES
							</div>
							<div className="space-y-1 text-xs max-h-32 overflow-y-auto bg-black p-2 rounded border border-gray-700">
								{scores.length > 0 ? (
									scores.slice(0, 5).map((score, index) => (
										<div
											key={index}
											className={`flex justify-between items-center p-1 rounded text-xs ${
												index === 0
													? "bg-yellow-900/40 border border-yellow-600/30"
													: "bg-gray-800/30 hover:bg-gray-700/30"
											}`}
										>
											<span className="text-cyan-400">#{index + 1}</span>
											<span className="text-green-400 font-mono text-xs">
												{score.score}
											</span>
											<span className="text-blue-400">L{score.length}</span>
										</div>
									))
								) : (
									<div className="text-gray-400 text-center py-2 text-xs">
										No scores yet
									</div>
								)}
							</div>
						</div>
						<div className="space-y-2 mt-3">
							<div className="text-yellow-400 text-xs font-bold text-center">
								MANAGE
							</div>
							<div className="space-y-1">
								<button
									onClick={handleExportScores}
									className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs py-1.5 px-2 rounded-lg transition-all duration-200 shadow-lg"
								>
									📤 Export
								</button>
								<button
									onClick={() => fileInputRef.current?.click()}
									className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xs py-1.5 px-2 rounded-lg transition-all duration-200 shadow-lg"
								>
									📥 Import
								</button>
								<button
									onClick={handleClearScores}
									className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs py-1.5 px-2 rounded-lg transition-all duration-200 shadow-lg"
								>
									🗑️ Clear
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
