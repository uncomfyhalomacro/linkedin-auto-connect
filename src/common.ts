import type { Locator, Page } from "playwright";

// This hopefully ensures uniqueness of URLs
async function getHashFormOfLink(page: Page, url: string) {
	// 1. Load page first
	await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
	// 2. Locate the link
	const profileLinkLocator = page
		.locator('a[href*="/in/"][href*="miniProfileUrn="]')
		.first();

	// 2. Get the full href attribute as a string
	const href = await profileLinkLocator.getAttribute("href");

	if (!href) {
		console.error("Could not find the JSON data block on the page.");
		return url;
	}

	// 3. Parse the href string using the URL object
  const urlWith = new URL(href);
  
  // -- Extract the different pieces of information --

  // a) Get the clean profile URL (everything before the '?')
  const cleanProfileUrl = urlWith.origin + urlWith.pathname;
  
  // b) Get the URN from the 'miniProfileUrn' query parameter
  const miniProfileUrn = urlWith.searchParams.get('miniProfileUrn');
  
  // c) Get the Unique Member ID by splitting the URN
  const memberId = miniProfileUrn ? miniProfileUrn.split(':').pop() : null;

  console.log(`✅ Parsing successful!`);
  console.log(`   Clean Profile URL: ${cleanProfileUrl}`);
  console.log(`   Unique Member ID: ${memberId}`);
  return `https://www.linkedin.com/in/${memberId}`
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

export { clickFirstVisible, escRe, getHashFormOfLink };
