import type { Page } from "playwright";
import { generateDebugInfoPng } from "./debugErrors.ts";
import Feeds from "./models/Feeds.js";

const scrapeFeeds = async (page: Page) => {
	console.log("✅ Scraping LinkedIn feed for scraper profile.");
	const feedUrl = "https://www.linkedin.com/";

	await page
		.goto(feedUrl, { waitUntil: "domcontentloaded", timeout: 10000 })
		.catch(async (err) => {
			await generateDebugInfoPng(page, "feeds-debug-logs");
			throw new Error(err);
		});

	const postLocators = await page
		.locator('div[data-id="urn:li:activity:"]')
		.all();

	for (const postLocator of postLocators) {
		const content = postLocator.contentFrame();
		const connectButton = await content
			.getByRole("button")
			.first()
			.getByLabel(/Open control menu for post by/);
		if (await connectButton.isVisible().catch(() => false)) {
			await connectButton.click();
			const overlay = content.locator('button[aria-expanded="true"]').first();
			overlay
				.getByRole("heading", { name: "Copy link to post" })
				.first()
				.click();
			const getAlertFrame = page
				.locator("section")
				.getByLabel(/Toast message/)
				.first()
				.contentFrame();
			const postLink = getAlertFrame.getByRole("link").first();
			const postUrl = await postLink.getAttribute("href");
			if (!postUrl) {
				console.error("‼️ Failed to get post url");
				continue;
			}
			console.log(`✅ Found post url: ${postUrl}`);

			const postFeedItem = await Feeds.findOne({
				where: { post_url: postUrl },
			});

			if (!postFeedItem) {
				await Feeds.create({ post_url: postUrl }).catch((err) => {
					console.error(err);
				});
				console.log(`✅ Added post to database...`);
			} else {
				console.log("✅ Found! Has been interacted again: ", postUrl);
				await postFeedItem.increment("nonce", { by: 1 }).catch((err) => {
					console.error(err);
				});
				console.log(`✅ Updated post to database...`);
			}
		}
	}
};

export default scrapeFeeds;
