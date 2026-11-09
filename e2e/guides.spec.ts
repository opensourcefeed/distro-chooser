import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("analytics-consent", "denied");
    } catch {}
  });
});

test("every internal link on the guide pages resolves", async ({ page, request }) => {
  const toVisit = ["./", "./best-for/", "./compare/"];
  const seen = new Set<string>();
  const internal = new Set<string>();
  while (toVisit.length) {
    const url = toVisit.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    await page.goto(url);
    const hrefs = await page.$$eval("a[href^='/distro-chooser/']", (as) => as.map((a) => a.getAttribute("href")!.split("#")[0]));
    for (const h of hrefs) {
      internal.add(h);
      const rel = "./" + h.replace(/^\/distro-chooser\//, "");
      if ((h.includes("/best-for/") || h.includes("/compare/")) && !seen.has(rel)) toVisit.push(rel);
    }
  }
  expect(seen.size).toBeGreaterThanOrEqual(18);
  for (const h of internal) {
    const res = await request.get(h);
    expect(res.status(), h).toBe(200);
  }
});

for (const width of [320, 1440]) {
  test.describe(`guide pages at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of ["best-for/", "best-for/gaming/", "compare/", "compare/ubuntu-vs-linux-mint/"]) {
      test(`${path} fits the screen and has one h1`, async ({ page }, testInfo) => {
        await page.goto(`./${path}`);
        await expect(page.locator("h1")).toHaveCount(1);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        await page.screenshot({ path: testInfo.outputPath("page.png"), fullPage: true });
      });
    }
  });
}

test("results link to a comparison when two of the top three have one", async ({ page }) => {
  // Top three for these answers: Arch Linux, openSUSE Tumbleweed, Fedora → "Fedora vs Arch Linux".
  await page.goto("./?a=pc,advanced,development,2-to-5,no,rolling,kde-plasma");
  const link = page.getByRole("link", { name: /Read our .+ vs .+ comparison/ });
  await expect(link).toHaveAttribute("href", "/distro-chooser/compare/fedora-vs-arch-linux/");
  await link.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Fedora vs Arch Linux");
});
