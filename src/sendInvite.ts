import { chromium } from "playwright";
import { clickFirstVisible, escRe } from "./common.ts";
import checkConnections from "./checkConnections.ts";
import findAndConnectProfileLinks from "./findAndConnectProfileLinks.ts";

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
		let maybeAlreadyConnected = false;
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
			console.log(
				"❌ Screenshot saved as debug-header.png for debugging purposes.",
				"Warning: Maybe we already have a connection?",
			);
			maybeAlreadyConnected = true;
		}

		// 5) Dialog: click “Send / Send without a note”
		const dlg = page.getByRole("dialog");
		await clickFirstVisible([
			dlg.getByRole("button", { name: SEND }).first(),
			dlg.locator(`button:text-matches("${SEND.source}")`).first(),
		]);
		await page.waitForTimeout(500); // settle

		const who = (await h1.innerText().catch(() => "")).trim();
		if (!maybeAlreadyConnected) {
			console.log(`✅ Invite sent${who ? ` to ${who}` : ""}.`);
		}
		console.log("Checking profile connections...");
		await page.waitForLoadState("networkidle").catch(() => {});

		await checkConnections(page, ctx);
		console.log("✅ Connections checked.");
		console.log("Sending invitations to connections' profiles...");

		await findAndConnectProfileLinks(ctx, page, storagePath);
		console.log("✅ Invitations sent to connections' profiles.");
		console.log("All done!");
	} finally {
		await ctx.close();
		await browser.close();
	}
}

export default sendInvite;
