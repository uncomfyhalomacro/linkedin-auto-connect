// Usage: node linkedin-invite.js "<profile_url>" <storage_state.json> [--headed]
import { chromium } from "playwright";
import { type Locator } from "playwright";

function escRe(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

async function sendInvite(
	url: string,
	storagePath: string,
	opts: { headed?: boolean } = {},
) {
	const browser = await chromium.launch({ headless: !opts.headed });
	const ctx = await browser.newContext({
		storageState: storagePath,
		locale: "en-US",
		extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
	});

	const page = await ctx.newPage();

	// i18n label patterns
	const CONNECT =
		/(Connect|Vernetzen|Se connecter|Conectar|Collegati|Conectar-se)/i;
	const MORE = /(More|More actions|Mehr|Plus|Más|Altro)/i;
	const SEND = /(Send( without a note)?|Senden|Envoyer|Enviar|Invia)/i;
	// Only these truly mean “already sent”
	const PENDING = /(Pending|Ausstehend|Withdraw)/i;

	try {
		await page.goto(url, { waitUntil: "domcontentloaded" });
		const h1 = page
			.getByRole("main")
			.getByRole("heading", { level: 1 })
			.first();
		await h1.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
		await page.waitForLoadState("networkidle").catch(() => {});

		// 1) Prefer Connect if it exists (don’t early-out because of Message/Following)
		let clicked = await clickFirstVisible([
			page.getByRole("main").getByRole("button", { name: CONNECT }).first(),
			page
				.getByRole("main")
				.locator('button:has-text("Connect")')
				.first(), // extra fallback
		]);

		// 2) If not visible, try under “More”
		if (!clicked) {
			const moreBtn = page
				.getByRole("main")
				.getByRole("button", { name: MORE })
				.first();
			if (await moreBtn.isVisible().catch(() => false)) {
				await moreBtn.click();
				const overlay = page
					.locator('[role="menu"], .artdeco-dropdown__content, [role="dialog"]')
					.first();
				clicked = await clickFirstVisible([
					overlay.getByRole("menuitem", { name: CONNECT }).first(),
					overlay.getByRole("button", { name: CONNECT }).first(),
					overlay.locator(`:text-matches("${CONNECT.source}")`).first(),
				]);
			}
		}

		// 3) Rare fallback: “Invite <name> to connect”
		if (!clicked) {
			const name = (await h1.innerText().catch(() => "")).trim();
			if (name) {
				const re1 = new RegExp(
					`Invite\\s+${escRe(name)}\\s+to\\s+connect`,
					"i",
				);
				const re2 = new RegExp(`Invite\\s+${escRe(name)}\\s+to`, "i");
				clicked = await clickFirstVisible([
					page.getByRole("main").getByRole("button", { name: re1 }).first(),
					page.getByRole("main").getByRole("button", { name: re2 }).first(),
				]);
			}
		}

		// 4) If still nothing, only now check if it’s actually pending
		if (!clicked) {
			const isPending = await page
				.getByRole("main")
				.getByRole("button", { name: PENDING })
				.first()
				.isVisible()
				.catch(() => false);
			if (isPending) {
				console.log("ℹ️ Invitation already pending.");
				return;
			}

			// Debug: print accessible names of header buttons
			const mainEl = await page.$("main");
			const acc = mainEl
				? await page.accessibility
						.snapshot({ root: mainEl, interestingOnly: true })
						.catch(() => null)
				: null;
			const btnNames = [];
			(function walk(n) {
				if (!n) return;
				if (n.role === "button" && n.name) btnNames.push(n.name);
				(n.children || []).forEach(walk);
			})(acc);
			console.log(
				"❌ No Connect found. Accessible header button names:",
				btnNames,
			);
			await page.screenshot({ path: "debug-header.png" }).catch(() => {});
			throw new Error("Could not find a Connect/Invite button.");
		}

		// 5) Dialog: click “Send / Send without a note”
		const dlg = page.getByRole("dialog");
		await clickFirstVisible([
			dlg.getByRole("button", { name: SEND }).first(),
			dlg.locator(`button:text-matches("${SEND.source}")`).first(),
		]);
		await page.waitForTimeout(500); // settle

		const who = (await h1.innerText().catch(() => "")).trim();
		console.log(`✅ Invite sent${who ? ` to ${who}` : ""}.`);
	} finally {
		await ctx.close();
		await browser.close();
	}
}

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
