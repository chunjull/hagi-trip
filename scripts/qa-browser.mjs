import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const toolsDirectory = resolve(process.env.QA_TOOLS_DIR ?? "/private/tmp/gintama-m6-qa/node_modules");
const { chromium } = await import(pathToFileURL(resolve(toolsDirectory, "playwright-core/index.mjs")));
const { default: AxeBuilder } = await import(pathToFileURL(resolve(toolsDirectory, "@axe-core/playwright/dist/index.mjs")));
const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:4173";
const artifacts = resolve(process.env.QA_ARTIFACTS_DIR ?? "/private/tmp/gintama-m6-qa/artifacts");
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.QA_CHROME_PATH ?? "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary", headless: true });
const results = [];

async function check(name, callback) {
  const filter = process.env.QA_FILTER ?? process.argv[2];
  if (filter && !name.includes(filter)) return;
  try {
    const detail = await callback();
    results.push({ name, passed: true, detail });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack ?? String(error) });
    console.log(`FAIL ${name}: ${error.stack ?? error}`);
  }
}

async function visit(page, path) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
}

async function axe(page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  assert.deepEqual(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })), []);
  return { rulesPassed: result.passes.length, incomplete: result.incomplete.map((rule) => rule.id) };
}

async function assertFits(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "Horizontal overflow");
  const dialog = page.locator("dialog[open]");
  if (await dialog.count()) {
    const bounds = await dialog.boundingBox();
    const viewport = page.viewportSize();
    assert(bounds.x >= -1 && bounds.y >= -1 && bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1, "Dialog exceeds viewport");
  }
}

