import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Page } from "playwright";

const generateDebugInfoPng = async (page: Page) => {
	const projectRootDir = path.dirname(process.argv0);
	const dateFileNameFormat = Date.now().toString();
	const debugOutDir = path.join(projectRootDir, "playwrightDebugLogs");

	if (!existsSync(debugOutDir)) {
		mkdirSync(debugOutDir, { recursive: true });
	}

	const outputPath = path.join(debugOutDir, `${dateFileNameFormat}.png`);
	await page.screenshot({ fullPage: false, path: outputPath });
	console.log(`✅ Debugs saved to ${outputPath}.`);
};

export { generateDebugInfoPng };
