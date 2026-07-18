import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

interface AdminUrls {
	loginPath: string;
	dashboardPath: string;
	generatedAt: string;
}

const ADMIN_URLS_FILE = join(process.cwd(), "data", "admin-urls.json");

// Generate random path segments
function generateRandomPath(): string {
	const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
	const segments = [];

	// Generate 2-3 random segments
	const segmentCount = Math.floor(Math.random() * 2) + 2;

	for (let i = 0; i < segmentCount; i++) {
		let segment = "";
		const segmentLength = Math.floor(Math.random() * 4) + 6; // 6-9 characters

		for (let j = 0; j < segmentLength; j++) {
			segment += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		segments.push(segment);
	}

	return segments.join("-");
}

// Generate new admin URLs
function generateAdminUrls(): AdminUrls {
	return {
		loginPath: `/admin-${generateRandomPath()}`,
		dashboardPath: `/dashboard-${generateRandomPath()}`,
		generatedAt: new Date().toISOString(),
	};
}

// Save URLs to file
function saveAdminUrls(urls: AdminUrls): void {
	writeFileSync(ADMIN_URLS_FILE, JSON.stringify(urls, null, 2));
}

// Load URLs from file
function loadAdminUrls(): AdminUrls | null {
	try {
		if (existsSync(ADMIN_URLS_FILE)) {
			const data = readFileSync(ADMIN_URLS_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Error loading admin URLs:", error);
	}
	return null;
}

// Initialize admin URLs (called on server startup)
export function initializeAdminUrls(): AdminUrls {
	// Check if URLs already exist
	const existingUrls = loadAdminUrls();

	if (existingUrls) {
		console.log("🔐 Admin URLs loaded:");
		console.log(`   Login: ${existingUrls.loginPath}`);
		console.log(`   Dashboard: ${existingUrls.dashboardPath}`);
		console.log(`   Generated at: ${existingUrls.generatedAt}`);
		console.log("");
		console.log("👤 Default Admin Credentials:");
		console.log(`   Username: admin`);
		console.log(`   Email: admin@portfolio.com`);
		console.log(`   Password: admin123`);
		console.log("");
		return existingUrls;
	}

	// Generate new URLs only if they don't exist
	const urls = generateAdminUrls();
	saveAdminUrls(urls);

	console.log("🔐 Admin URLs generated (NEW):");
	console.log(`   Login: ${urls.loginPath}`);
	console.log(`   Dashboard: ${urls.dashboardPath}`);
	console.log(`   Generated at: ${urls.generatedAt}`);
	console.log("");
	console.log("👤 Default Admin Credentials:");
	console.log(`   Username: admin`);
	console.log(`   Email: admin@portfolio.com`);
	console.log(`   Password: admin123`);
	console.log("");

	return urls;
}

// Get current admin URLs
export function getAdminUrls(): AdminUrls {
	const urls = loadAdminUrls();
	if (!urls) {
		return initializeAdminUrls();
	}
	return urls;
}

// Force regenerate admin URLs (for security rotation)
export function regenerateAdminUrls(): AdminUrls {
	const urls = generateAdminUrls();
	saveAdminUrls(urls);

	console.log("🔐 Admin URLs regenerated:");
	console.log(`   Login: ${urls.loginPath}`);
	console.log(`   Dashboard: ${urls.dashboardPath}`);
	console.log(`   Generated at: ${urls.generatedAt}`);
	console.log("");

	return urls;
}
