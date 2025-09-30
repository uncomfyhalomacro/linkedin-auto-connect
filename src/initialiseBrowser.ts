import { chromium } from "playwright";
import type { StorageState } from "./types.ts";

const initialiseBrowser = async (
	storageState: StorageState,
	opts: { headed?: boolean } = {},
) => {
	const browser = await chromium.launch({
		headless: !opts.headed,
		channel: "chromium",
	});
	const ctx = await browser.newContext({
		locale: "en-US",
		storageState: storageState,
		extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
	});

	return { browser, ctx };
};

export default initialiseBrowser;
