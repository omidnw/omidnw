import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface User {
	id: number;
	username: string;
	email: string;
	lastLoginAt: string | null;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
}

interface AdminContextType {
	auth: AuthState;
	setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
	logout: () => void;
	githubToken: string | null;
	setGithubToken: (token: string | null) => void;
	getGithubToken: () => string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
	const context = useContext(AdminContext);
	if (!context) {
		throw new Error("useAdmin must be used within AdminProvider");
	}
	return context;
};

interface AdminProviderProps {
	children: ReactNode;
	loginUrl: string;
	onLogout?: () => void;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({
	children,
	loginUrl,
	onLogout,
}) => {
	const [auth, setAuth] = useState<AuthState>({
		isAuthenticated: false,
		user: null,
		accessToken: null,
		refreshToken: null,
	});
	const [loading, setLoading] = useState(true);
	const [githubToken, setGithubTokenState] = useState<string | null>(null);

	// GitHub token management with 1-day expiration
	const setGithubToken = (token: string | null) => {
		if (token) {
			const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day from now
			sessionStorage.setItem("github_token", token);
			sessionStorage.setItem("github_token_expires", expiresAt.toString());
			setGithubTokenState(token);
		} else {
			sessionStorage.removeItem("github_token");
			sessionStorage.removeItem("github_token_expires");
			setGithubTokenState(null);
		}
	};

	const getGithubToken = (): string | null => {
		const token = sessionStorage.getItem("github_token");
		const expiresAt = sessionStorage.getItem("github_token_expires");

		if (!token || !expiresAt) {
			return null;
		}

		// Check if token has expired
		if (Date.now() > parseInt(expiresAt)) {
			sessionStorage.removeItem("github_token");
			sessionStorage.removeItem("github_token_expires");
			setGithubTokenState(null);
			return null;
		}

		return token;
	};

	useEffect(() => {
		const checkAuth = () => {
			try {
				const token = localStorage.getItem("admin_token");
				const refreshToken = localStorage.getItem("admin_refresh_token");

				if (token && refreshToken) {
					setAuth({
						isAuthenticated: true,
						user: {
							id: 1,
							username: "admin",
							email: "admin@example.com",
							lastLoginAt: null,
						},
						accessToken: token,
						refreshToken: refreshToken,
					});
				}

				// Check GitHub token on mount
				const savedGithubToken = getGithubToken();
				if (savedGithubToken) {
					setGithubTokenState(savedGithubToken);
				}
			} catch (error) {
				console.error("Error checking auth:", error);
				localStorage.removeItem("admin_token");
				localStorage.removeItem("admin_refresh_token");
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	const apiCall = async (endpoint: string, options: RequestInit = {}) => {
		const response = await fetch(`/api/admin${endpoint}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${auth.accessToken}`,
				...options.headers,
			},
		});

		if (response.status === 401) {
			logout();
			throw new Error("Session expired. Please log in again.");
		}

		return response;
	};

	const logout = () => {
		setAuth({
			isAuthenticated: false,
			user: null,
			accessToken: null,
			refreshToken: null,
		});
		localStorage.removeItem("admin_token");
		localStorage.removeItem("admin_refresh_token");

		// Clear GitHub token on logout
		sessionStorage.removeItem("github_token");
		sessionStorage.removeItem("github_token_expires");
		setGithubTokenState(null);

		if (onLogout) {
			onLogout();
		} else {
			window.location.href = loginUrl;
		}
	};

	return (
		<AdminContext.Provider
			value={{
				auth,
				setAuth,
				loading,
				setLoading,
				apiCall,
				logout,
				githubToken,
				setGithubToken,
				getGithubToken,
			}}
		>
			{children}
		</AdminContext.Provider>
	);
};
