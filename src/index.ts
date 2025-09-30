// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import checkConnections from "./checkConnections.ts";
import { decryptJson } from "./encryption.ts";
import findAndConnectProfileLinks from "./findAndConnectProfileLinks.ts";
import initialiseBrowser from "./initialiseBrowser.ts";
import ScraperModel from "./models/ScraperModel.js";
import scrapeFeeds from "./scrapeFeeds.ts";
import sendInvite from "./sendInvite.ts";

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
	const connectScraper = async () => {
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
	};

	await Promise.all([connectScraper, scrapeFeeds(ctx)]);
})();
