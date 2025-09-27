import type { Browser, BrowserContext, Page } from "playwright";
import checkConnections from "./checkConnections.ts";
import { clickFirstVisible, escRe } from "./common.ts";
import { generateDebugInfoPng } from "./debugErrors.ts";
import findAndConnectProfileLinks from "./findAndConnectProfileLinks.ts";
import type { InvitationStatus } from "./types.ts";

async function sendInvite(
	url: string,
	storagePath: string,
	browser: Browser,
	ctx: BrowserContext,
	page: Page,
) {
	// i18n label patterns
	const CONNECT =
		/(Connect|Vernetzen|Se connecter|Conectar|Collegati|Conectar-se)/i;
	const MORE = /(More|More actions|Mehr|Plus|Más|Altro)/i;
	const SEND = /(Send( without a note)?|Senden|Envoyer|Enviar|Invia)/i;
	// Only these truly mean “already sent”
	const PENDING = /(Pending|Ausstehend|Withdraw)/i;

	let invitationStatus: InvitationStatus = "fail";

	try {
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
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
					overlay.getByRole("button", { name: /Invite/ }).first(),
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
				invitationStatus = "pending";
				console.log("Checking profile connections...");
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

			if (btnNames.length === 0) {
				console.log(
					"❌ No Connect found. Accessible header button names:",
					btnNames,
				);
				await generateDebugInfoPng(page).catch((err) => {
					console.log(
						"‼️ Something went wrong when saving the debug log: ",
						err,
					);
				});
			}
		}

		// 5) Dialog: click “Send / Send without a note”
		const dlg = page.getByRole("dialog");
		const successInvite = await clickFirstVisible([
			dlg.getByRole("button", { name: SEND }).first(),
			dlg.locator(`button:text-matches("${SEND.source}")`).first(),
		]);
		await page.waitForTimeout(500); // settle

		const who = (await h1.innerText().catch(() => "")).trim();

		if (successInvite) {
			invitationStatus = "sent";
			console.log(`✅ Invite sent${who ? ` to ${who}` : ""}.`);
			// TODO: Save to database link and name.
		}

		console.log("Checking profile connections...");
		await page.waitForLoadState("networkidle").catch((err) => {
			console.log(err);
		});

		const searchPage = await checkConnections(page, ctx);
		console.log("✅ Connections checked.");
		console.log("Sending invitations to connections' profiles...");

		const successFinding = await findAndConnectProfileLinks(
			url,
			browser,
			ctx,
			searchPage,
			storagePath,
		);
		if (successFinding)
			console.log("✅ Invitations sent to connections' profiles.");
		console.log("All done!");
	} catch (err) {
		console.error("❌ Error in sendInvite:", err);
		await generateDebugInfoPng(page).catch((err) => {
			console.log("‼️ Something went wrong when saving the debug log: ", err);
		});
		console.log(
			"❌ Screenshot saved as error-screenshot.png for debugging purposes.",
		);
		return { status: invitationStatus, success: false, fail: true };
	}
	let result: { status: InvitationStatus; success: boolean; fail: boolean };

	switch (invitationStatus) {
		case "sent":
			result = { status: invitationStatus, success: true, fail: false };
			break; // Stops execution from continuing to the next case
		default: // 'pending' and 'default' have the same outcome, so they can be grouped
			result = { status: invitationStatus, success: false, fail: true };
			break;
	}
	return result;
}

export default sendInvite;
