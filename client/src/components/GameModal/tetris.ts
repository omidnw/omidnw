export interface TetrisPiece {
	shape: number[][];
	x: number;
	y: number;
	color: number;
}

export interface TetrisGameState {
	board: number[][];
	currentPiece: TetrisPiece | null;
	nextPiece: TetrisPiece | null;
	holdPiece: TetrisPiece | null;
	canHold: boolean;
	score: number;
	lines: number;
	level: number;
	gameStarted: boolean;
	gameOver: boolean;
	isPaused: boolean;
}

export interface TetrisScore {
	score: number;
	lines: number;
	level: number;
	date: string;
}

export const TETRIS_BOARD_WIDTH = 10;
export const TETRIS_BOARD_HEIGHT = 20;
export const TETRIS_MOVE_INTERVAL = 500; // Base interval, gets faster with level

// Tetris piece shapes
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
	[
		[0, 1, 1],
		[1, 1, 0],
	], // S
	[
		[1, 0, 0],
		[1, 1, 1],
	], // J
	[
		[0, 0, 1],
		[1, 1, 1],
	], // L
];

export class TetrisScoreManager {
	private static readonly STORAGE_KEY = "tetris_high_scores";
	private static readonly MAX_SCORES = 10;

	public static saveScore(score: number, lines: number, level: number): void {
		const scores = this.getScores();
		const newScore: TetrisScore = {
			score,
			lines,
			level,
			date: new Date().toLocaleDateString(),
		};

		scores.push(newScore);
		scores.sort((a, b) => b.score - a.score); // Sort by score descending
		const topScores = scores.slice(0, this.MAX_SCORES);

		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
	}

	public static getScores(): TetrisScore[] {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	public static getHighScore(): number {
		const scores = this.getScores();
		return scores.length > 0 ? scores[0].score : 0;
	}

	public static exportScores(): string {
		const scores = this.getScores();
		return JSON.stringify(scores, null, 2);
	}

	public static importScores(jsonData: string): boolean {
		try {
			const scores = JSON.parse(jsonData) as TetrisScore[];
			if (Array.isArray(scores)) {
				// Validate the structure
				const validScores = scores.filter(
					(score) =>
						typeof score.score === "number" &&
						typeof score.lines === "number" &&
						typeof score.level === "number" &&
						typeof score.date === "string"
				);

				if (validScores.length > 0) {
					const existingScores = this.getScores();
					const allScores = [...existingScores, ...validScores];
					allScores.sort((a, b) => b.score - a.score);
					const topScores = allScores.slice(0, this.MAX_SCORES);

					localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
					return true;
				}
			}
			return false;
		} catch {
			return false;
		}
	}

	public static clearScores(): void {
		localStorage.removeItem(this.STORAGE_KEY);
	}
}

export class TetrisGame {
	private state: TetrisGameState;
	private updateCallback?: () => void;
	private gameOverCallback?: () => void;

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): TetrisGameState {
		return {
			board: Array(TETRIS_BOARD_HEIGHT)
				.fill(null)
				.map(() => Array(TETRIS_BOARD_WIDTH).fill(0)),
			currentPiece: null,
			nextPiece: null,
			holdPiece: null,
			canHold: true,
			score: 0,
			lines: 0,
			level: 1,
			gameStarted: false,
			gameOver: false,
			isPaused: false,
		};
	}

	public getState(): TetrisGameState {
		return {
			...this.state,
			board: this.state.board.map((row) => [...row]), // Deep copy board
		};
	}

	public setUpdateCallback(callback: () => void): void {
		this.updateCallback = callback;
	}

	public setGameOverCallback(callback: () => void): void {
		this.gameOverCallback = callback;
	}

	public startGame(): void {
		this.state.gameStarted = true;
		this.state.currentPiece = this.createRandomPiece();
		this.state.nextPiece = this.createRandomPiece();
		if (this.updateCallback) {
			this.updateCallback();
		}
	}

	public resetGame(): void {
		this.state = this.createInitialState();
		if (this.updateCallback) {
			this.updateCallback();
		}
	}

