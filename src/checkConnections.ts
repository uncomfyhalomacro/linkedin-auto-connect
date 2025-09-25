// your-script.ts
import type { BrowserContext, Page } from "playwright";

// Main logic is wrapped in an async function
async function checkConnections(page: Page, ctx: BrowserContext) {
	try {
		// This is the action that triggers the navigation
		await page.click("a.ember-view[href*='/search/results/people/']", {timeout: 7000}).catch((err) => {
			console.error("❌ Error clicking the link:", err);
			console.log("Trying to navigate another way...");
		}).then(async () => {
			await page.click("a.yzkQtgmTvfGClJdzuHAtulmhmBSuRQRpw[href*='/search/results/people/']").catch((err) => {
				console.error("❌ Error clicking the first fallback link:", err);
			});
		}).finally(async () => {
			// Fallback navigation if the click fails
			await page.goto("https://www.linkedin.com/search/results/people/", { waitUntil: "load" }).catch((err) => {
				console.error("❌ Error with fallback navigation:", err);
				throw err; // Re-throw to be caught by outer catch
			});
			console.log("Navigation action attempted.");
		});

		// Define the regex to wait for
		const searchUrlRegex =
			/^https:\/\/www\.linkedin\.com\/search\/results\/people\/\?.*$/;

		console.log("Waiting for search results page...");
		await page.waitForURL(searchUrlRegex, {
			timeout: 15000,
			waitUntil: "domcontentloaded",
		});
		console.log("✅ Successfully landed on the search results page!");

		// In a standalone script, instead of an assertion, you might wait for an element
		// to confirm the page is loaded before scraping or continuing.
		await page.waitForSelector("svg.navigational-filter-dropdown__caret-icon", {
			state: "visible",
		});
		console.log("Confirmed page content is visible.");
		// --- Your automation logic ends here ---
	} catch (error) {
		console.error("❌ An error occurred:", error);
	}
}

export default checkConnections;
