import type { Page } from "playwright";
import { clickFirstVisible } from "./common.ts";
import { generateDebugInfoPng } from "./debugErrors.ts";
import Feeds from "./models/Feeds.js";

const genfeedDebugLogs = async (p: Page) => {
	await generateDebugInfoPng(p, "feeds-debug-logs");
};
const scrapeFeeds = async (page: Page) => {
	console.log("✅ Scraping LinkedIn feed for scraper profile.");
	const feedUrl = "https://www.linkedin.com/";
	const controlMenuRegex = /^Open control menu for post by /i;

	await page
		.goto(feedUrl, { waitUntil: "domcontentloaded", timeout: 10000 })
		.catch(async (err) => {
			console.error(err);
			await genfeedDebugLogs(page);
			// throw new Error(err);
			return;
		});

	const h1 = page.getByRole("main").getByRole("heading", { level: 1 }).first();
	await h1.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
	await page.waitForLoadState("networkidle").catch(() => {});

	const postLocators = await page
		.getByRole("article")
		// .locator('div[data-id*="urn:li:activity"]')
		.all();

	if (postLocators.length === 0) {
		const err = "‼️ No post data found!";
		console.log(err);
		// throw new Error(err);
		return;
	}

	console.log("✅ Found articles: ", postLocators.length);

	for (const postLocator of postLocators) {
		const controlMenuButton = postLocator
			.getByRole("button", { name: controlMenuRegex })
			.first();

		// const controlMenuButton = buttons.getByLabel(controlMenuRegex).first()
		if (await clickFirstVisible([controlMenuButton])) {
			console.log("Clicked the control menu button");
			const overlay = postLocator.getByLabel("Control Menu Options").first();
			await overlay.waitFor({ timeout: 5000, state: "visible" });
			const h5Button = await overlay
				.getByRole("button", { name: "Copy link to post" })
				.first();

			const isClicked = await clickFirstVisible([h5Button]);

			if (isClicked) {
				console.log(`✅ Button found successfully`);
				await genfeedDebugLogs(page);
				const alertDialogBelow = page.getByLabel(/Toast message/i).first();
				const postLink = alertDialogBelow
					.getByRole("link", { name: "View post" })
					.first();
				const postUrl = await postLink.getAttribute("href");
				if (!postUrl) {
					console.error("‼️ Failed to get post url");
					continue;
				}

				console.log(`✅ Found post url: ${postUrl}`);
				console.log("Removing tracking and URL paths");

				const urlWith = new URL(postUrl);
				const cleanPostUrl = urlWith.origin + urlWith.pathname;

				console.log(`✅ Cleaned Post URL: ${cleanPostUrl}`);

				const postFeedItem = await Feeds.findOne({
					where: { post_url: cleanPostUrl },
				});

				if (!postFeedItem) {
					await Feeds.create({
						post_url: cleanPostUrl,
						first_fetched_at: new Date(),
						last_interacted_on: new Date(),
					}).catch((err) => {
						console.error(err);
					});
					console.log(`✅ Added post to database...`);
				} else {
					console.log("✅ Found! Has been interacted again: ", cleanPostUrl);
					await postFeedItem.update({
						last_interacted_on: new Date(),
						note: "Visited again in the feed during scrape runs.",
					});
					console.log(`✅ Updated post to database...`);
				}
			} else {
				console.error("‼️ Not able to find any post links");
				await genfeedDebugLogs(page);
			}
		}
	}
};

export default scrapeFeeds;