	public togglePause(): boolean {
		if (!this.state.gameStarted || this.state.gameOver) {
			return false;
		}

		this.state.isPaused = !this.state.isPaused;
		if (this.updateCallback) {
			this.updateCallback();
		}
		return this.state.isPaused;
	}

	private createRandomPiece(): TetrisPiece {
		const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length);
		return {
			shape: TETRIS_SHAPES[shapeIndex],
			x: Math.floor(TETRIS_BOARD_WIDTH / 2) - 1,
			y: 0,
			color: shapeIndex + 1,
		};
	}

	public canPlacePiece(piece: TetrisPiece, offsetX = 0, offsetY = 0): boolean {
		for (let y = 0; y < piece.shape.length; y++) {
			for (let x = 0; x < piece.shape[y].length; x++) {
				if (piece.shape[y][x]) {
					const newX = piece.x + x + offsetX;
					const newY = piece.y + y + offsetY;

					if (
						newX < 0 ||
						newX >= TETRIS_BOARD_WIDTH ||
						newY >= TETRIS_BOARD_HEIGHT
					) {
						return false;
					}
					if (newY >= 0 && this.state.board[newY][newX]) {
						return false;
					}
				}
			}
		}
		return true;
	}

	public movePiece(direction: "left" | "right" | "down"): boolean {
		if (
			!this.state.currentPiece ||
			this.state.gameOver ||
			this.state.isPaused
		) {
			return false;
		}

		const offsetX = direction === "left" ? -1 : direction === "right" ? 1 : 0;
		const offsetY = direction === "down" ? 1 : 0;

		if (this.canPlacePiece(this.state.currentPiece, offsetX, offsetY)) {
			this.state.currentPiece.x += offsetX;
			this.state.currentPiece.y += offsetY;

			if (this.updateCallback) {
				this.updateCallback();
			}
			return true;
		}

		return false;
	}

	public rotatePiece(): boolean {
		if (
			!this.state.currentPiece ||
			this.state.gameOver ||
			this.state.isPaused
		) {
			return false;
		}

		const rotatedShape = this.rotateMatrix(this.state.currentPiece.shape);
		const rotatedPiece = { ...this.state.currentPiece, shape: rotatedShape };

		if (this.canPlacePiece(rotatedPiece)) {
			this.state.currentPiece.shape = rotatedShape;
			if (this.updateCallback) {
				this.updateCallback();
			}
			return true;
		}

		return false;
	}

	private rotateMatrix(matrix: number[][]): number[][] {
		const rows = matrix.length;
		const cols = matrix[0].length;
		const rotated = Array(cols)
			.fill(null)
			.map(() => Array(rows).fill(0));

		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				rotated[x][rows - 1 - y] = matrix[y][x];
			}
		}
		return rotated;
	}

	public dropPiece(): boolean {
		if (
			!this.state.currentPiece ||
			this.state.gameOver ||
			this.state.isPaused
		) {
			return false;
		}

		if (this.canPlacePiece(this.state.currentPiece, 0, 1)) {
			this.state.currentPiece.y++;
			if (this.updateCallback) {
				this.updateCallback();
			}
			return true;
		} else {
			// Place piece and create new one
			this.placePiece();
			return false;
		}
	}

	private placePiece(): void {
		if (!this.state.currentPiece) return;

		// Place the piece on the board
		for (let y = 0; y < this.state.currentPiece.shape.length; y++) {
			for (let x = 0; x < this.state.currentPiece.shape[y].length; x++) {
				if (this.state.currentPiece.shape[y][x]) {
					const boardX = this.state.currentPiece.x + x;
					const boardY = this.state.currentPiece.y + y;
					if (boardY >= 0) {
						this.state.board[boardY][boardX] = this.state.currentPiece.color;
					}
				}
			}
		}

		// Clear completed lines
		const linesCleared = this.clearLines();

		// Update score and level
		this.state.score += 10 + linesCleared * 100 * this.state.level;
		this.state.lines += linesCleared;
		this.state.level = Math.floor(this.state.lines / 10) + 1;

		// Move next piece to current and create new next piece
		this.state.currentPiece = this.state.nextPiece || this.createRandomPiece();
		this.state.nextPiece = this.createRandomPiece();

		// Re-enable hold for next piece
		this.state.canHold = true;

		// Check if game over
		if (!this.canPlacePiece(this.state.currentPiece)) {
			this.state.gameOver = true;
			// Save score when game ends
			TetrisScoreManager.saveScore(
				this.state.score,
				this.state.lines,
				this.state.level
			);
			if (this.gameOverCallback) {
				this.gameOverCallback();
			}
		}

		if (this.updateCallback) {
			this.updateCallback();
		}
	}

	private clearLines(): number {
		// Find completed lines
		const completedLines: number[] = [];
		for (let y = 0; y < TETRIS_BOARD_HEIGHT; y++) {
			if (this.state.board[y].every((cell) => cell !== 0)) {
				completedLines.push(y);
			}
		}

		// Remove completed lines
		for (const lineIndex of completedLines.reverse()) {
			this.state.board.splice(lineIndex, 1);
			this.state.board.unshift(Array(TETRIS_BOARD_WIDTH).fill(0));
		}

		return completedLines.length;
	}

	public getBoardWithCurrentPiece(): number[][] {
		const board = this.state.board.map((row) => [...row]);

		if (this.state.currentPiece) {
			for (let y = 0; y < this.state.currentPiece.shape.length; y++) {
				for (let x = 0; x < this.state.currentPiece.shape[y].length; x++) {
					if (this.state.currentPiece.shape[y][x]) {
						const boardX = this.state.currentPiece.x + x;
						const boardY = this.state.currentPiece.y + y;
						if (
							boardY >= 0 &&
							boardY < TETRIS_BOARD_HEIGHT &&
							boardX >= 0 &&
							boardX < TETRIS_BOARD_WIDTH
						) {
							board[boardY][boardX] = this.state.currentPiece.color;
						}
					}
				}
			}
		}

		return board;
	}

	public getCurrentDropInterval(): number {
		// Speed increases with level
		return Math.max(50, TETRIS_MOVE_INTERVAL - (this.state.level - 1) * 50);
	}

	public getNextPiece(): TetrisPiece | null {
		return this.state.nextPiece;
	}

	public getHoldPiece(): TetrisPiece | null {
		return this.state.holdPiece;
	}

	public holdPiece(): boolean {
		if (
			!this.state.currentPiece ||
			this.state.gameOver ||
			this.state.isPaused ||
			!this.state.canHold
		) {
			return false;
		}

		// Reset piece position for hold
		const pieceToHold = {
			...this.state.currentPiece,
			x:
				Math.floor(TETRIS_BOARD_WIDTH / 2) -
				Math.floor(this.state.currentPiece.shape[0].length / 2),
			y: 0,
		};

		if (this.state.holdPiece) {
			// Swap current and hold pieces
			const tempPiece = this.state.holdPiece;
			this.state.holdPiece = pieceToHold;
			this.state.currentPiece = {
				...tempPiece,
				x:
					Math.floor(TETRIS_BOARD_WIDTH / 2) -
					Math.floor(tempPiece.shape[0].length / 2),
				y: 0,
			};
		} else {
			// Hold current piece and get next piece
			this.state.holdPiece = pieceToHold;
			this.state.currentPiece =
				this.state.nextPiece || this.createRandomPiece();
			this.state.nextPiece = this.createRandomPiece();
		}

		// Disable hold until next piece is placed
		this.state.canHold = false;

		// Check if the new current piece can be placed
		if (!this.canPlacePiece(this.state.currentPiece)) {
			this.state.gameOver = true;
			TetrisScoreManager.saveScore(
				this.state.score,
				this.state.lines,
				this.state.level
			);
			if (this.gameOverCallback) {
				this.gameOverCallback();
			}
		}

		if (this.updateCallback) {
			this.updateCallback();
		}

		return true;
	}
}
