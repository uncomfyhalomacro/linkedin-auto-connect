import { chromium } from "playwright";
const initialiseBrowser = async (
	storagePath: string,
	opts: { headed?: boolean } = {},
) => {
	const browser = await chromium.launch({ headless: !opts.headed });
	const ctx = await browser.newContext({
		storageState: storagePath,
		locale: "en-US",
		extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
	});

	const page = await ctx?.newPage();

	return { browser, ctx, page };
};

export default initialiseBrowser;
