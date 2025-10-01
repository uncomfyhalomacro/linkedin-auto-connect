// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import { checkIfSessionStateHasExpired } from "./common.ts";
import { decryptJson } from "./encryption.ts";
import initialiseBrowser from "./initialiseBrowser.ts";
import scrapeFeeds from "./scrapeFeeds.ts";

// CLI ScraperFeeds
(async () => {
	const secret = process.env["STORAGE_STATE_SECRET"];
	const key = process.env["STORAGE_STATE_KEY"];

	if (!key) {
		throw new Error(
			"STORAGE_STATE_KEY is not set in the environment variables.",
		);
	}

	if (!secret) {
		throw new Error(
			"STORAGE_STATE_SECRET is not set in the environment variables.",
		);
	}

	const storage = await decryptJson(secret, key);

	const { browser, ctx } = await initialiseBrowser(storage, { headed: false });
	if (!browser || !ctx) {
		console.error("❌ Failed to initialize browser.");
		process.exit(1);
	}

	const page = await ctx.newPage();
	await page.goto("https://linkedin.com", {
		waitUntil: "domcontentloaded",
	});
	await checkIfSessionStateHasExpired(page);  // Exit in panic
	await scrapeFeeds(page);

	await ctx.close();
	await browser.close();
})();
