import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Page } from "playwright";

const generateDebugInfoPng = async (page: Page) => {
	const projectRootDir = path.dirname(process.argv0);
	const dateFileNameFormat = new Date(Date.now()).toUTCString();
	const debugOutDir = path.join(projectRootDir, "playwrightDebugLogs");

	if (!existsSync(debugOutDir)) {
		mkdirSync(debugOutDir, { recursive: true });
	}

	const outputPath = path.join(`${dateFileNameFormat}.png`);
	await page.screenshot({ fullPage: true, path: outputPath });
	console.log(`✅ Debugs saved to ${outputPath}.`);
};

export { generateDebugInfoPng };
