import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export type GameType = "tetris" | "snake";

interface GameModalProps {
	isOpen: boolean;
	onClose: () => void;
	gameType: GameType;
}

// Simple Tetris piece type
interface TetrisPiece {
	shape: number[][];
	x: number;
	y: number;
	color: number;
}

// Snake point type
interface SnakePoint {
	x: number;
	y: number;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SNAKE_WIDTH = 20;
const SNAKE_HEIGHT = 15;

// Tetris pieces (simple shapes)
const TETRIS_SHAPES = [
	[[1, 1, 1, 1]], // I
	[
		[1, 1],
		[1, 1],
	], // O
	[
		[0, 1, 0],
		[1, 1, 1],
	], // T
	[
		[1, 1, 0],
		[0, 1, 1],
	], // Z
];

export default function GameModal({
	isOpen,
	onClose,
	gameType,
}: GameModalProps) {
	// Tetris state
	const [tetrisBoard, setTetrisBoard] = useState<number[][]>(
		Array(BOARD_HEIGHT)
			.fill(null)
			.map(() => Array(BOARD_WIDTH).fill(0))
	);
	const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
	const [tetrisScore, setTetrisScore] = useState(0);
	const [tetrisGameStarted, setTetrisGameStarted] = useState(false);

	// Snake state
	const [snake, setSnake] = useState<SnakePoint[]>([{ x: 10, y: 7 }]);
	const [food, setFood] = useState<SnakePoint>({ x: 15, y: 7 });
	const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">(
		"RIGHT"
	);
	const [snakeScore, setSnakeScore] = useState(0);
	const [snakeGameStarted, setSnakeGameStarted] = useState(false);
	const [snakeGameOver, setSnakeGameOver] = useState(false);

	const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const modalRef = useRef<HTMLDivElement>(null);

