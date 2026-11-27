import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { brands } from "../../dist/tokens";

// Every non-Lab story x every built brand x light and dark.
type Entry = { id: string; title: string; type: string };
const index = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../../storybook-static/index.json"), "utf8"),
) as { entries: Record<string, Entry> };
const stories = Object.values(index.entries).filter(
  (e) => e.type === "story" && !e.title.startsWith("Lab/"),
);

for (const story of stories) {
  for (const brand of brands) {
    for (const theme of ["light", "dark"]) {
      test(`${story.id} ${brand} ${theme}`, async ({ page }) => {
        await page.goto(
          `/iframe.html?id=${story.id}&viewMode=story&globals=brand:${brand};theme:${theme}`,
        );
        // Wait for render, play function and afterEach hooks, then for web fonts.
        const phase = await page.waitForFunction(() => {
          const p = (window as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } })
            .__STORYBOOK_PREVIEW__?.currentRender?.phase;
          return ["finished", "errored", "aborted"].includes(p ?? "") && p;
        });
        expect(await phase.jsonValue()).toBe("finished");
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${story.id}--${brand}--${theme}.png`);
      });
    }
  }
}
