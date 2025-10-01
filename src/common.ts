import type { Locator, Page } from "playwright";
import { generateDebugInfoPng } from "./debugErrors.ts";

async function checkIfSessionStateHasExpired(page: Page) {
	await page.waitForLoadState();
	const checkForSignIn = await page
		.getByRole("button", { name: / Sign in/i })
		.all();
	const checkForSignUp = await page
		.getByRole("button", { name: / Agree & Join/i })
		.all();
	const checkForJoinNow = await page
		.getByRole("link", { name: / Join now/i })
		.all();
	if (
		checkForSignIn.length + checkForSignUp.length + checkForJoinNow.length >
			0 ||
		page.url().includes("signup")
	) {
		await generateDebugInfoPng(page, "auth-debug-logs");
		throw new Error(
			"❌ Your current session needs a refreshed authenticated state!",
		);
	}
	await page.goto("https://www.linkedin.com/feed", {
		waitUntil: "domcontentloaded",
	});
	const main = await page.getByLabel(/Main Feed/i).all();
	if (main.length === 0) {
		await generateDebugInfoPng(page, "auth-debug-logs");
		throw new Error(
			"❌ Your current session needs a refreshed authenticated state!",
		);
	}
	console.log("ℹ️ Current sesssion is still authenticated");
	await page.goBack({ waitUntil: "load" });
	await generateDebugInfoPng(page, "auth-debug-logs");
}

// This hopefully ensures uniqueness of URLs
async function getHashFormOfLink(page: Page, url: string) {
	// 1. Load page first
	await page
		.goto(url, { waitUntil: "domcontentloaded", timeout: 5000 })
		.catch(async (err) => {
			console.error(err);
			await generateDebugInfoPng(page);
		});
	// 2. Locate the link
	const profileLinkLocator = page
		.locator('a[href*="/in/"][href*="miniProfileUrn="]')
		.first();

	// 2. Get the full href attribute as a string
	const href = await profileLinkLocator
		.getAttribute("href")
		.catch(async (err) => {
			console.error(err);
			await generateDebugInfoPng(page);
		});

	if (!href) {
		console.error("Could not find the JSON data block on the page.");
		return {
			memberIdUrl: url,
			cleanProfileUrl: url,
		};
	}

	// 3. Parse the href string using the URL object
	const urlWith = new URL(href);

	// -- Extract the different pieces of information --

	// a) Get the clean profile URL (everything before the '?')
	const cleanProfileUrl = urlWith.origin + urlWith.pathname;

	// b) Get the URN from the 'miniProfileUrn' query parameter
	const miniProfileUrn = urlWith.searchParams.get("miniProfileUrn");

	// c) Get the Unique Member ID by splitting the URN
	const memberId = miniProfileUrn ? miniProfileUrn.split(":").pop() : null;

	console.log(`✅ Parsing successful!`);
	console.log(`   Clean Profile URL: ${cleanProfileUrl}`);
	console.log(`   Unique Member ID: ${memberId}`);
	return {
		memberIdUrl: `https://www.linkedin.com/in/${memberId}`,
		cleanProfileUrl: cleanProfileUrl,
	};
}

async function clickFirstVisible(locs: Locator[]): Promise<boolean> {
	for (const l of locs) {
		try {
			if (await l.isVisible()) {
				await l.click();
				return true;
			}
		} catch {}
	}
	return false;
}

function escRe(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export {
	clickFirstVisible,
	escRe,
	getHashFormOfLink,
	checkIfSessionStateHasExpired,
};