	// Generate random tetris piece
	const createRandomPiece = (): TetrisPiece => {
		const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length);
		return {
			shape: TETRIS_SHAPES[shapeIndex],
			x: Math.floor(BOARD_WIDTH / 2) - 1,
			y: 0,
			color: shapeIndex + 1,
		};
	};

	// Check if tetris piece can be placed
	const canPlacePiece = (
		piece: TetrisPiece,
		board: number[][],
		offsetX = 0,
		offsetY = 0
	): boolean => {
		for (let y = 0; y < piece.shape.length; y++) {
			for (let x = 0; x < piece.shape[y].length; x++) {
				if (piece.shape[y][x]) {
					const newX = piece.x + x + offsetX;
					const newY = piece.y + y + offsetY;

					if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
						return false;
					}
					if (newY >= 0 && board[newY][newX]) {
						return false;
					}
				}
			}
		}
		return true;
	};

	// Rotate tetris piece 90 degrees clockwise
	const rotatePiece = (shape: number[][]): number[][] => {
		const rows = shape.length;
		const cols = shape[0].length;
		const rotated = Array(cols)
			.fill(null)
			.map(() => Array(rows).fill(0));

		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				rotated[x][rows - 1 - y] = shape[y][x];
			}
		}
		return rotated;
	};

	// Place tetris piece on board
	const placePiece = (piece: TetrisPiece, board: number[][]) => {
		const newBoard = board.map((row) => [...row]);
		for (let y = 0; y < piece.shape.length; y++) {
			for (let x = 0; x < piece.shape[y].length; x++) {
				if (piece.shape[y][x]) {
					const boardX = piece.x + x;
					const boardY = piece.y + y;
					if (boardY >= 0) {
						newBoard[boardY][boardX] = piece.color;
					}
				}
			}
		}
		return newBoard;
	};

	// Clear completed lines in Tetris
	const clearLines = (board: number[][]) => {
		// Keep only incomplete lines (lines that have at least one empty cell)
		const newBoard = board.filter((row) => row.some((cell) => cell === 0));
		const linesCleared = BOARD_HEIGHT - newBoard.length;

		// Add empty lines at the top for each cleared line
		while (newBoard.length < BOARD_HEIGHT) {
			newBoard.unshift(Array(BOARD_WIDTH).fill(0));
		}

		return { board: newBoard, linesCleared };
	};

	// Snake game functions
	const generateFood = (currentSnake: SnakePoint[]): SnakePoint => {
		let newFood: SnakePoint;
		do {
			newFood = {
				x: Math.floor(Math.random() * SNAKE_WIDTH),
				y: Math.floor(Math.random() * SNAKE_HEIGHT),
			};
		} while (
			currentSnake.some(
				(segment) => segment.x === newFood.x && segment.y === newFood.y
			)
		);
		return newFood;
	};

	// Game loops
	useEffect(() => {
		if (!isOpen) return;

		if (gameType === "tetris" && tetrisGameStarted) {
			gameIntervalRef.current = setInterval(() => {
				setCurrentPiece((prevPiece) => {
					if (!prevPiece) return createRandomPiece();

					if (canPlacePiece(prevPiece, tetrisBoard, 0, 1)) {
						return { ...prevPiece, y: prevPiece.y + 1 };
					} else {
						// Place piece and create new one
						const boardWithPiece = placePiece(prevPiece, tetrisBoard);
						const { board: clearedBoard, linesCleared } =
							clearLines(boardWithPiece);
						setTetrisBoard(clearedBoard);
						setTetrisScore((prev) => prev + 10 + linesCleared * 100);
						return createRandomPiece();
					}
				});
			}, 500);
		}

		// Snake game doesn't use automatic movement - only moves on key press

		return () => {
			if (gameIntervalRef.current) {
				clearInterval(gameIntervalRef.current);
			}
		};
	}, [
		isOpen,
		gameType,
		tetrisGameStarted,
		snakeGameStarted,
		snakeGameOver,
		direction,
		food,
		tetrisBoard,
	]);

	// Keyboard controls
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyPress = (e: KeyboardEvent) => {
			e.preventDefault();

			if (e.key === " ") {
				if (gameType === "tetris" && !tetrisGameStarted) {
					setTetrisGameStarted(true);
					setCurrentPiece(createRandomPiece());
				} else if (gameType === "snake" && !snakeGameStarted) {
					setSnakeGameStarted(true);
				}
				return;
			}

			if (gameType === "tetris" && tetrisGameStarted && currentPiece) {
				switch (e.key.toLowerCase()) {
					case "a":
					case "arrowleft":
						if (canPlacePiece(currentPiece, tetrisBoard, -1, 0)) {
							setCurrentPiece((prev) =>
								prev ? { ...prev, x: prev.x - 1 } : null
							);
						}
						break;
					case "d":
					case "arrowright":
						if (canPlacePiece(currentPiece, tetrisBoard, 1, 0)) {
							setCurrentPiece((prev) =>
								prev ? { ...prev, x: prev.x + 1 } : null
							);
						}
						break;
					case "s":
					case "arrowdown":
						if (canPlacePiece(currentPiece, tetrisBoard, 0, 1)) {
							setCurrentPiece((prev) =>
								prev ? { ...prev, y: prev.y + 1 } : null
							);
						}
						break;
					case "w":
					case "arrowup":
						// Rotate piece
						const rotatedShape = rotatePiece(currentPiece.shape);
						const rotatedPiece = { ...currentPiece, shape: rotatedShape };
						if (canPlacePiece(rotatedPiece, tetrisBoard)) {
							setCurrentPiece(rotatedPiece);
						}
						break;
				}
			}

			if (gameType === "snake" && snakeGameStarted && !snakeGameOver) {
				const moveSnake = (newDirection: typeof direction) => {
					setSnake((prevSnake) => {
						const head = { ...prevSnake[0] };

						switch (newDirection) {
							case "UP":
								head.y--;
								break;
							case "DOWN":
								head.y++;
								break;
							case "LEFT":
								head.x--;
								break;
							case "RIGHT":
								head.x++;
								break;
						}

						// Check wall collision
						if (
							head.x < 0 ||
							head.x >= SNAKE_WIDTH ||
							head.y < 0 ||
							head.y >= SNAKE_HEIGHT
						) {
							setSnakeGameOver(true);
							return prevSnake;
						}

						// Check self collision
						if (
							prevSnake.some(
								(segment) => segment.x === head.x && segment.y === head.y
							)
						) {
							setSnakeGameOver(true);
							return prevSnake;
						}

						const newSnake = [head, ...prevSnake];

						// Check food collision
						if (head.x === food.x && head.y === food.y) {
							setSnakeScore((prev) => prev + 10);
							setFood(generateFood(newSnake));
							return newSnake;
						} else {
							return newSnake.slice(0, -1);
						}
					});
					setDirection(newDirection);
				};

				switch (e.key.toLowerCase()) {
					case "w":
					case "arrowup":
						if (direction !== "DOWN") moveSnake("UP");
						break;
					case "s":
					case "arrowdown":
						if (direction !== "UP") moveSnake("DOWN");
						break;
					case "a":
					case "arrowleft":
						if (direction !== "RIGHT") moveSnake("LEFT");
						break;
					case "d":
					case "arrowright":
						if (direction !== "LEFT") moveSnake("RIGHT");
						break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [
		isOpen,
		gameType,
		tetrisGameStarted,
		snakeGameStarted,
		snakeGameOver,
		currentPiece,
		direction,
		tetrisBoard,
	]);

	// Reset game state when modal opens
	useEffect(() => {
		if (isOpen) {
			// Reset Tetris
			setTetrisBoard(
				Array(BOARD_HEIGHT)
					.fill(null)
					.map(() => Array(BOARD_WIDTH).fill(0))
			);
			setCurrentPiece(null);
			setTetrisScore(0);
			setTetrisGameStarted(false);

			// Reset Snake
			const initialSnake = [{ x: 10, y: 7 }];
			setSnake(initialSnake);
			setFood(generateFood(initialSnake));
			setDirection("RIGHT");
			setSnakeScore(0);
			setSnakeGameStarted(false);
			setSnakeGameOver(false);
		}
	}, [isOpen, gameType]);

	// Focus modal
	useEffect(() => {
		if (isOpen && modalRef.current) {
			modalRef.current.focus();
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const blockColors = [
		"bg-black",
		"bg-purple-500",
		"bg-blue-500",
		"bg-green-500",
		"bg-yellow-500",
	];

	return (
		<div
			className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="bg-gray-900 border-2 border-purple-500 p-6 rounded-lg max-w-4xl w-full mx-4 focus:outline-none"
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
				<div className="flex gap-6">
					{/* Game Board */}
					<div className="border-2 border-pink-500 p-2 bg-black">
						{gameType === "tetris" ? (
							<div className="grid grid-cols-10 gap-px">
								{tetrisBoard.map((row, y) =>
									row.map((cell, x) => {
										// Check if current piece occupies this cell
										let cellColor = cell;
										if (currentPiece && tetrisGameStarted) {
											for (let py = 0; py < currentPiece.shape.length; py++) {
												for (
													let px = 0;
													px < currentPiece.shape[py].length;
													px++
												) {
													if (
														currentPiece.shape[py][px] &&
														currentPiece.x + px === x &&
														currentPiece.y + py === y
													) {
														cellColor = currentPiece.color;
													}
												}
											}
										}
										return (
											<div
												key={`${y}-${x}`}
												className={`w-6 h-6 border border-gray-700 ${
													blockColors[cellColor] || "bg-black"
												}`}
											/>
										);
									})
								)}
							</div>
						) : (
							<div
								className="inline-grid gap-px"
								style={{
									gridTemplateColumns: `repeat(${SNAKE_WIDTH}, minmax(0, 1fr))`,
								}}
							>
								{Array(SNAKE_HEIGHT)
									.fill(null)
									.map((_, y) =>
										Array(SNAKE_WIDTH)
											.fill(null)
											.map((_, x) => {
												let cellClass = "bg-black";

												// Check if snake head
												if (snake[0] && snake[0].x === x && snake[0].y === y) {
													cellClass = "bg-red-500";
												}
												// Check if snake body
												else if (
													snake
														.slice(1)
														.some(
															(segment) => segment.x === x && segment.y === y
														)
												) {
													cellClass = "bg-blue-500";
												}
												// Check if food
												else if (food.x === x && food.y === y) {
													cellClass = "bg-green-500";
												}

												return (
													<div
														key={`${y}-${x}`}
														className={`w-4 h-4 border border-gray-700 ${cellClass}`}
													/>
												);
											})
									)}
							</div>
						)}
					</div>

					{/* Side Panel */}
					<div className="text-pink-500 space-y-4 min-w-48">
						<div>
							<div className="text-yellow-400 text-lg font-bold">SCORE</div>
							<div className="text-2xl">
								{gameType === "tetris"
									? tetrisScore.toString().padStart(6, "0")
									: snakeScore.toString().padStart(4, "0")}
							</div>
						</div>

						<div className="text-sm space-y-1">
							<div className="text-yellow-400">CONTROLS:</div>
							{gameType === "tetris" ? (
								<>
									<div>A/D - Move Left/Right</div>
									<div>W - Rotate Piece</div>
									<div>S - Drop Faster</div>
									<div>SPACE - Start Game</div>
								</>
							) : (
								<>
									<div>W - Move UP</div>
									<div>S - Move DOWN</div>
									<div>A - Move LEFT</div>
									<div>D - Move RIGHT</div>
									<div>SPACE - Start Game</div>
									<div className="text-yellow-400 text-xs mt-2">
										Turn-based: Move only when you press keys!
									</div>
								</>
							)}
						</div>

						{/* Game Status */}
						<div className="mt-6">
							{gameType === "tetris" ? (
								!tetrisGameStarted ? (
									<div className="text-yellow-400">Press SPACE to start!</div>
								) : (
									<div className="text-green-400">Game running...</div>
								)
							) : !snakeGameStarted ? (
								<div className="text-yellow-400">Press SPACE to start!</div>
							) : snakeGameOver ? (
								<div className="text-red-500">
									Game Over! Close and reopen to restart.
								</div>
							) : (
								<div className="text-green-400">Game running...</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
