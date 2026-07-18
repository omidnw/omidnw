import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { AdminUser } from "@shared/schema";

// Environment variables with defaults
const JWT_SECRET =
	process.env.JWT_SECRET ||
	"your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// JWT Token interfaces
export interface JWTPayload {
	userId: number;
	username: string;
	email: string;
	iat: number;
	exp: number;
}

export interface AuthenticatedRequest extends Request {
	user?: AdminUser;
	userId?: number;
}

// Password utilities
export class PasswordUtils {
	/**
	 * Hash a password using bcrypt with salt rounds 12
	 */
	static async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 12);
	}

	/**
	 * Verify a password against a hash
	 */
	static async verifyPassword(
		password: string,
		hash: string
	): Promise<boolean> {
		return await bcrypt.compare(password, hash);
	}

	/**
	 * Validate password strength
	 */
	static validatePasswordStrength(password: string): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (password.length < 8) {
			errors.push("Password must be at least 8 characters long");
		}

		if (!/[A-Z]/.test(password)) {
			errors.push("Password must contain at least one uppercase letter");
		}

		if (!/[a-z]/.test(password)) {
			errors.push("Password must contain at least one lowercase letter");
		}

		if (!/[0-9]/.test(password)) {
			errors.push("Password must contain at least one number");
		}

		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			errors.push("Password must contain at least one special character");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}

// JWT utilities
export class JWTUtils {
	/**
	 * Generate an access token
	 */
	static generateAccessToken(user: AdminUser): string {
		const payload: Omit<JWTPayload, "iat" | "exp"> = {
			userId: user.id,
			username: user.username,
			email: user.email,
		};

		return jwt.sign(payload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
			issuer: "portfolio-admin",
			audience: "portfolio-admin-client",
		} as jwt.SignOptions);
	}

	/**
	 * Generate a refresh token
	 */
	static generateRefreshToken(): string {
		return jwt.sign({ type: "refresh" }, JWT_SECRET, {
			expiresIn: JWT_REFRESH_EXPIRES_IN,
			issuer: "portfolio-admin",
			audience: "portfolio-admin-client",
		} as jwt.SignOptions);
	}

	/**
	 * Verify and decode a JWT token
	 */
	static verifyToken(token: string): JWTPayload | null {
		try {
			const decoded = jwt.verify(token, JWT_SECRET, {
				issuer: "portfolio-admin",
				audience: "portfolio-admin-client",
			}) as JWTPayload;

			return decoded;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Extract token from Authorization header
	 */
	static extractTokenFromHeader(
		authorization: string | undefined
	): string | null {
		if (!authorization) return null;

		const parts = authorization.split(" ");
		if (parts.length !== 2 || parts[0] !== "Bearer") return null;

		return parts[1];
	}
}

// Rate limiting utilities
export class RateLimitUtils {
	/**
	 * Check if request is rate limited
	 */
	static async isRateLimited(
		identifier: string,
		endpoint: string,
		maxAttempts: number = 10,
		windowMs: number = 60000 // 1 minute
	): Promise<{ isLimited: boolean; resetTime: Date }> {
		const rateLimit = await storage.getRateLimit(identifier, endpoint);
		const now = new Date();

		if (!rateLimit) {
			// First request
			const resetTime = new Date(now.getTime() + windowMs);
			await storage.updateRateLimit(identifier, endpoint, 1, resetTime);
			return { isLimited: false, resetTime };
		}

		if (now > rateLimit.resetTime) {
			// Window expired, reset
			const resetTime = new Date(now.getTime() + windowMs);
			await storage.updateRateLimit(identifier, endpoint, 1, resetTime);
			return { isLimited: false, resetTime };
		}

		if (rateLimit.attempts >= maxAttempts) {
			// Rate limited
			return { isLimited: true, resetTime: rateLimit.resetTime };
		}

		// Increment attempts
		await storage.updateRateLimit(
			identifier,
			endpoint,
			rateLimit.attempts + 1,
			rateLimit.resetTime
		);
		return { isLimited: false, resetTime: rateLimit.resetTime };
	}

	/**
	 * Get client identifier (IP address)
	 */
	static getClientIdentifier(req: Request): string {
		return req.ip || req.connection.remoteAddress || "unknown";
	}
}

// Authentication middleware
export class AuthMiddleware {
	/**
	 * Verify JWT token and attach user to request
	 */
	static async authenticate(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

			if (!token) {
				return res.status(401).json({ error: "Access token required" });
			}

			const decoded = JWTUtils.verifyToken(token);
			if (!decoded) {
				return res.status(401).json({ error: "Invalid or expired token" });
			}

			// Get user from database
			const user = await storage.getAdminUserById(decoded.userId);
			if (!user || !user.isActive || !user.id) {
				return res.status(401).json({ error: "User not found or inactive" });
			}

			// Attach user to request
			req.user = user;
			req.userId = user.id;

			next();
		} catch (error) {
			console.error("Authentication error:", error);
			res.status(500).json({ error: "Authentication failed" });
		}
	}

	/**
	 * Rate limiting middleware
	 */
	static rateLimiter(
		endpoint: string,
		maxAttempts: number = 10,
		windowMs: number = 60000
	) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const identifier = RateLimitUtils.getClientIdentifier(req);
				const { isLimited, resetTime } = await RateLimitUtils.isRateLimited(
					identifier,
					endpoint,
					maxAttempts,
					windowMs
				);

				if (isLimited) {
					return res.status(429).json({
						error: "Too many requests",
						resetTime: resetTime.toISOString(),
					});
				}

				next();
			} catch (error) {
				console.error("Rate limiting error:", error);
				next(); // Continue if rate limiting fails
			}
		};
	}

	/**
	 * Security headers middleware
	 */
	static securityHeaders(req: Request, res: Response, next: NextFunction) {
		// Security headers
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader("X-XSS-Protection", "1; mode=block");
		res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
		res.setHeader(
			"Permissions-Policy",
			"geolocation=(), microphone=(), camera=()"
		);

		// HSTS in production
		if (process.env.NODE_ENV === "production") {
			res.setHeader(
				"Strict-Transport-Security",
				"max-age=31536000; includeSubDomains"
			);
		}

		// CSP for admin pages
		if (req.path.startsWith("/admin")) {
			res.setHeader(
				"Content-Security-Policy",
				"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
			);
		}

		next();
	}

	/**
	 * CORS middleware for admin API
	 */
	static corsAdmin(req: Request, res: Response, next: NextFunction) {
		const allowedOrigins = process.env.ADMIN_CORS_ORIGINS?.split(",") || [
			"http://localhost:3000",
		];
		const origin = req.headers.origin;

		if (origin && allowedOrigins.includes(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin);
		}

		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS"
		);
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization"
		);
		res.setHeader("Access-Control-Allow-Credentials", "true");

		if (req.method === "OPTIONS") {
			res.status(200).end();
			return;
		}

		next();
	}

	/**
	 * Request logging middleware
	 */
	static requestLogger(req: Request, res: Response, next: NextFunction) {
		const start = Date.now();
		const ip = RateLimitUtils.getClientIdentifier(req);

		res.on("finish", () => {
			const duration = Date.now() - start;
			console.log(
				`[${new Date().toISOString()}] ${req.method} ${req.path} - ${
					res.statusCode
				} - ${duration}ms - IP: ${ip}`
			);
		});

		next();
	}
}

