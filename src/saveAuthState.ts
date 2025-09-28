// saveAuthState.ts

import { writeFileSync } from "node:fs";
import * as path from "node:path";
import { dirname } from "node:path";
import { chromium } from "playwright";
import { encryptJson } from "./encryption.ts";

const saveAuthEnv = (key: string, data: string) => {
	const envFormat = `STORAGE_STATE_SECRET="${data}"
STORAGE_STATE_KEY="${key}"
`;
	const projectRootDir = dirname(process.argv0);
	const writePath = path.join(projectRootDir, ".env");
	writeFileSync(writePath, envFormat, "utf-8");
};

async function saveState() {
	// Launch the browser in non-headless mode
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext({
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
	});
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
	const storageStateObject = await context.storageState();

	const { exportedKey, combined } = await encryptJson(storageStateObject);
	const exportedKeyStringBase64 = exportedKey.toString("base64");
	const encryptedStringBase64 = combined.toString("base64");

	await browser.close();
	console.log("✅ Saving environmental variables to `.env`");
	saveAuthEnv(exportedKeyStringBase64, encryptedStringBase64);
}

export default saveState;
