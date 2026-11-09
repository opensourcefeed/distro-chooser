#!/usr/bin/env node
// Renders scripts/og-image.html to public/og-image.png (1200×630) with
// Playwright, using the same self-hosted fonts as the site.
// Run: pnpm run og:render   (needs `pnpm exec playwright install chromium` once)
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${root}/scripts/og-image.html`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${root}/public/og-image.png` });
await browser.close();
console.log("Wrote public/og-image.png");
