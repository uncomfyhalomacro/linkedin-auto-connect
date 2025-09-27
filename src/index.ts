// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import { env } from "node:process";
import checkConnections from "./checkConnections.ts";
import { decryptJson } from "./encryption.ts";
import findAndConnectProfileLinks from "./findAndConnectProfileLinks.ts";
import initialiseBrowser from "./initialiseBrowser.ts";
import sendInvite from "./sendInvite.ts";

// CLI
(async () => {
	const [url, maybeHeaded] = process.argv.slice(2);

	process.loadEnvFile(".env");
	const secret = env["STORAGE_STATE_SECRET"];
	const key = env["STORAGE_STATE_KEY"];

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

	const storage = JSON.stringify(await decryptJson(secret, key));

	if (!url) {
		console.error('Usage: node linkedin-invite.js "<profile_url>" [--headed]');
		process.exit(1);
	}

	const { browser, ctx, page } = await initialiseBrowser(storage, {
		headed: maybeHeaded === "--headed",
	});
	if (!browser || !ctx || !page) {
		console.error("❌ Failed to initialize browser or page.");
		process.exit(1);
	}

	const visitedProfiles: Array<string> = [url];
	await sendInvite(url, page);
	const searchPage = await checkConnections(page, ctx);
	console.log("✅ Connections checked.");
	console.log("Sending invitations to connections' profiles...");

	const successFinding = await findAndConnectProfileLinks(
		url,
		searchPage,
		visitedProfiles,
	);
	if (successFinding)
		console.log("✅ Invitations sent to connections' profiles.");
	console.log("All done!");
	await ctx.close();
	await browser.close();
})();
