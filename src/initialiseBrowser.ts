import { chromium } from "playwright";
import type { StorageState } from "./types.ts";

const initialiseBrowser = async (
	storageState: StorageState,
	opts: { headed?: boolean } = {},
) => {
	const browser = await chromium.launch({ headless: true });
	const ctx = await browser.newContext({
		locale: "en-US",
		storageState: storageState,
		extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
	});

	const page = await ctx?.newPage();

	return { browser, ctx, page };
};

export default initialiseBrowser;
