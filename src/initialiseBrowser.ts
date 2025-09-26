import { chromium } from "playwright";
import type { StorageState } from "./types.ts";

const initialiseBrowser = async (
	storageState: string,
	opts: { headed?: boolean } = {},
) => {
	const storageStateObj: StorageState = JSON.parse(storageState);
	const browser = await chromium.launch({ headless: !opts.headed });
	const ctx = await browser.newContext({
		locale: "en-US",
		storageState: storageStateObj,
		extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
	});

	const page = await ctx?.newPage();

	return { browser, ctx, page };
};

export default initialiseBrowser;
