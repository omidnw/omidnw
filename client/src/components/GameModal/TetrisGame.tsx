import React, { useEffect, useRef, useState } from "react";
import {
	TetrisGame as TetrisGameLogic,
	TetrisScoreManager,
	TETRIS_BOARD_WIDTH,
	TETRIS_BOARD_HEIGHT,
	TetrisScore,
} from "./tetris";

interface TetrisGameProps {
	onClose: () => void;
}

export default function TetrisGame({ onClose }: TetrisGameProps) {
	const tetrisGameRef = useRef<TetrisGameLogic>(new TetrisGameLogic());
	const [gameState, setGameState] = useState(() =>
		tetrisGameRef.current.getState()
	);
	const [scores, setScores] = useState<TetrisScore[]>([]);
	const [highScore, setHighScore] = useState(0);
	const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load scores when component mounts
	useEffect(() => {
		const loadScores = () => {
			setScores(TetrisScoreManager.getScores());
			setHighScore(TetrisScoreManager.getHighScore());
		};
		loadScores();
	}, []);

	// Setup game callbacks
	useEffect(() => {
		tetrisGameRef.current.setUpdateCallback(() => {
			setGameState(tetrisGameRef.current.getState());
		});
		tetrisGameRef.current.setGameOverCallback(() => {
			setGameState(tetrisGameRef.current.getState());
			// Refresh scores after game over
			setScores(TetrisScoreManager.getScores());
			setHighScore(TetrisScoreManager.getHighScore());
		});
	}, []);

	// Game loop - with mobile-optimized timing
	useEffect(() => {
		if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
			// Slower speed for mobile devices
			const isMobile = window.innerWidth < 1024; // lg breakpoint
			const baseInterval = tetrisGameRef.current.getCurrentDropInterval();
			const mobileInterval = isMobile
				? Math.max(baseInterval * 1.5, 300)
				: baseInterval;

			gameIntervalRef.current = setInterval(() => {
				tetrisGameRef.current.dropPiece();
			}, mobileInterval);
		}

		return () => {
			if (gameIntervalRef.current) {
				clearInterval(gameIntervalRef.current);
			}
		};
	}, [gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

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
					tetrisGameRef.current.startGame();
					setGameState(tetrisGameRef.current.getState());
				} else if (
					gameState.gameStarted &&
					!gameState.gameOver &&
					!gameState.isPaused
				) {
					// Use space for hold when game is running
					tetrisGameRef.current.holdPiece();
				}
				return;
			}

			// Reset functionality with 'R' key
			if (e.key.toLowerCase() === "r") {
				tetrisGameRef.current.resetGame();
				setGameState(tetrisGameRef.current.getState());
				return;
			}

			// Pause functionality with 'P' key
			if (e.key.toLowerCase() === "p") {
				tetrisGameRef.current.togglePause();
				setGameState(tetrisGameRef.current.getState());
				return;
			}

			if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
				switch (e.key.toLowerCase()) {
					case "a":
					case "arrowleft":
						tetrisGameRef.current.movePiece("left");
						break;
					case "d":
					case "arrowright":
						tetrisGameRef.current.movePiece("right");
						break;
					case "s":
					case "arrowdown":
						tetrisGameRef.current.movePiece("down");
						break;
					case "w":
					case "arrowup":
						tetrisGameRef.current.rotatePiece();
						break;
					case "c":
						// Hold piece with C key
						tetrisGameRef.current.holdPiece();
						break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, onClose]);

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
					tetrisGameRef.current.startGame();
					setGameState(tetrisGameRef.current.getState());
				}
				break;
			case "reset":
				triggerHaptic();
				tetrisGameRef.current.resetGame();
				setGameState(tetrisGameRef.current.getState());
				break;
			case "pause":
				triggerHaptic();
				tetrisGameRef.current.togglePause();
				setGameState(tetrisGameRef.current.getState());
				break;
			case "left":
				if (
					gameState.gameStarted &&
					!gameState.gameOver &&
					!gameState.isPaused
				) {
					triggerHaptic();
					tetrisGameRef.current.movePiece("left");
				}
				break;
			case "right":
				if (
					gameState.gameStarted &&
					!gameState.gameOver &&
					!gameState.isPaused
				) {
					triggerHaptic();
					tetrisGameRef.current.movePiece("right");
				}
				break;
			case "down":
				if (
					gameState.gameStarted &&
					!gameState.gameOver &&
					!gameState.isPaused
				) {
					triggerHaptic();
					tetrisGameRef.current.movePiece("down");
				}
				break;
			case "rotate":
				if (
					gameState.gameStarted &&
					!gameState.gameOver &&
					!gameState.isPaused
				) {
					triggerHaptic();
					tetrisGameRef.current.rotatePiece();
				}
				break;
			case "hold":
				if (
					gameState.gameStarted &&
					!gameState.gameOver &&
					!gameState.isPaused
				) {
					triggerHaptic();
					tetrisGameRef.current.holdPiece();
				}
				break;
		}
	};

	// Score management functions
	const handleExportScores = () => {
		const jsonData = TetrisScoreManager.exportScores();
		const blob = new Blob([jsonData], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "tetris_scores.json";
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
				if (TetrisScoreManager.importScores(content)) {
					setScores(TetrisScoreManager.getScores());
					setHighScore(TetrisScoreManager.getHighScore());
					alert("Tetris scores imported successfully!");
				} else {
					alert("Failed to import tetris scores. Invalid file format.");
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
		if (confirm("Are you sure you want to clear all tetris scores?")) {
			TetrisScoreManager.clearScores();
			setScores([]);
			setHighScore(0);
		}
	};

	// Reset game when component mounts
	useEffect(() => {
		tetrisGameRef.current.resetGame();
		setGameState(tetrisGameRef.current.getState());
	}, []);

	const blockColors = [
		"bg-black",
		"bg-cyan-400 shadow-lg shadow-cyan-400/50", // I piece - bright cyan
		"bg-yellow-400 shadow-lg shadow-yellow-400/50", // O piece - bright yellow
		"bg-purple-500 shadow-lg shadow-purple-500/50", // T piece - purple
		"bg-red-500 shadow-lg shadow-red-500/50", // Z piece - red
		"bg-green-500 shadow-lg shadow-green-500/50", // S piece - green
		"bg-blue-600 shadow-lg shadow-blue-600/50", // J piece - dark blue
		"bg-orange-500 shadow-lg shadow-orange-500/50", // L piece - orange
	];

	const renderNextPiece = () => {
		const nextPiece = tetrisGameRef.current.getNextPiece();
		if (!nextPiece) return null;

		return (
			<div className="border-2 border-cyan-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-cyan-400/30">
				<div className="text-cyan-400 text-sm font-bold mb-3 text-center tracking-wider">
					⚡ NEXT PIECE ⚡
				</div>
				<div className="bg-black p-3 rounded-lg border border-gray-700 flex items-center justify-center min-h-[70px]">
					<div
						className="grid gap-1"
						style={{
							gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
						}}
					>
						{/* Create a 4x4 grid to center the piece properly */}
						{Array(4)
							.fill(null)
							.map((_, y) =>
								Array(4)
									.fill(null)
									.map((_, x) => {
										const pieceY =
											y - Math.floor((4 - nextPiece.shape.length) / 2);
										const pieceX =
											x - Math.floor((4 - nextPiece.shape[0].length) / 2);

										const isPartOfPiece =
											pieceY >= 0 &&
											pieceY < nextPiece.shape.length &&
											pieceX >= 0 &&
											pieceX < nextPiece.shape[pieceY]?.length &&
											nextPiece.shape[pieceY][pieceX];

										return (
											<div
												key={`${y}-${x}`}
												className={`w-5 h-5 border transition-all duration-200 rounded-sm ${
													isPartOfPiece
														? `${
																blockColors[nextPiece.color] || "bg-gray-500"
														  } border-gray-400`
														: "bg-transparent border-transparent"
												}`}
											/>
										);
									})
							)}
					</div>
				</div>
			</div>
		);
	};

	const renderHoldPiece = () => {
		const holdPiece = tetrisGameRef.current.getHoldPiece();

		return (
			<div className="border-2 border-purple-400 bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl shadow-2xl shadow-purple-400/30">
				<div className="text-purple-400 text-sm font-bold mb-3 text-center tracking-wider">
					🔄 HOLD PIECE 🔄
				</div>
				<div className="bg-black p-3 rounded-lg border border-gray-700 flex items-center justify-center min-h-[70px]">
					{holdPiece ? (
						<div
							className="grid gap-1"
							style={{
								gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
							}}
						>
							{/* Create a 4x4 grid to center the piece properly */}
							{Array(4)
								.fill(null)
								.map((_, y) =>
									Array(4)
										.fill(null)
										.map((_, x) => {
											const pieceY =
												y - Math.floor((4 - holdPiece.shape.length) / 2);
											const pieceX =
												x - Math.floor((4 - holdPiece.shape[0].length) / 2);

											const isPartOfPiece =
												pieceY >= 0 &&
												pieceY < holdPiece.shape.length &&
												pieceX >= 0 &&
												pieceX < holdPiece.shape[pieceY]?.length &&
												holdPiece.shape[pieceY][pieceX];

											return (
												<div
													key={`${y}-${x}`}
													className={`w-5 h-5 border transition-all duration-200 rounded-sm ${
														isPartOfPiece
															? `${
																	blockColors[holdPiece.color] || "bg-gray-500"
															  } border-gray-400 ${
																	!gameState.canHold ? "opacity-50" : ""
															  }`
															: "bg-transparent border-transparent"
													}`}
												/>
											);
										})
								)}
						</div>
					) : (
						<div className="text-gray-500 text-xs text-center">
							Press C or SPACE
							<br />
							to hold piece
						</div>
					)}
				</div>
			</div>
		);
	};

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

			{/* Mobile Layout (Below md) - Compact side-by-side design */}
			<div className="md:hidden">
				{/* Mobile: Game + Controls Side by Side */}
				<div className="flex gap-2 p-2">
					{/* Left: Compact Game Board */}
					<div className="flex-1">
						<div className="border-2 border-pink-500 p-1 bg-gradient-to-br from-black to-gray-900 shadow-xl shadow-pink-500/30 rounded-lg">
							<div className="grid grid-cols-10 gap-px bg-black p-1 rounded border border-gray-700">
								{tetrisGameRef.current
									.getBoardWithCurrentPiece()
									.map((row, y) =>
										row.map((cell, x) => {
											return (
												<div
													key={`${y}-${x}`}
													className={`w-3 h-3 border-0 transition-all duration-200 rounded-sm ${
														cell
															? `${blockColors[cell]} shadow-sm`
															: "bg-gray-900"
													}`}
												/>
											);
										})
									)}
							</div>
						</div>

						{/* Mobile Stats Bar */}
						<div className="mt-2 grid grid-cols-3 gap-1 text-xs">
							<div className="bg-black p-1 rounded border border-gray-700 text-center">
								<div className="text-yellow-400 font-bold">SCORE</div>
								<div className="text-green-400 font-mono">
									{gameState.score}
								</div>
							</div>
							<div className="bg-black p-1 rounded border border-gray-700 text-center">
								<div className="text-yellow-400 font-bold">LV</div>
								<div className="text-purple-400 font-mono">
									{gameState.level}
								</div>
							</div>
							<div className="bg-black p-1 rounded border border-gray-700 text-center">
								<div className="text-yellow-400 font-bold">LINES</div>
								<div className="text-blue-400 font-mono">{gameState.lines}</div>
							</div>
						</div>
					</div>

					{/* Right: Touch Controls */}
					<div className="w-32 space-y-2">
						{/* Next & Hold Pieces - Compact */}
						<div className="space-y-2">
							{/* Next Piece */}
							<div className="border border-cyan-400 bg-black p-1 rounded">
								<div className="text-cyan-400 text-xs font-bold mb-1 text-center">
									NEXT
								</div>
								<div className="bg-gray-900 p-1 rounded flex items-center justify-center h-8">
									{renderNextPiece() ? (
										<div
											className="grid gap-px"
											style={{
												gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
											}}
										>
											{Array(4)
												.fill(null)
												.map((_, y) =>
													Array(4)
														.fill(null)
														.map((_, x) => {
															const nextPiece =
																tetrisGameRef.current.getNextPiece();
															if (!nextPiece) return null;
															const pieceY =
																y -
																Math.floor((4 - nextPiece.shape.length) / 2);
															const pieceX =
																x -
																Math.floor((4 - nextPiece.shape[0].length) / 2);
															const isPartOfPiece =
																pieceY >= 0 &&
																pieceY < nextPiece.shape.length &&
																pieceX >= 0 &&
																pieceX < nextPiece.shape[pieceY]?.length &&
																nextPiece.shape[pieceY][pieceX];
															return (
																<div
																	key={`${y}-${x}`}
																	className={`w-1.5 h-1.5 ${
																		isPartOfPiece
																			? `${blockColors[nextPiece.color]}`
																			: "bg-transparent"
																	}`}
																/>
															);
														})
												)}
										</div>
									) : null}
								</div>
							</div>

							{/* Hold Piece */}
							<div className="border border-purple-400 bg-black p-1 rounded">
								<div className="text-purple-400 text-xs font-bold mb-1 text-center">
									HOLD
								</div>
								<div className="bg-gray-900 p-1 rounded flex items-center justify-center h-8">
									{(() => {
										const holdPiece = tetrisGameRef.current.getHoldPiece();
										return holdPiece ? (
											<div
												className="grid gap-px"
												style={{
													gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
												}}
											>
												{Array(4)
													.fill(null)
													.map((_, y) =>
														Array(4)
															.fill(null)
															.map((_, x) => {
																const pieceY =
																	y -
																	Math.floor((4 - holdPiece.shape.length) / 2);
																const pieceX =
																	x -
																	Math.floor(
																		(4 - holdPiece.shape[0].length) / 2
																	);
																const isPartOfPiece =
																	pieceY >= 0 &&
																	pieceY < holdPiece.shape.length &&
																	pieceX >= 0 &&
																	pieceX < holdPiece.shape[pieceY]?.length &&
																	holdPiece.shape[pieceY][pieceX];
																return (
																	<div
																		key={`${y}-${x}`}
																		className={`w-1.5 h-1.5 ${
																			isPartOfPiece
																				? `${blockColors[holdPiece.color]} ${
																						!gameState.canHold
																							? "opacity-50"
																							: ""
																				  }`
																				: "bg-transparent"
																		}`}
																	/>
																);
															})
													)}
											</div>
										) : (
											<div className="text-gray-500 text-xs text-center">-</div>
										);
									})()}
								</div>
							</div>
						</div>

						{/* Touch Controls - Vertical Layout */}
						<div className="space-y-1">
							{/* Rotate & Hold */}
							<div className="grid grid-cols-2 gap-1">
								<button
									onClick={() => handleVirtualButton("rotate")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-purple-600 hover:bg-purple-500 active:bg-purple-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
								>
									🔄
								</button>
								<button
									onClick={() => handleVirtualButton("hold")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused ||
										!gameState.canHold
									}
									className="bg-purple-600 hover:bg-purple-500 active:bg-purple-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
								>
									📦
								</button>
							</div>

							{/* Left/Right */}
							<div className="grid grid-cols-2 gap-1">
								<button
									onClick={() => handleVirtualButton("left")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-blue-600 hover:bg-blue-500 active:bg-blue-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
								>
									⬅️
								</button>
								<button
									onClick={() => handleVirtualButton("right")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-blue-600 hover:bg-blue-500 active:bg-blue-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
								>
									➡️
								</button>
							</div>

							{/* Drop */}
							<button
								onClick={() => handleVirtualButton("down")}
								disabled={
									!gameState.gameStarted ||
									gameState.gameOver ||
									gameState.isPaused
								}
								className="w-full bg-orange-600 hover:bg-orange-500 active:bg-orange-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
							>
								⬇️
							</button>
						</div>

						{/* Game Controls */}
						<div className="space-y-1">
							<button
								onClick={() => handleVirtualButton("start")}
								disabled={gameState.gameStarted}
								className="w-full bg-green-600 hover:bg-green-500 active:bg-green-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
							>
								▶️
							</button>
							<button
								onClick={() => handleVirtualButton("pause")}
								disabled={!gameState.gameStarted || gameState.gameOver}
								className="w-full bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 disabled:bg-gray-600 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
							>
								⏸️
							</button>
							<button
								onClick={() => handleVirtualButton("reset")}
								className="w-full bg-red-600 hover:bg-red-500 active:bg-red-400 text-white text-xs py-2 rounded transition-all duration-100 font-bold active:scale-95"
							>
								🔄
							</button>
						</div>

						{/* High Score */}
						<div className="bg-black p-2 rounded border border-pink-400 text-center">
							<div className="text-pink-400 text-xs font-bold">HIGH</div>
							<div className="text-green-400 text-xs font-mono">
								{highScore}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Tablet Layout (md to lg) */}
			<div className="hidden md:block lg:hidden space-y-4">
				{/* Similar to current mobile but with larger elements */}
				<div className="grid grid-cols-2 gap-4">
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
									{gameState.score.toString().padStart(6, "0")}
								</div>
							</div>
							<div className="grid grid-cols-2 gap-1">
								<div className="bg-black p-1 rounded border border-gray-700">
									<div className="text-yellow-400 text-xs font-bold">LV</div>
									<div className="text-sm text-purple-400 font-mono">
										{gameState.level}
									</div>
								</div>
								<div className="bg-black p-1 rounded border border-gray-700">
									<div className="text-yellow-400 text-xs font-bold">LINES</div>
									<div className="text-sm text-blue-400 font-mono">
										{gameState.lines}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Next Piece & Status */}
					<div className="space-y-3">
						{renderNextPiece()}
						<div className="border-2 border-green-400 bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-2xl shadow-green-400/20">
							<div className="text-xs text-center">
								{!gameState.gameStarted ? (
									<div className="text-yellow-400">⚡ Tap START to begin!</div>
								) : gameState.gameOver ? (
									<div className="text-red-500">💀 Game Over! Tap RESET</div>
								) : gameState.isPaused ? (
									<div className="text-yellow-400">⏸️ Paused</div>
								) : (
									<div className="text-green-400">🎯 Running...</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Tablet Game Board */}
				<div className="flex justify-center px-2">
					<div className="border-3 border-pink-500 p-2 bg-gradient-to-br from-black to-gray-900 shadow-2xl shadow-pink-500/40 rounded-2xl max-w-full">
						<div className="grid grid-cols-10 gap-1 bg-black p-3 rounded-xl border-2 border-gray-700">
							{tetrisGameRef.current.getBoardWithCurrentPiece().map((row, y) =>
								row.map((cell, x) => {
									return (
										<div
											key={`${y}-${x}`}
											className={`w-6 h-6 border transition-all duration-200 rounded-sm ${
												cell
													? `${blockColors[cell]} border-gray-400 shadow-lg`
													: "bg-gray-900 border-gray-800"
											}`}
										/>
									);
								})
							)}
						</div>
					</div>
				</div>

				{/* Tablet Controls */}
				<div className="space-y-3">
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

					<div className="border-2 border-purple-400 bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl shadow-2xl shadow-purple-400/20">
						<div className="text-purple-400 text-sm font-bold mb-4 text-center tracking-wider">
							🎮 TOUCH CONTROLS
						</div>
						<div className="space-y-3">
							<div className="flex justify-center">
								<button
									onClick={() => handleVirtualButton("rotate")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 active:from-purple-400 active:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-xl py-4 px-8 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									🔄 ROTATE
								</button>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={() => handleVirtualButton("left")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-400 active:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl py-4 px-6 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									⬅️
								</button>
								<button
									onClick={() => handleVirtualButton("right")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-400 active:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl py-4 px-6 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									➡️
								</button>
							</div>
							<div className="flex justify-center">
								<button
									onClick={() => handleVirtualButton("down")}
									disabled={
										!gameState.gameStarted ||
										gameState.gameOver ||
										gameState.isPaused
									}
									className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 active:from-orange-400 active:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-xl py-4 px-8 rounded-xl transition-all duration-100 shadow-lg font-bold active:scale-95"
								>
									⬇️ FAST DROP
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop Layout (lg and above) */}
			<div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
				{/* Left Column - Next Piece & Game Stats */}
				<div className="col-span-1 flex flex-col gap-4">
					{/* Next Piece Preview */}
					{renderNextPiece()}

					{/* Hold Piece Preview */}
					{renderHoldPiece()}

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
									{gameState.score.toString().padStart(6, "0")}
								</div>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="bg-black p-2 rounded-lg border border-gray-700">
									<div className="text-yellow-400 text-xs font-bold mb-1">
										LEVEL
									</div>
									<div className="text-xl text-purple-400 font-mono">
										{gameState.level}
									</div>
								</div>
								<div className="bg-black p-2 rounded-lg border border-gray-700">
									<div className="text-yellow-400 text-xs font-bold mb-1">
										LINES
									</div>
									<div className="text-xl text-blue-400 font-mono">
										{gameState.lines}
									</div>
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
									⚡ Press SPACE to start!
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
									🎯 Game running...
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Center Column - Game Board */}
				<div className="col-span-3 flex justify-center">
					<div className="border-3 border-pink-500 p-4 bg-gradient-to-br from-black to-gray-900 shadow-2xl shadow-pink-500/40 rounded-2xl">
						<div className="grid grid-cols-10 gap-0.5 bg-black p-3 rounded-xl border-2 border-gray-700">
							{tetrisGameRef.current.getBoardWithCurrentPiece().map((row, y) =>
								row.map((cell, x) => {
									return (
										<div
											key={`${y}-${x}`}
											className={`w-6 h-6 border transition-all duration-200 rounded-sm ${
												cell
													? `${blockColors[cell]} border-gray-400 shadow-lg`
													: "bg-gray-900 border-gray-800 hover:bg-gray-800"
											}`}
										/>
									);
								})
							)}
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
								<span className="text-gray-300">A/D</span>
								<span className="text-cyan-400">Move L/R</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">W</span>
								<span className="text-cyan-400">Rotate</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">S</span>
								<span className="text-cyan-400">Drop Fast</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">SPACE</span>
								<span className="text-cyan-400">Start/Hold</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-300">C</span>
								<span className="text-cyan-400">Hold</span>
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
								{highScore.toString().padStart(6, "0")}
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
											<span className="text-purple-400">L{score.level}</span>
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
