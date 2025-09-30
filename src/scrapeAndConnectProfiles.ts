import type { BrowserContext, Page } from "playwright";
import checkConnections from "./checkConnections.ts";
import findAndConnectProfileLinks from "./findAndConnectProfileLinks.ts";
import ScraperModel from "./models/ScraperModel.js";
import sendInvite from "./sendInvite.ts";

const scrapeAndConnectProfiles = async (
	page: Page,
	secret: string,
	url = "https://linkedin.com",
) => {
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
	await sendInvite(url, page);
	const searchPage = await checkConnections(page);
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
	console.log(`Adding scraper profile secret to Postgres DB...`);
	await scraperProfile.increment("nonce", { by: 1 });
};

export default scrapeAndConnectProfiles;
