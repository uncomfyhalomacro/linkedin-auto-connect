// findProfileLinks.ts
import type { BrowserContext, Page } from "playwright";
import sendInvite from "./sendInvite.ts";

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findAndConnectProfileLinks(
	_ctx: BrowserContext,
	page: Page,
	storageStatePath: string,
) {
	try {
		console.log("Page loaded. Searching for profile links...");

		// The selector to find all <a> tags with hrefs that start with "/in/"
		// AND contain "miniProfileUrn="
		const profileLinkSelector =
			'a.yzkQtgmTvfGClJdzuHAtulmhmBSuRQRpw';  // Doubtful about this regex

		// Find all locators matching the selector
		const linkLocators = await page.locator(profileLinkSelector).all();

		if (linkLocators.length === 0) {
			console.log("❌ No matching profile links were found on the page.");
			return;
		}

		console.log(
			`✅ Found ${linkLocators.length} matching links. Extracting URLs...`,
		);

		// Use Promise.all to efficiently get the 'href' attribute from each locator
		const urls = await Promise.all(
			linkLocators.map(async (locator) => {
				const href = await locator.getAttribute("href");
				// Convert the relative URL (e.g., /in/john-doe?...) to an absolute one
				return new URL(href!, "https://www.linkedin.com").toString();
			}),
		);

		// Print the final list of URLs
		console.log("--- Extracted URLs ---");
		const toConnect: Array<Promise<void>> = [];
		const cleanedUrls: Array<string> = [];
		urls.forEach((url) => {
			// Split the `?` part of the URL to avoid duplicate invites
			const cleanedUrl = url.split("?")[0];
			cleanedUrls.push(cleanedUrl ?? url);
		})

		// Only get unique URLs with this substring "https://www.linkedin.com/in/"
		const uniqueUrls = Array.from(new Set(cleanedUrls));
		const filteredUrls = uniqueUrls.filter((url) =>
			url.startsWith("https://www.linkedin.com/in")
		);

		filteredUrls.forEach((filteredUrl, index) => {
			console.log(`${index + 1}: ${filteredUrl}`);
			toConnect.push(sendInvite(filteredUrl, storageStatePath, { headed: false }));
		});

		for (const connect of toConnect) {
			await connect;
			await sleep(3000); // Sleep for 3 seconds between connection requests
		}

		console.log("All connection requests have been processed.");

	} catch (error) {
		console.error("An error occurred:", error);
	}
}

export default findAndConnectProfileLinks;
