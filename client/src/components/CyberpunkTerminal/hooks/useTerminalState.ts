import { useReducer, useCallback } from "react";
import type { TerminalState, FileSystemNode } from "../types";

interface TerminalStateAction {
	type: "SET_CURRENT_PATH" | "SET_FILE_SYSTEM" | "RESET";
	payload?: Partial<TerminalState>;
}

const initialState: TerminalState = {
	currentPath: [],
	fileSystem: {},
};

function terminalStateReducer(
	state: TerminalState,
	action: TerminalStateAction
): TerminalState {
	switch (action.type) {
		case "SET_CURRENT_PATH":
			return {
				...state,
				currentPath: action.payload?.currentPath || state.currentPath,
			};
		case "SET_FILE_SYSTEM":
			return {
				...state,
				fileSystem: action.payload?.fileSystem || state.fileSystem,
			};
		case "RESET":
			return initialState;
		default:
			return state;
	}
}

export function useTerminalState() {
	const [state, dispatch] = useReducer(terminalStateReducer, initialState);

	const setCurrentPath = useCallback((path: string[]) => {
		dispatch({ type: "SET_CURRENT_PATH", payload: { currentPath: path } });
	}, []);

	const setFileSystem = useCallback((fileSystem: Record<string, FileSystemNode>) => {
		dispatch({ type: "SET_FILE_SYSTEM", payload: { fileSystem } });
	}, []);

	const updateState = useCallback((newState: Partial<TerminalState>) => {
		if (newState.currentPath !== undefined) {
			dispatch({ type: "SET_CURRENT_PATH", payload: { currentPath: newState.currentPath } });
		}
		if (newState.fileSystem !== undefined) {
			dispatch({ type: "SET_FILE_SYSTEM", payload: { fileSystem: newState.fileSystem } });
		}
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: "RESET" });
	}, []);

	return {
		state,
		setCurrentPath,
		setFileSystem,
		updateState,
		reset,
	};
}