try {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 640, hasTouch: viewport.width < 640, timezoneId: "Asia/Taipei" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.clock.setFixedTime(new Date("2026-10-05T10:00:00+09:00"));
    const label = `${viewport.width}x${viewport.height}`;
    await check(`${label}: map, touch/keyboard, detail and navigation`, async () => {
      await visit(page, "/");
      await page.locator(".place-marker-icon").first().waitFor();
      assert.equal(await page.locator(".place-marker-icon").count(), 29);
      await assertFits(page);
      await page.getByText("地圖狀態與注意事項", { exact: true }).click();
      const legendAccessibility = await axe(page);
      await page.getByText("地圖狀態與注意事項", { exact: true }).click();
      const markers = page.locator(".place-marker-icon");
      let marker;
      for (const candidate of await markers.all()) {
        if (await candidate.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          return hit && (element === hit || element.contains(hit));
        })) { marker = candidate; break; }
      }
      assert(marker, "No unobstructed marker available");
      const accessibleName = await marker.getAttribute("aria-label");
      assert(accessibleName.includes("開啟詳細資訊"));
      if (viewport.width < 640) await marker.tap();
      else { await marker.focus(); await page.keyboard.press("Enter"); }
      const dialog = page.locator("dialog[open]");
      await dialog.waitFor();
      await assertFits(page);
      await page.waitForFunction(() => document.activeElement?.tagName === "BUTTON" && document.activeElement.closest("dialog[open]"));
      const navigation = dialog.getByRole("link", { name: /在 Google Maps 開啟/ });
      const url = new URL(await navigation.getAttribute("href"));
      assert.equal(url.hostname, "www.google.com");
      assert.equal(url.searchParams.get("api"), "1");
      assert(url.searchParams.get("query"));
      await navigation.scrollIntoViewIfNeeded();
      const navigationBounds = await navigation.boundingBox();
      assert(navigationBounds.height >= 44);
      await context.route("https://www.google.com/maps/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>External navigation</title>" }));
      const popupPromise = page.waitForEvent("popup");
      await navigation.click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(popup.url(), url.toString());
      await popup.close();
      const accessibility = await axe(page);
      await page.screenshot({ path: resolve(artifacts, `detail-${label}.png`) });
      for (let step = 0; step < 15; step++) {
        await page.keyboard.press("Tab");
        assert(await page.evaluate(() => !!document.activeElement.closest("dialog[open]")), "Focus left detail dialog");
      }
      await dialog.getByRole("button", { name: /關閉/ }).click();
      await page.waitForFunction(() => document.activeElement?.classList.contains("place-marker-icon"));
      await marker.focus();
      await page.keyboard.press("Enter");
      await dialog.waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog[open]").count(), 0);
      assert.deepEqual(errors, []);
      return { legend: legendAccessibility, detail: accessibility };
    });
    await check(`${label}: date picker, complete list and shareable URL`, async () => {
      await visit(page, "/list?date=2026-10-09");
      assert.equal(await page.locator("#list-date").inputValue(), "2026-10-09");
      assert.equal(await page.locator("#list-date").getAttribute("min"), "2026-10-01");
      assert.equal(await page.locator("#list-date").getAttribute("max"), "2026-12-31");
      assert.equal(await page.locator("article").filter({ has: page.locator(".place-number") }).count(), 32);
      const casa = page.locator("article").filter({ has: page.getByRole("heading", { name: "CASA inn Iseya", exact: true }) });
      assert((await casa.textContent()).includes("コラボ宿泊プラン"));
      assert(!(await casa.textContent()).includes("所選日期有提供"));
      const futureContent = await page.locator("main").textContent();
      assert(!futureContent.includes("2 小時內結束營業") && !futureContent.includes("1 小時內結束營業"));
      await page.locator("#list-date").fill("2026-10-10");
      await page.waitForURL("**/list?date=2026-10-10");
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.locator("#list-date").inputValue(), "2026-10-10");
      await assertFits(page);
      const accessibility = await axe(page);
      await page.screenshot({ path: resolve(artifacts, `list-${label}.png`) });
      assert.deepEqual(errors, []);
      return accessibility;
    });
    await check(`${label}: 11/28 blocking dialog and train information`, async () => {
      await visit(page, "/list?date=2026-11-28");
      const dialog = page.locator("dialog[open]");
      await dialog.waitFor();
      await page.waitForFunction(() => document.activeElement?.id === "replacement-date");
      assert((await dialog.textContent()).includes("本日運行"));
      assert((await dialog.textContent()).includes("12:51"));
      assert((await dialog.textContent()).includes("14:09"));
      assert.equal(await dialog.getByRole("button", { name: /關閉/ }).count(), 0);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog[open]").count(), 1, "Escape closed the blocking dialog");
      await page.mouse.click(1, 1);
      assert.equal(await page.locator("dialog[open]").count(), 1, "Backdrop closed the blocking dialog");
      for (let step = 0; step < 12; step++) {
        await page.keyboard.press(step % 2 ? "Shift+Tab" : "Tab");
        assert(await page.evaluate(() => !!document.activeElement.closest("dialog[open]")), "Focus left blocking dialog");
      }
      const accessibility = await axe(page);
      await assertFits(page);
      await page.screenshot({ path: resolve(artifacts, `1128-${label}.png`) });
      await dialog.locator("#replacement-date").fill("2026-11-29");
      await page.waitForURL("**/list?date=2026-11-29");
      await page.waitForFunction(() => !document.querySelector("dialog[open]") && document.activeElement?.id === "list-date");
      assert.deepEqual(errors, []);
      return accessibility;
    });
    await check(`${label}: about, contrast and viewport`, async () => {
      await visit(page, "/about");
      await assertFits(page);
      const accessibility = await axe(page);
      assert.deepEqual(errors, []);
      return accessibility;
    });
    await context.close();
  }

  for (const timezoneId of ["Asia/Taipei", "America/Los_Angeles", "Asia/Tokyo"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId });
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-10-05T09:59:00+09:00") });
    await page.clock.pauseAt(new Date("2026-10-05T09:59:00+09:00"));
    await check(`${timezoneId}: JST, minute refresh, return from maps and midnight`, async () => {
      await visit(page, "/");
      await page.clock.runFor(1000);
      const marker = page.locator('.place-marker-icon[title*="旧久保田家住宅"]');
      await marker.waitFor();
      assert((await page.locator("header time").textContent()).includes("09:59 JST"));
      assert((await marker.getAttribute("aria-label")).includes("尚未開始"));
      await page.clock.runFor(60_000);
      assert((await page.locator("header time").textContent()).includes("10:00 JST"));
      assert((await marker.getAttribute("aria-label")).includes("營業中"));
      await page.clock.setFixedTime(new Date("2026-10-05T14:00:00+09:00"));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await page.waitForFunction(() => document.querySelector('.place-marker-icon[title*="旧久保田家住宅"]')?.getAttribute("aria-label")?.includes("已結束"));
      assert((await marker.getAttribute("aria-label")).includes("已結束"));
      await page.clock.setFixedTime(new Date("2026-10-05T23:59:00+09:00"));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      assert((await page.locator("header time").textContent()).includes("2026/10/05"));
      await page.clock.setFixedTime(new Date("2026-10-06T00:00:00+09:00"));
      await page.clock.runFor(60_000);
      assert((await page.locator("header time").textContent()).includes("2026/10/06"));
    });
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(resolve(artifacts, "results.json"), JSON.stringify({ baseUrl, results }, null, 2));
}
if (results.some((result) => !result.passed)) process.exitCode = 1;
