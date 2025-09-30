// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import { decryptJson } from "./encryption.ts";
import initialiseBrowser from "./initialiseBrowser.ts";
import scrapeAndConnectProfiles from "./scrapeAndConnectProfiles.ts";
import scrapeFeeds from "./scrapeFeeds.ts";

// CLI
(async () => {
	const [url, maybeHeaded] = process.argv.slice(2);
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

	if (!url) {
		console.error('Usage: node linkedin-invite.js "<profile_url>" [--headed]');
		process.exit(1);
	}

	const { browser, ctx } = await initialiseBrowser(storage, {
		headed: maybeHeaded === "--headed",
	});
	if (!browser || !ctx) {
		console.error("❌ Failed to initialize browser.");
		process.exit(1);
	}

	const page1 = await ctx.newPage();
	const page2 = await ctx.newPage();
	await Promise.all([
		scrapeAndConnectProfiles(page1, secret, url),
		scrapeFeeds(page2),
	]);
	await ctx.close();
	await browser.close();
})();