// Session management
export class SessionManager {
	/**
	 * Create a new session
	 */
	static async createSession(
		userId: number
	): Promise<{ accessToken: string; refreshToken: string }> {
		const user = await storage.getAdminUserById(userId);
		if (!user || !user.id) {
			throw new Error("User not found");
		}

		const accessToken = JWTUtils.generateAccessToken(user);
		const refreshToken = JWTUtils.generateRefreshToken();

		// Store refresh token
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
		await storage.createAdminSession(user.id, refreshToken, expiresAt);

		// Update last login
		await storage.updateAdminUserLastLogin(user.id);

		return { accessToken, refreshToken };
	}

	/**
	 * Refresh access token
	 */
	static async refreshAccessToken(
		refreshToken: string
	): Promise<{ accessToken: string; refreshToken: string } | null> {
		try {
			// Verify refresh token
			const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

			// Get session from database
			const session = await storage.getAdminSession(refreshToken);
			if (!session || session.isRevoked || session.expiresAt < new Date()) {
				return null;
			}

			// Get user
			const user = await storage.getAdminUserById(session.userId || 0);
			if (!user || !user.isActive || !user.id) {
				return null;
			}

			// Generate new tokens
			const newAccessToken = JWTUtils.generateAccessToken(user);
			const newRefreshToken = JWTUtils.generateRefreshToken();

			// Revoke old session and create new one
			await storage.revokeAdminSession(refreshToken);
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
			await storage.createAdminSession(user.id, newRefreshToken, expiresAt);

			return { accessToken: newAccessToken, refreshToken: newRefreshToken };
		} catch (error) {
			return null;
		}
	}

	/**
	 * Revoke session
	 */
	static async revokeSession(refreshToken: string): Promise<void> {
		await storage.revokeAdminSession(refreshToken);
	}

	/**
	 * Revoke all sessions for a user
	 */
	static async revokeAllSessions(userId: number): Promise<void> {
		await storage.revokeAllAdminSessions(userId);
	}
}

// Login utilities
export class LoginUtils {
	/**
	 * Authenticate user login
	 */
	static async authenticateLogin(
		usernameOrEmail: string,
		password: string
	): Promise<AdminUser | null> {
		try {
			// Get user by username or email
			let user = await storage.getAdminUserByUsername(usernameOrEmail);
			if (!user) {
				user = await storage.getAdminUserByEmail(usernameOrEmail);
			}

			if (!user || !user.isActive) {
				return null;
			}

			// Verify password
			const isValid = await PasswordUtils.verifyPassword(
				password,
				user.passwordHash
			);
			if (!isValid) {
				return null;
			}

			return user;
		} catch (error) {
			console.error("Authentication error:", error);
			return null;
		}
	}

	/**
	 * Create new admin user
	 */
	static async createAdminUser(
		username: string,
		email: string,
		password: string
	): Promise<AdminUser> {
		// Validate password strength
		const passwordValidation = PasswordUtils.validatePasswordStrength(password);
		if (!passwordValidation.isValid) {
			throw new Error(passwordValidation.errors.join(", "));
		}

		// Check if user already exists
		const existingUser = await storage.getAdminUserByUsername(username);
		if (existingUser) {
			throw new Error("Username already exists");
		}

		const existingEmail = await storage.getAdminUserByEmail(email);
		if (existingEmail) {
			throw new Error("Email already exists");
		}

		// Hash password
		const passwordHash = await PasswordUtils.hashPassword(password);

		// Create user
		return await storage.createAdminUser({
			username,
			email,
			passwordHash,
		});
	}
}
