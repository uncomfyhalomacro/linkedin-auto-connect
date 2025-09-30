import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Page } from "playwright";

const generateDebugInfoPng = async (page: Page, customDir = "debug-logs") => {
	const projectRootDir = path.dirname(process.argv0);
	const dateFileNameFormat = Date.now().toString();
	const debugOutDir = path.join(projectRootDir, customDir);

	if (!existsSync(debugOutDir)) {
		mkdirSync(debugOutDir, { recursive: true });
	}

	const outputPath = path.join(debugOutDir, `${dateFileNameFormat}.png`);
	await page.screenshot({ fullPage: true, path: outputPath }); // Maybe set fullPage to true if on container???
	console.log(`✅ Debugs saved to ${outputPath}.`);
};

export { generateDebugInfoPng };
