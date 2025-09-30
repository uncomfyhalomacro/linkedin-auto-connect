// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import path from "node:path";
import { loadEnvFile } from "node:process";
import checkConnections from "./checkConnections.ts";
import { sq } from "./db/init.js";
import { decryptJson } from "./encryption.ts";
import findAndConnectProfileLinks from "./findAndConnectProfileLinks.ts";
import initialiseBrowser from "./initialiseBrowser.ts";
import ScraperModel from "./models/ScraperModel.js";
import sendInvite from "./sendInvite.ts";

// CLI
(async () => {
	await sq
		.authenticate()
		.then(async () => {
			if (process.env["NODE_ENV"] === "troubleshooting") {
				loadEnvFile(path.join(path.dirname(process.argv0), ".env"));
				loadEnvFile(
					path.join(path.dirname(process.argv0), ".env.database.troubleshoot"),
				);
			} else if (process.env["NODE_ENV"] === "prod") {
				console.log("Database running in production mode");
			} else {
				// await sq.sync({schema}).then(() => {
				// 	console.log("Database synchronized in development mode");
				// });
			}
			console.log("Connection has been established successfully");
		})
		.catch((err) => {
			console.error("Unable to connect to the database:", err);
		});

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

	let scraperProfile = await ScraperModel.findOne({
		where: { secret: secret },
	});

	if (!scraperProfile) {
		scraperProfile = await ScraperModel.create({
			secret: secret,
		});
	} else {
		await scraperProfile.increment("nonce", { by: 1 });
	}

	const { browser, ctx, page } = await initialiseBrowser(storage, {
		headed: maybeHeaded === "--headed",
	});
	if (!browser || !ctx || !page) {
		console.error("❌ Failed to initialize browser or page.");
		process.exit(1);
	}

	await sendInvite(url, page);
	const searchPage = await checkConnections(page, ctx);
	console.log("✅ Connections checked.");
	console.log("Sending invitations to connections' profiles...");

	const successFinding = await findAndConnectProfileLinks(
		url,
		searchPage,
		scraperProfile,
	);
	if (successFinding)
		console.log("✅ Invitations sent to connections' profiles.");
	console.log("All done!");
	await ctx.close();
	await browser.close();
	console.log(`Adding scraper profile secret to Postgres DB...`);

	await scraperProfile.increment("nonce", { by: 1 });
})();
