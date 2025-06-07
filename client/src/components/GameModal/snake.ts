export interface SnakePoint {
	x: number;
	y: number;
}

export type SnakeDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface SnakeGameState {
	snake: SnakePoint[];
	food: SnakePoint;
	direction: SnakeDirection;
	nextDirection: SnakeDirection;
	score: number;
	gameStarted: boolean;
	gameOver: boolean;
	isMoving: boolean;
	isPaused: boolean;
}

export const SNAKE_BOARD_WIDTH = 20;
export const SNAKE_BOARD_HEIGHT = 15;
export const SNAKE_MOVE_INTERVAL = 150; // Reduced from 200ms for smoother gameplay

export interface SnakeScore {
	score: number;
	date: string;
	length: number;
}

export class SnakeScoreManager {
	private static readonly STORAGE_KEY = "snake_high_scores";
	private static readonly MAX_SCORES = 10;

	public static saveScore(score: number, length: number): void {
		const scores = this.getScores();
		const newScore: SnakeScore = {
			score,
			length,
			date: new Date().toLocaleDateString(),
		};

		scores.push(newScore);
		scores.sort((a, b) => b.score - a.score); // Sort by score descending
		const topScores = scores.slice(0, this.MAX_SCORES);

		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
	}

	public static getScores(): SnakeScore[] {
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
			const scores = JSON.parse(jsonData) as SnakeScore[];
			if (Array.isArray(scores)) {
				// Validate the structure
				const validScores = scores.filter(
					(score) =>
						typeof score.score === "number" &&
						typeof score.date === "string" &&
						typeof score.length === "number"
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

export class SnakeGame {
	private state: SnakeGameState;
	private moveCallback?: () => void;
	private gameOverCallback?: () => void;

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): SnakeGameState {
		const initialSnake = [
			{
				x: Math.floor(SNAKE_BOARD_WIDTH / 2),
				y: Math.floor(SNAKE_BOARD_HEIGHT / 2),
			},
		];
		return {
			snake: initialSnake,
			food: this.generateFood(initialSnake),
			direction: "RIGHT",
			nextDirection: "RIGHT",
			score: 0,
			gameStarted: false,
			gameOver: false,
			isMoving: false,
			isPaused: false,
		};
	}

	public getState(): SnakeGameState {
		return { ...this.state };
	}

	public setMoveCallback(callback: () => void): void {
		this.moveCallback = callback;
	}

	public setGameOverCallback(callback: () => void): void {
		this.gameOverCallback = callback;
	}

	public startGame(): void {
		this.state.gameStarted = true;
		this.state.isMoving = true;
	}

	public resetGame(): void {
		this.state = this.createInitialState();
		if (this.moveCallback) {
			this.moveCallback();
		}
	}

	public togglePause(): boolean {
		if (!this.state.gameStarted || this.state.gameOver) {
			return false;
		}

		this.state.isPaused = !this.state.isPaused;
		if (this.moveCallback) {
			this.moveCallback();
		}
		return this.state.isPaused;
	}

	public changeDirection(newDirection: SnakeDirection): boolean {
		if (!this.state.gameStarted || this.state.gameOver) {
			return false;
		}

		// Prevent reversing direction
		const opposites: Record<SnakeDirection, SnakeDirection> = {
			UP: "DOWN",
			DOWN: "UP",
			LEFT: "RIGHT",
			RIGHT: "LEFT",
		};

		if (opposites[this.state.direction] === newDirection) {
			return false;
		}

		this.state.nextDirection = newDirection;
		return true;
	}

	public moveSnake(): boolean {
		if (
			!this.state.gameStarted ||
			this.state.gameOver ||
			!this.state.isMoving ||
			this.state.isPaused
		) {
			return false;
		}

		// Update direction
		this.state.direction = this.state.nextDirection;

		// Calculate new head position
		const head = { ...this.state.snake[0] };
		switch (this.state.direction) {
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
			head.x >= SNAKE_BOARD_WIDTH ||
			head.y < 0 ||
			head.y >= SNAKE_BOARD_HEIGHT
		) {
			this.state.gameOver = true;
			this.state.isMoving = false;
			// Save score when game ends
			SnakeScoreManager.saveScore(this.state.score, this.state.snake.length);
			if (this.gameOverCallback) {
				this.gameOverCallback();
			}
			return false;
		}

		// Check self collision
		if (
			this.state.snake.some(
				(segment) => segment.x === head.x && segment.y === head.y
			)
		) {
			this.state.gameOver = true;
			this.state.isMoving = false;
			// Save score when game ends
			SnakeScoreManager.saveScore(this.state.score, this.state.snake.length);
			if (this.gameOverCallback) {
				this.gameOverCallback();
			}
			return false;
		}

		// Add new head
		this.state.snake.unshift(head);

		// Check food collision
		if (head.x === this.state.food.x && head.y === this.state.food.y) {
			this.state.score += 10;
			this.state.food = this.generateFood(this.state.snake);
		} else {
			// Remove tail if no food eaten
			this.state.snake.pop();
		}

		if (this.moveCallback) {
			this.moveCallback();
		}

		return true;
	}

	private generateFood(snake: SnakePoint[]): SnakePoint {
		let food: SnakePoint;
		do {
			food = {
				x: Math.floor(Math.random() * SNAKE_BOARD_WIDTH),
				y: Math.floor(Math.random() * SNAKE_BOARD_HEIGHT),
			};
		} while (
			snake.some((segment) => segment.x === food.x && segment.y === food.y)
		);

		return food;
	}

	public getCellType(x: number, y: number): "empty" | "head" | "body" | "food" {
		// Check if food
		if (this.state.food.x === x && this.state.food.y === y) {
			return "food";
		}

		// Check if snake head
		if (
			this.state.snake[0] &&
			this.state.snake[0].x === x &&
			this.state.snake[0].y === y
		) {
			return "head";
		}

		// Check if snake body
		if (
			this.state.snake
				.slice(1)
				.some((segment) => segment.x === x && segment.y === y)
		) {
			return "body";
		}

		return "empty";
	}
}
