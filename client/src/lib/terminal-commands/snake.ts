import { TerminalState } from "@/components/CyberpunkTerminal/types";

// Snake game state
interface SnakeState {
	snake: Point[];
	food: Point;
	direction: Direction;
	nextDirection: Direction;
	score: number;
	gameOver: boolean;
	isPlaying: boolean;
	board: number[][];
}

interface Point {
	x: number;
	y: number;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 15;

let gameState: SnakeState | null = null;
let gameInterval: NodeJS.Timeout | null = null;

/**
 * Initialize a new Snake game
 */
function initSnake(): SnakeState {
	const initialSnake = [
		{ x: Math.floor(BOARD_WIDTH / 2), y: Math.floor(BOARD_HEIGHT / 2) },
	];

	return {
		snake: initialSnake,
		food: generateFood(initialSnake),
		direction: "RIGHT",
		nextDirection: "RIGHT",
		score: 0,
		gameOver: false,
		isPlaying: false,
		board: Array(BOARD_HEIGHT)
			.fill(null)
			.map(() => Array(BOARD_WIDTH).fill(0)),
	};
}

/**
 * Generate random food position
 */
function generateFood(snake: Point[]): Point {
	let food: Point;
	do {
		food = {
			x: Math.floor(Math.random() * BOARD_WIDTH),
			y: Math.floor(Math.random() * BOARD_HEIGHT),
		};
	} while (
		snake.some((segment) => segment.x === food.x && segment.y === food.y)
	);

	return food;
}

/**
 * Move snake in the current direction
 */
function moveSnake(state: SnakeState): void {
	const head = { ...state.snake[0] };

	// Update direction
	state.direction = state.nextDirection;

	// Move head based on direction
	switch (state.direction) {
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
		head.x >= BOARD_WIDTH ||
		head.y < 0 ||
		head.y >= BOARD_HEIGHT
	) {
		state.gameOver = true;
		state.isPlaying = false;
		return;
	}

	// Check self collision
	if (
		state.snake.some((segment) => segment.x === head.x && segment.y === head.y)
	) {
		state.gameOver = true;
		state.isPlaying = false;
		return;
	}

	// Add new head
	state.snake.unshift(head);

	// Check food collision
	if (head.x === state.food.x && head.y === state.food.y) {
		state.score += 10;
		state.food = generateFood(state.snake);
	} else {
		// Remove tail if no food eaten
		state.snake.pop();
	}
}

/**
 * Render the Snake game
 */
function renderSnake(state: SnakeState): string {
	// Create render board
	const renderBoard = Array(BOARD_HEIGHT)
		.fill(null)
		.map(() => Array(BOARD_WIDTH).fill(0));

	// Place food
	renderBoard[state.food.y][state.food.x] = 2;

	// Place snake
	state.snake.forEach((segment, index) => {
		if (index === 0) {
			renderBoard[segment.y][segment.x] = 1; // Head
		} else {
			renderBoard[segment.y][segment.x] = 3; // Body
		}
	});

	// Convert board to string with cyberpunk styling
	const chars = ["⬛", "🔴", "🟢", "🟦"]; // Empty, Head, Food, Body

	let output = `
╔═══════════════════════════════════════════════════════════════╗
║                     🐍 CYBER SNAKE v2.077 🐍                 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║`;

	// Game board
	output += `
║  ┌────────────────────────────────────────────┬─────────────┐ ║`;

	for (let y = 0; y < BOARD_HEIGHT; y++) {
		output += `
║  │`;
		for (let x = 0; x < BOARD_WIDTH; x++) {
			output += chars[renderBoard[y][x]];
		}
		output += `│`;

		// Side panel info
		if (y === 1) {
			output += ` SCORE: ${state.score.toString().padStart(4, "0")} │ ║`;
		} else if (y === 2) {
			output += ` LENGTH: ${state.snake.length
				.toString()
				.padStart(3, "0")} │ ║`;
		} else if (y === 4) {
			output += ` CONTROLS:   │ ║`;
		} else if (y === 5) {
			output += ` W - UP      │ ║`;
		} else if (y === 6) {
			output += ` S - DOWN    │ ║`;
		} else if (y === 7) {
			output += ` A - LEFT    │ ║`;
		} else if (y === 8) {
			output += ` D - RIGHT   │ ║`;
		} else if (y === 9) {
			output += ` Q - QUIT    │ ║`;
		} else if (y === 11) {
			output += ` 🔴 = HEAD   │ ║`;
		} else if (y === 12) {
			output += ` 🟦 = BODY   │ ║`;
		} else if (y === 13) {
			output += ` 🟢 = FOOD   │ ║`;
		} else {
			output += `             │ ║`;
		}
	}

	output += `
║  └────────────────────────────────────────────┴─────────────┘ ║
║                                                               ║`;

	if (state.gameOver) {
		output += `
║                 🚨 GAME OVER - NEURAL CRASH 🚨                ║
║                   Final Score: ${state.score}                         ║
║                   Type 'snake' to jack back in               ║`;
	} else if (!state.isPlaying) {
		output += `
║                  Press SPACE to start the game               ║`;
	}

	output += `
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`;

	return output;
}

/**
 * Game loop for Snake
 */
function gameLoop(): void {
	if (!gameState || gameState.gameOver || !gameState.isPlaying) {
		return;
	}

	moveSnake(gameState);

	if (gameState.gameOver && gameInterval) {
		clearInterval(gameInterval);
		gameInterval = null;
	}
}

/**
 * Handle Snake game input
 */
function handleSnakeInput(input: string): string {
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
		return "Disconnected from CYBER SNAKE matrix...";
	}

	if (key === " " || key === "space") {
		if (!gameState.isPlaying && !gameState.gameOver) {
			gameState.isPlaying = true;
			gameInterval = setInterval(gameLoop, 200); // 200ms for moderate speed
			return renderSnake(gameState);
		}
	}

	if (gameState.isPlaying && !gameState.gameOver) {
		switch (key) {
			case "w":
			case "up":
				if (gameState.direction !== "DOWN") {
					gameState.nextDirection = "UP";
				}
				break;
			case "s":
			case "down":
				if (gameState.direction !== "UP") {
					gameState.nextDirection = "DOWN";
				}
				break;
			case "a":
			case "left":
				if (gameState.direction !== "RIGHT") {
					gameState.nextDirection = "LEFT";
				}
				break;
			case "d":
			case "right":
				if (gameState.direction !== "LEFT") {
					gameState.nextDirection = "RIGHT";
				}
				break;
		}
	}

	return renderSnake(gameState);
}

/**
 * Handle snake command - now just triggers modal opening
 */
export const handleSnakeCommand = (
	args: string[],
	terminalState: TerminalState
): string => {
	// Signal to open the snake game modal
	return "OPEN_SNAKE_MODAL";
};
