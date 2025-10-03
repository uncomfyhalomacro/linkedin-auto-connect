import type { Page } from "playwright";
import {
	checkMoreMenu,
	clickFirstVisible,
	escRe,
	getHashFormOfLink,
	throttle,
} from "./common.ts";
import { generateDebugInfoPng } from "./debugErrors.ts";
import ProfileLinks from "./models/ProfileLinks.js";
import type { InvitationStatus } from "./types.ts";

async function checkInviteToConnectBtn(page: Page) {
	const h1 = page.getByRole("main").getByRole("heading", { level: 1 }).first();
	const name = (await h1.innerText().catch(() => "")).trim();
	if (name) {
		const INVITE = new RegExp(`Invite\\s+${escRe(name)}\\s+to\\s+connect`, "i");
		return await checkMoreMenu(page, INVITE);
	}
	return undefined;
}

async function checkRemoveConnectionBtn(page: Page) {
	const REMOVE = /Remove your connection to/i;
	return await checkMoreMenu(page, REMOVE);
}

async function checkPendingBtn(page: Page) {
	const PENDING = /(Pending|Ausstehend|Withdraw)/i;
	// If still nothing, only now check if it’s actually pending
	const isPending = await page
		.getByRole("main")
		.getByRole("button", { name: PENDING })
		.first()
		.isVisible()
		.catch(() => false);
	return isPending;
}

async function sendInvite(url: string, page: Page) {
	const { memberIdUrl, cleanProfileUrl } = await getHashFormOfLink(page, url);
	// i18n label patterns
	const CONNECT =
		/(Connect|Vernetzen|Se connecter|Conectar|Collegati|Conectar-se)/i;
	const SEND = /(Send( without a note)?|Senden|Envoyer|Enviar|Invia)/i;
	// Only these truly mean “already sent”

	let invitationStatus: InvitationStatus = "fail";

	try {
		await page.goto(memberIdUrl, { waitUntil: "domcontentloaded", timeout: 0 });
		const h1 = page
			.getByRole("main")
			.getByRole("heading", { level: 1 })
			.first();
		await h1.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
		await page.waitForLoadState("networkidle").catch(() => {});

		// 1) Prefer Connect if it exists (don’t early-out because of Message/Following)
		await clickFirstVisible([
			page.getByRole("main").getByRole("button", { name: CONNECT }).first(),
			page
				.getByRole("main")
				.locator('button:has-text("Connect")')
				.first(), // extra fallback
		]);

		await page.reload({ waitUntil: "domcontentloaded" });

		const isPending = await checkPendingBtn(page);

		if (isPending) {
			console.log("ℹ️ You already sent an invitation to this profile!");
			invitationStatus = "pending";
		}

		const isConnectedAlready = await checkRemoveConnectionBtn(page);

		if (isConnectedAlready) {
			invitationStatus = "connected";
			console.log("✅ You are already connnected to this profile!");
			await isConnectedAlready.moreBtn.first().click();
		}

		const resInvite = await checkInviteToConnectBtn(page);

		if (resInvite) {
			const expanded = await resInvite.moreBtn
				.first()
				.getAttribute("aria-expanded");
			if (expanded === "false") {
				await throttle(3, 12);
				await resInvite.moreBtn.first().scrollIntoViewIfNeeded();
				await resInvite.moreBtn.first().click();
			}
			console.log("Attempting to invite profile...");
			await resInvite.hayStackBtn.first().scrollIntoViewIfNeeded();
			const visible = await resInvite.hayStackBtn.first().isVisible();
			await throttle(4, 10);
			if (visible) {
				console.log("Inviting to connect with current profile");
				await clickFirstVisible([
					page.getByRole("menuitem", { name: CONNECT }).first(),
					page
						.getByRole("main")
						.getByRole("button", { name: /Invite/i })
						.first(),
					page.locator(`:text-matches("${CONNECT.source}")`).first(),
				]);
			} else {
				await clickFirstVisible([
					page.getByRole("menuitem", { name: CONNECT }).first(),
					page
						.getByRole("main")
						.getByRole("button", { name: /^Invite .* to connect$/i })
						.first(),
					page
						.getByRole("main")
						.getByRole("button", { name: /Invite/i })
						.first(),
					page.locator(`:text-matches("${CONNECT.source}")`).first(),
				]);
			}
		}

		// 5) Dialog: click “Send / Send without a note”
		const dlg = page.getByRole("dialog");
		await throttle(1, 5);
		const successInvite = await clickFirstVisible([
			dlg.getByRole("button", { name: SEND }).first(),
			dlg.locator(`button:text-matches("${SEND.source}")`).first(),
		]);

		const who = (await h1.innerText().catch(() => "")).trim();

		if (successInvite) {
			invitationStatus = "sent";
			console.log(`✅ Invite sent${who ? ` to ${who}` : ""}.`);
		} else {
			await generateDebugInfoPng(page, "debug-logs");
		}

		let profileLink = await ProfileLinks.findOne({
			where: { member_id_url: memberIdUrl },
		});

		if (!profileLink) {
			profileLink = await ProfileLinks.create({
				member_id_url: memberIdUrl,
				clean_profile_url: cleanProfileUrl,
				name: who,
			});
			console.log("✅ Link added to database");
		} else {
			await profileLink.update({ last_fetched_on: new Date() });
			console.log("✅ Link updated in database");
		}

		console.log("Checking profile connections...");
		await page
			.waitForLoadState("domcontentloaded", { timeout: 20000 })
			.catch((err) => {
				console.log(err);
			});
		let result: { status: InvitationStatus; success: boolean; fail: boolean };

		switch (invitationStatus) {
			case "sent":
				result = { status: invitationStatus, success: true, fail: false };
				await profileLink.update({
					connected: false,
					pending: invitationStatus === "sent",
				});
				break; // Stops execution from continuing to the next case
			case "pending":
				result = { status: invitationStatus, success: true, fail: false };
				await profileLink.update({
					connected: false,
					pending: invitationStatus === "pending",
				});
				break; // Stops execution from continuing to the next case
			case "connected":
				result = { status: invitationStatus, success: true, fail: false };
				await profileLink.update({
					connected: invitationStatus === "connected",
					pending: false,
				});
				break;
			default:
				result = { status: invitationStatus, success: false, fail: true };
				break;
		}
		return result;
	} catch (err) {
		console.error("❌ Error in sendInvite:", err);
		await generateDebugInfoPng(page).catch((err) => {
			console.log("‼️ Something went wrong when saving the debug log: ", err);
		});
		return { status: invitationStatus, success: false, fail: true };
	}
}

export default sendInvite;
