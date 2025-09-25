// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import initialiseBrowser from "./initialiseBrowser.ts";
import sendInvite from "./sendInvite.ts";

// CLI
(async () => {
	const [url, storage, maybeHeaded] = process.argv.slice(2);
	if (!url || !storage) {
		console.error(
			'Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> <duration> [--headed]',
		);
		process.exit(1);
	}
	const { browser, ctx, page } = await initialiseBrowser(storage, {
		headed: maybeHeaded === "--headed",
	});
	if (!browser || !ctx || !page) {
		console.error("❌ Failed to initialize browser or page.");
		process.exit(1);
	}
	await sendInvite(url, storage, browser, ctx, page);
	await ctx.close();
	await browser.close();
})();
