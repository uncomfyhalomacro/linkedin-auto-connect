// Import necessary types from Playwright
import type { BrowserContext, Page } from "playwright";

// Main logic is wrapped in an async function
async function checkConnections(page: Page, _ctx: BrowserContext) {
	try {
		// This is the action that triggers the navigation
		try {
			// --- Attempt 1: The direct click ---
			console.log("Attempting to click the connections link directly...");
			await page.click("a.ember-view[href*='/search/results/people/']", {
				timeout: 7000,
			});
			console.log("✅ Direct click successful!");
		} catch (error) {
			// --- This block ONLY runs if the direct click fails ---
			console.error("❌ Direct click failed:", error);
			console.error("Trying fallback methods...");

			try {
				// --- Attempt 2: Find link by text and navigate ---
				console.log("Fallback 1: Locating link by text...");
				const connectionsLink = page.getByRole("link", {
					name: /\/connections\//,
				});
				const connectionURL = await connectionsLink
					.first()
					.getAttribute("href");
				console.log("Connection URL: ", connectionURL);

				if (connectionURL) {
					const fullUrl = new URL(connectionURL, page.url()).toString();
					await page.goto(fullUrl, { waitUntil: "domcontentloaded" });
					console.log("✅ Fallback 1 successful!");
				} else {
					// This will cause this try block to fail and trigger the final fallback
					throw new Error("Could not find the connections link URL.");
				}
			} catch (fallbackError) {
				// --- This block ONLY runs if the second attempt also fails ---
				console.error("❌ Fallback 1 failed: ", fallbackError);
				console.error("Trying final fallback...");

				// --- Attempt 3: The final fallback navigation ---
				await page.goto("https://www.linkedin.com/search/results/people/", {
					waitUntil: "load",
				});
				console.log("✅ Final fallback navigation successful.");
			}
		}

		// This code will run after one of the attempts has succeeded.
		console.log("Navigation action is complete.");

		// Define the regex to wait for
		// const searchUrlRegex =
		// 	/^https:\/\/www\.linkedin\.com\/search\/results\/people\/\?.*$/;

		// console.log("Waiting for search results page...");
		// await page.waitForURL(searchUrlRegex, {
		// 	timeout: 15000,
		// 	waitUntil: "domcontentloaded",
		// });
		console.log("✅ Successfully landed on the search results page!");

		// In a standalone script, instead of an assertion, you might wait for an element
		// to confirm the page is loaded before scraping or continuing.
		await page.waitForSelector("svg.navigational-filter-dropdown__caret-icon", {
			state: "visible",
			timeout: 0,
		});
		console.log("Confirmed page content is visible.");
		await page.screenshot({ path: "final-page-view.png" }).catch(() => {});
		// --- Your automation logic ends here ---
	} catch (error) {
		console.error("❌ An error occurred:", error);
	}
	return page;
}

export default checkConnections;
