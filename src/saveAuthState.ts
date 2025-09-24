// saveAuthState.ts
import * as path from "node:path";
import { chromium } from "playwright";

// Define the path for the authentication file
const authFile = path.join(path.dirname(new URL(import.meta.url).pathname), "storage_state.json");

async function saveState() {
	// Launch the browser in non-headless mode
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	console.log("Navigating to LinkedIn login page...");
	await page.goto("https://www.linkedin.com/login");

	console.log("Please log in to your LinkedIn account in the browser window.");
	console.log(
		"Waiting for you to log in and navigate away from the login page...",
	);

	// Wait until the URL is no longer the login page, indicating a successful login
	await page.waitForURL("**/feed/**", { timeout: 300000 }); // 5 minute timeout

	console.log("Login successful! Saving authentication state...");

	// Save the authentication state to the file
	await context.storageState({ path: authFile });

	console.log(`Authentication state saved to ${authFile}`);

	await browser.close();
}

export default saveState;