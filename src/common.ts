import type { Locator } from "playwright";

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

function escRe(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { clickFirstVisible, escRe };
