// findProfileLinks.ts
import type { Page } from "playwright";
import { Op } from "sequelize";
import { throttle } from "./common.ts";
import { generateDebugInfoPng } from "./debugErrors.ts";
import ProfileLinks from "./models/ProfileLinks.js";
import type ScraperModel from "./models/ScraperModel.js";
import sendInvite from "./sendInvite.ts";

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
		let growLinkSuggestedConnections = await growLinkLocator.all();

		const footerText = `LinkedIn Corporation ©${new Date().getFullYear()}`;
		const footerRegex = new RegExp(footerText, "i");
		const footerLocator = page
			.getByRole("contentinfo", { name: footerRegex })
			.first();

		await footerLocator.scrollIntoViewIfNeeded().catch(() => {});
		await page.waitForLoadState("domcontentloaded").catch(() => {});

		// keep scrolling down until we find some posts
		// sometimes linkedin takes a while to load the posts
		// especially on new accounts with no connections
		// so we will scroll down until we find some posts or reach the footer
		// if we reach the footer and still no posts, we will stop
		// and log an error
		// this is to prevent infinite scrolling
		// which can lead to memory issues
		// and also linkedin can block us for too many requests
		// so we will limit the number of scrolls to 20
		let scrolls = 0;
		const maxScrolls = 20;
		while (growLinkSuggestedConnections.length === 0 && scrolls < maxScrolls) {
			const err = "‼️ No post data found!";
			console.log(err);
			console.log("Scrolling down more and more");
			await page.mouse.wheel(0, -1000);
			await page.waitForTimeout(2000); // wait for 2 seconds to load more posts
			growLinkSuggestedConnections = await growLinkLocator.all();
			scrolls++;
		}

		const suggestedUrls = await Promise.all(
			growLinkSuggestedConnections.map(async (locator) => {
				const href = await locator.getAttribute("href");
				// Convert the relative URL (e.g., /in/john-doe?...) to an absolute one
				return new URL(href ?? "", "https://www.linkedin.com").toString();
			}),
		);
		console.log(`✅ Found ${suggestedUrls.length} suggested profile links.`);

		// Combine both arrays of URLs
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

				await throttle(2, 10);
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
