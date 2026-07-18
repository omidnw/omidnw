#!/usr/bin/env node

/**
 * Admin URL Management Script
 *
 * Usage:
 *   node scripts/admin-urls.js show      # Show current admin URLs
 *   node scripts/admin-urls.js rotate    # Generate new admin URLs
 *   node scripts/admin-urls.js reset     # Delete URLs (will regenerate on next start)
 */

const fs = require("fs");
const path = require("path");

const ADMIN_URLS_FILE = path.join(process.cwd(), "data", "admin-urls.json");

function generateRandomPath() {
	const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
	const segments = [];
	const segmentCount = Math.floor(Math.random() * 2) + 2;

	for (let i = 0; i < segmentCount; i++) {
		let segment = "";
		const segmentLength = Math.floor(Math.random() * 4) + 6;

		for (let j = 0; j < segmentLength; j++) {
			segment += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		segments.push(segment);
	}

	return segments.join("-");
}

function generateAdminUrls() {
	return {
		loginPath: `/admin-${generateRandomPath()}`,
		dashboardPath: `/dashboard-${generateRandomPath()}`,
		generatedAt: new Date().toISOString(),
	};
}

function loadAdminUrls() {
	try {
		if (fs.existsSync(ADMIN_URLS_FILE)) {
			const data = fs.readFileSync(ADMIN_URLS_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Error loading admin URLs:", error.message);
	}
	return null;
}

function saveAdminUrls(urls) {
	try {
		// Ensure data directory exists
		const dataDir = path.dirname(ADMIN_URLS_FILE);
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}

		fs.writeFileSync(ADMIN_URLS_FILE, JSON.stringify(urls, null, 2));
		return true;
	} catch (error) {
		console.error("Error saving admin URLs:", error.message);
		return false;
	}
}

function showUrls() {
	const urls = loadAdminUrls();

	if (!urls) {
		console.log("❌ No admin URLs found.");
		console.log(
			"   Run the server to generate URLs, or use: node scripts/admin-urls.js rotate"
		);
		return;
	}

	console.log("\n🔐 Current Admin URLs:\n");
	console.log(`   Login:     ${urls.loginPath}`);
	console.log(`   Dashboard: ${urls.dashboardPath}`);
	console.log(`   Generated: ${new Date(urls.generatedAt).toLocaleString()}`);
	console.log("\n📋 Full URLs (assuming localhost:5010):\n");
	console.log(`   Login:     http://localhost:5010${urls.loginPath}`);
	console.log(`   Dashboard: http://localhost:5010${urls.dashboardPath}`);
	console.log("");
}

function rotateUrls() {
	const oldUrls = loadAdminUrls();

	if (oldUrls) {
		console.log("\n⚠️  Current URLs:\n");
		console.log(`   Login:     ${oldUrls.loginPath}`);
		console.log(`   Dashboard: ${oldUrls.dashboardPath}`);
		console.log("");
	}

	const newUrls = generateAdminUrls();

	if (saveAdminUrls(newUrls)) {
		console.log("✅ New admin URLs generated:\n");
		console.log(`   Login:     ${newUrls.loginPath}`);
		console.log(`   Dashboard: ${newUrls.dashboardPath}`);
		console.log(
			`   Generated: ${new Date(newUrls.generatedAt).toLocaleString()}`
		);
		console.log("\n📋 Full URLs (assuming localhost:5010):\n");
		console.log(`   Login:     http://localhost:5010${newUrls.loginPath}`);
		console.log(`   Dashboard: http://localhost:5010${newUrls.dashboardPath}`);
		console.log("\n⚠️  Old URLs will no longer work!");
		console.log("   Restart the server to apply changes.");
		console.log("");
	} else {
		console.log("❌ Failed to save new URLs.");
	}
}

function resetUrls() {
	if (!fs.existsSync(ADMIN_URLS_FILE)) {
		console.log("ℹ️  No admin URLs file found. Nothing to reset.");
		return;
	}

	const urls = loadAdminUrls();
	if (urls) {
		console.log("\n⚠️  Deleting current URLs:\n");
		console.log(`   Login:     ${urls.loginPath}`);
		console.log(`   Dashboard: ${urls.dashboardPath}`);
		console.log("");
	}

	try {
		fs.unlinkSync(ADMIN_URLS_FILE);
		console.log("✅ Admin URLs file deleted.");
		console.log("   New URLs will be generated on next server start.");
		console.log("");
	} catch (error) {
		console.log("❌ Failed to delete URLs file:", error.message);
	}
}

function showHelp() {
	console.log("\n📖 Admin URL Management Script\n");
	console.log("Usage:");
	console.log(
		"  node scripts/admin-urls.js show      # Show current admin URLs"
	);
	console.log(
		"  node scripts/admin-urls.js rotate    # Generate new admin URLs"
	);
	console.log(
		"  node scripts/admin-urls.js reset     # Delete URLs (regenerate on next start)"
	);
	console.log(
		"  node scripts/admin-urls.js help      # Show this help message"
	);
	console.log("");
	console.log("Examples:");
	console.log("  node scripts/admin-urls.js show");
	console.log("  node scripts/admin-urls.js rotate");
	console.log("");
}

// Main
const command = process.argv[2];

switch (command) {
	case "show":
		showUrls();
		break;
	case "rotate":
		rotateUrls();
		break;
	case "reset":
		resetUrls();
		break;
	case "help":
	case "--help":
	case "-h":
		showHelp();
		break;
	default:
		console.log("❌ Unknown command:", command || "(none)");
		showHelp();
		process.exit(1);
}
