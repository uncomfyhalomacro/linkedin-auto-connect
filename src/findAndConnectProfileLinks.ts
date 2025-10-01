// findProfileLinks.ts
import type { Page } from "playwright";
import { Op } from "sequelize";
import { generateDebugInfoPng } from "./debugErrors.ts";
import ProfileLinks from "./models/ProfileLinks.js";
import type ScraperModel from "./models/ScraperModel.js";
import sendInvite from "./sendInvite.ts";

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findAndConnectProfileLinks(
	url: string,
	page: Page,
	currentScraperProfile: ScraperModel,
) {
	try {
		console.log("Page loaded. Searching for profile links...");

		// The selector to find all <a> tags with hrefs
		const profileLinkSelector = page.getByRole("link");

		// Find all locators matching the selector
		const linkLocators = await profileLinkSelector.all();

		if (linkLocators.length === 0) {
			console.log("❌ No matching profile links were found on the page.");
			await generateDebugInfoPng(page).catch((err) => {
				console.log("‼️ Something went wrong when saving the debug log: ", err);
			});
			return false;
		}

		console.log(
			`✅ Found ${linkLocators.length} matching links. Extracting URLs...`,
		);

		// Use Promise.all to efficiently get the 'href' attribute from each locator
		const urls = await Promise.all(
			linkLocators.map(async (locator) => {
				const href = await locator.getAttribute("href");
				// Convert the relative URL (e.g., /in/john-doe?...) to an absolute one
				return new URL(href ?? "", "https://www.linkedin.com").toString();
			}),
		);

		const growLink = "https://www.linkedin.com/mynetwork/grow/";
		console.log("✅ Accessing Grow Your Network page...");
		await page.goto(growLink, { waitUntil: "domcontentloaded", timeout: 0 });

		const growLinkLocator = page.getByRole("link");
		console.log("✅ Getting more suggested profile links...");
		const growLinkSuggestedConnections = await growLinkLocator.all();

		const suggestedUrls = await Promise.all(
			growLinkSuggestedConnections.map(async (locator) => {
				const href = await locator.getAttribute("href");
				// Convert the relative URL (e.g., /in/john-doe?...) to an absolute one
				return new URL(href ?? "", "https://www.linkedin.com").toString();
			}),
		);

		const foundUrls = [...urls, ...suggestedUrls, url];

		// Print the final list of URLs
		console.log("--- Extracted URLs ---");
		const cleanedUrls: Array<string> = [];
		foundUrls.forEach((foundUrl) => {
			// Split the `?` part of the URL to avoid duplicate invites
			const cleanedUrl = foundUrl.split("?")[0];
			cleanedUrls.push(cleanedUrl ?? foundUrl);
		});

		// Only get unique URLs with this substring "https://www.linkedin.com/in/"
		const uniqueUrls = Array.from(new Set(cleanedUrls));
		const filteredUrls = uniqueUrls.filter((url) =>
			url.startsWith("https://www.linkedin.com/in"),
		);

		// Start from the second element to skip own profile
		console.log(
			`✅ ${filteredUrls.length} unique profile URLs found. Starting to send invites...`,
		);

		let atLeastOneSuccess = false;
		let numberOfConnsSent = 0;

		// Use a for...of loop to handle async operations sequentially
		for (const [index, filteredUrl] of filteredUrls.entries()) {
			try {
				const profile = await ProfileLinks.findOne({
					where: {
						[Op.and]: [{ clean_profile_url: filteredUrl }, { pending: false }],
					},
				});

				const profileWithMemberId = await ProfileLinks.findOne({
					where: {
						[Op.and]: [{ member_id_url: filteredUrl }, { pending: false }],
					},
				});

				if (!profile || !profileWithMemberId) {
					console.log(`Skipping profile URL: ${filteredUrl}`);
					continue; // Skip sending invite to profile passed from sendInvite
				}

				console.log(`${index + 1}: Processing ${filteredUrl}`);
				const { success } = await sendInvite(filteredUrl, page);

				if (success) {
					atLeastOneSuccess = true;
					numberOfConnsSent += 1;
					await currentScraperProfile.increment("connections", { by: 1 });
				}

				// Throttle requests to mimic human behavior
				await sleep(2000 + Math.random() * 3000); // Wait 2-5 seconds
			} catch (err) {
				console.error(`❌ Error sending invite to ${filteredUrl}:`, err);
				await generateDebugInfoPng(page).catch((err) => {
					console.log(
						"‼️ Something went wrong when saving the debug log: ",
						err,
					);
				});
			}
		}

		console.log(`${numberOfConnsSent} connections sent`);
		return atLeastOneSuccess;
	} catch (error) {
		console.error("An error occurred:", error);
		return false;
	}
}

export default findAndConnectProfileLinks;
