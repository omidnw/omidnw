import { TerminalState } from "@/components/CyberpunkTerminal/types";

// Tetris game state
interface TetrisState {
	board: number[][];
	currentPiece: Piece;
	nextPiece: Piece;
	score: number;
	level: number;
	lines: number;
	gameOver: boolean;
	isPlaying: boolean;
}

interface Piece {
	shape: number[][];
	x: number;
	y: number;
	type: number;
}

// Tetris pieces (7 different shapes)
const PIECES = [
	// I-piece
	[[1, 1, 1, 1]],
	// O-piece
	[
		[1, 1],
		[1, 1],
	],
	// T-piece
	[
		[0, 1, 0],
		[1, 1, 1],
	],
	// S-piece
	[
		[0, 1, 1],
		[1, 1, 0],
	],
	// Z-piece
	[
		[1, 1, 0],
		[0, 1, 1],
	],
	// J-piece
	[
		[1, 0, 0],
		[1, 1, 1],
	],
	// L-piece
	[
		[0, 0, 1],
		[1, 1, 1],
	],
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

let gameState: TetrisState | null = null;
let gameInterval: NodeJS.Timeout | null = null;

/**
 * Initialize a new Tetris game
 */
function initTetris(): TetrisState {
	return {
		board: Array(BOARD_HEIGHT)
			.fill(null)
			.map(() => Array(BOARD_WIDTH).fill(0)),
		currentPiece: createRandomPiece(),
		nextPiece: createRandomPiece(),
		score: 0,
		level: 1,
		lines: 0,
		gameOver: false,
		isPlaying: false,
	};
}

/**
 * Create a random piece
 */
function createRandomPiece(): Piece {
	const type = Math.floor(Math.random() * PIECES.length);
	return {
		shape: PIECES[type],
		x: Math.floor(BOARD_WIDTH / 2) - 1,
		y: 0,
		type: type + 1,
	};
}

/**
 * Check if a piece can be placed at the given position
 */
function canPlacePiece(
	board: number[][],
	piece: Piece,
	x: number,
	y: number
): boolean {
	for (let py = 0; py < piece.shape.length; py++) {
		for (let px = 0; px < piece.shape[py].length; px++) {
			if (piece.shape[py][px]) {
				const newX = x + px;
				const newY = y + py;

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
}

/**
 * Place a piece on the board
 */
function placePiece(board: number[][], piece: Piece): void {
	for (let py = 0; py < piece.shape.length; py++) {
		for (let px = 0; px < piece.shape[py].length; px++) {
			if (piece.shape[py][px]) {
				const x = piece.x + px;
				const y = piece.y + py;
				if (y >= 0) {
					board[y][x] = piece.type;
				}
			}
		}
	}
}

/**
 * Clear completed lines
 */
function clearLines(board: number[][]): number {
	let linesCleared = 0;

	for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
		if (board[y].every((cell) => cell !== 0)) {
			board.splice(y, 1);
			board.unshift(Array(BOARD_WIDTH).fill(0));
			linesCleared++;
			y++; // Check the same line again
		}
	}

	return linesCleared;
}

/**
 * Rotate a piece 90 degrees clockwise
 */
function rotatePiece(piece: Piece): Piece {
	const rotated = piece.shape[0].map((_, index) =>
		piece.shape.map((row) => row[index]).reverse()
	);

	return {
		...piece,
		shape: rotated,
	};
}

/**
 * Render the Tetris game
 */
function renderTetris(state: TetrisState): string {
	// Create a copy of the board for rendering
	const renderBoard = state.board.map((row) => [...row]);

	// Add current piece to render board
	if (!state.gameOver) {
		for (let py = 0; py < state.currentPiece.shape.length; py++) {
			for (let px = 0; px < state.currentPiece.shape[py].length; px++) {
				if (state.currentPiece.shape[py][px]) {
					const x = state.currentPiece.x + px;
					const y = state.currentPiece.y + py;
					if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
						renderBoard[y][x] = state.currentPiece.type;
					}
				}
			}
		}
	}

	// Convert board to string with cyberpunk styling
	const blockChars = ["⬛", "🟪", "🟦", "🟩", "🟨", "🟧", "🟥", "⬜"];

	let output = `
╔═══════════════════════════════════════════════════════════════╗
║                    🎮 CYBER TETRIS v2.077 🎮                 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║`;

	// Game board
	output += `
║  ┌────────────────────┬─────────────────────────────────────┐ ║`;

	for (let y = 0; y < BOARD_HEIGHT; y++) {
		output += `
║  │`;
		for (let x = 0; x < BOARD_WIDTH; x++) {
			output += blockChars[renderBoard[y][x]] || "⬛";
		}
		output += `│`;

		// Side panel info
		if (y === 1) {
			output += ` SCORE: ${state.score
				.toString()
				.padStart(8, "0")}            │ ║`;
		} else if (y === 2) {
			output += ` LEVEL: ${state.level}                             │ ║`;
		} else if (y === 3) {
			output += ` LINES: ${state.lines}                             │ ║`;
		} else if (y === 5) {
			output += ` NEXT:                               │ ║`;
		} else if (y >= 6 && y <= 8 && state.nextPiece) {
			const nextY = y - 6;
			output += ` `;
			if (nextY < state.nextPiece.shape.length) {
				for (let px = 0; px < 4; px++) {
					if (px < state.nextPiece.shape[nextY].length) {
						output += state.nextPiece.shape[nextY][px]
							? blockChars[state.nextPiece.type]
							: "⬛";
					} else {
						output += "⬛";
					}
				}
			} else {
				output += "⬛⬛⬛⬛";
			}
			output += `                           │ ║`;
		} else if (y === 12) {
			output += ` CONTROLS:                           │ ║`;
		} else if (y === 13) {
			output += ` A/D - Move Left/Right               │ ║`;
		} else if (y === 14) {
			output += ` S - Drop                            │ ║`;
		} else if (y === 15) {
			output += ` W - Rotate                          │ ║`;
		} else if (y === 16) {
			output += ` Q - Quit Game                       │ ║`;
		} else {
			output += `                                     │ ║`;
		}
	}

	output += `
║  └────────────────────┴─────────────────────────────────────┘ ║
║                                                               ║`;

	if (state.gameOver) {
		output += `
║                    🚨 GAME OVER - NEURAL CRASH 🚨             ║
║                    Type 'tetris' to jack back in             ║`;
	} else if (!state.isPlaying) {
		output += `
║                   Press SPACE to start the game              ║`;
	}

	output += `
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`;

	return output;
}

/**
 * Game loop for Tetris
 */
function gameLoop(): void {
	if (!gameState || gameState.gameOver || !gameState.isPlaying) {
		return;
	}

	// Try to move current piece down
	if (
		canPlacePiece(
			gameState.board,
			gameState.currentPiece,
			gameState.currentPiece.x,
			gameState.currentPiece.y + 1
		)
	) {
		gameState.currentPiece.y++;
	} else {
		// Place the piece
		placePiece(gameState.board, gameState.currentPiece);

		// Clear lines
		const linesCleared = clearLines(gameState.board);
		if (linesCleared > 0) {
			gameState.lines += linesCleared;
			gameState.score += linesCleared * 100 * gameState.level;
			gameState.level = Math.floor(gameState.lines / 10) + 1;
		}

		// Get next piece
		gameState.currentPiece = gameState.nextPiece;
		gameState.nextPiece = createRandomPiece();

		// Check game over
		if (
			!canPlacePiece(
				gameState.board,
				gameState.currentPiece,
				gameState.currentPiece.x,
				gameState.currentPiece.y
			)
		) {
			gameState.gameOver = true;
			gameState.isPlaying = false;
			if (gameInterval) {
				clearInterval(gameInterval);
				gameInterval = null;
			}
		}
	}
}

/**
 * Handle Tetris game input
 */
function handleTetrisInput(input: string): string {
	if (!gameState) {
		return "Error: Game not initialized";
	}

	const key = input.toLowerCase().trim();

	if (key === "q" || key === "quit") {
		if (gameInterval) {
			clearInterval(gameInterval);
			gameInterval = null;
		}
		gameState = null;
		return "Disconnected from CYBER TETRIS matrix...";
	}

	if (key === " " || key === "space") {
		if (!gameState.isPlaying && !gameState.gameOver) {
			gameState.isPlaying = true;
			gameInterval = setInterval(
				gameLoop,
				Math.max(50, 1000 - (gameState.level - 1) * 100)
			);
			return renderTetris(gameState);
		}
	}

	if (gameState.isPlaying && !gameState.gameOver) {
		switch (key) {
			case "a":
			case "left":
				if (
					canPlacePiece(
						gameState.board,
						gameState.currentPiece,
						gameState.currentPiece.x - 1,
						gameState.currentPiece.y
					)
				) {
					gameState.currentPiece.x--;
				}
				break;
			case "d":
			case "right":
				if (
					canPlacePiece(
						gameState.board,
						gameState.currentPiece,
						gameState.currentPiece.x + 1,
						gameState.currentPiece.y
					)
				) {
					gameState.currentPiece.x++;
				}
				break;
			case "s":
			case "down":
				if (
					canPlacePiece(
						gameState.board,
						gameState.currentPiece,
						gameState.currentPiece.x,
						gameState.currentPiece.y + 1
					)
				) {
					gameState.currentPiece.y++;
					gameState.score += 1;
				}
				break;
			case "w":
			case "up":
				const rotated = rotatePiece(gameState.currentPiece);
				if (canPlacePiece(gameState.board, rotated, rotated.x, rotated.y)) {
					gameState.currentPiece = rotated;
				}
				break;
		}
	}

	return renderTetris(gameState);
}

/**
 * Handle tetris command - now just triggers modal opening
 */
export const handleTetrisCommand = (
	args: string[],
	terminalState: TerminalState
): string => {
	// Signal to open the tetris game modal
	return "OPEN_TETRIS_MODAL";
};
