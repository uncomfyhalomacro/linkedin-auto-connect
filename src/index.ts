// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]

import sendInvite from "./sendInvite.ts";

// CLI
(async () => {
	const [url, storage, maybeHeaded] = process.argv.slice(2);
	if (!url || !storage) {
		console.error(
			'Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]',
		);
		process.exit(1);
	}
	await sendInvite(url, storage, { headed: maybeHeaded === "--headed" });
})();
