export { default as GameModal } from "./GameModal";
export type { GameType } from "./GameModal";

// Game Components
export { default as SnakeGameComponent } from "./SnakeGame";
export { default as TetrisGameComponent } from "./TetrisGame";

// Snake exports
export { SnakeGame, SnakeScoreManager } from "./snake";
export type {
	SnakePoint,
	SnakeDirection,
	SnakeGameState,
	SnakeScore,
} from "./snake";

// Tetris exports
export { TetrisGame, TetrisScoreManager } from "./tetris";
export type { TetrisPiece, TetrisGameState, TetrisScore } from "./tetris";
