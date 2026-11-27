import { readFileSync } from "node:fs";
import path from "node:path";
import { type APIRequestContext, expect, type Page, request, test } from "@playwright/test";
import { brands } from "../../dist/tokens";

// Every non-Lab story x every built brand x light and dark.
type Entry = { id: string; title: string; type: string };
const index = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../../storybook-static/index.json"), "utf8"),
) as { entries: Record<string, Entry> };
const stories = Object.values(index.entries).filter(
  (e) => e.type === "story" && !e.title.startsWith("Lab/"),
);

// The web-font families a brand declares (the css2 family spec Storybook loads, see
// .storybook/main.ts), e.g. "Space+Grotesk:wght@300..700" -> "Space Grotesk".
const brandFonts = (brand: string): string[] => {
  const file = path.resolve(import.meta.dirname, `../../brands/${brand}.tokens.json`);
  const tokens = JSON.parse(readFileSync(file, "utf8")) as {
    font?: Record<string, { $extensions?: Record<string, string> }>;
  };
  const specs = Object.entries(tokens.font ?? {})
    .filter(([key]) => !key.startsWith("$"))
    .map(([, font]) => font.$extensions?.["com.bitrate-labs.google-fonts"])
    .filter((spec): spec is string => !!spec);
  return [...new Set(specs.map((spec) => spec.split(":")[0].replaceAll("+", " ")))];
};

// Every story page fetches every brand's Google Fonts stylesheet and font files. Across
// thousands of parallel pages Google throttles some of those requests, so fetch each URL
// once per worker (with retries) and serve the rest from memory.
type Cached = { status: number; headers: Record<string, string>; body: Buffer };
const fontResponses = new Map<string, Promise<Cached>>();
let fontRequest: Promise<APIRequestContext> | undefined;
async function fetchFont(url: string, headers: Record<string, string>): Promise<Cached> {
  fontRequest ??= request.newContext();
  const api = await fontRequest;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await api.get(url, { headers, timeout: 15_000 });
      if (res.ok()) {
        // The body comes back decoded, so drop the encoding headers that described it.
        const kept = res.headers();
        delete kept["content-encoding"];
        delete kept["content-length"];
        return { status: res.status(), headers: kept, body: await res.body() };
      }
      if (attempt >= 4) throw new Error(`${url} returned ${res.status()}`);
    } catch (error) {
      if (attempt >= 4) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
  }
}
test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, async (route) => {
    const url = route.request().url();
    let response = fontResponses.get(url);
    if (!response) {
      response = fetchFont(url, route.request().headers());
      fontResponses.set(url, response);
      response.catch(() => fontResponses.delete(url));
    }
    await route.fulfill(await response);
  });
});

// document.fonts.ready alone races: a face nobody has laid out yet is not loading, so
// ready resolves and the screenshot shows the fallback. Load every family, weight and
// style the rendered page uses, then fail rather than screenshot a fallback.
async function waitForFonts(page: Page, families: string[]) {
  await page
    .waitForFunction(
      (want) => {
        const have = new Set([...document.fonts].map((f) => f.family.replace(/["']/g, "")));
        return want.every((family) => have.has(family));
      },
      families,
      { timeout: 15_000 },
    )
    .catch(() => {
      throw new Error(
        `font did not load: the stylesheet for ${families.join(", ")} never registered`,
      );
    });
  const failed = await page.evaluate(async (declared) => {
    const used = new Set<string>();
    for (const el of [document.body, ...document.body.querySelectorAll("*")]) {
      const s = getComputedStyle(el);
      const family = s.fontFamily.split(",")[0].trim().replace(/["']/g, "");
      if (declared.includes(family)) used.add(`${s.fontStyle} ${s.fontWeight} 16px "${family}"`);
    }
    await Promise.all([...used].map((font) => document.fonts.load(font)));
    await document.fonts.ready;
    return [...used].filter((font) => !document.fonts.check(font));
  }, families);
  expect(failed, `font did not load: ${failed.join("; ")}`).toEqual([]);
}

for (const story of stories) {
  for (const brand of brands) {
    for (const theme of ["light", "dark"]) {
      test(`${story.id} ${brand} ${theme}`, async ({ page }) => {
        // A failing play function still ends in the "finished" phase, so record the
        // preview's own failure events from the moment its channel is created.
        await page.addInitScript(() => {
          type Channel = { on(event: string, listener: (payload: unknown) => void): void };
          const w = window as unknown as Record<string, unknown>;
          let channel: Channel | undefined;
          Object.defineProperty(w, "__STORYBOOK_ADDONS_CHANNEL__", {
            configurable: true,
            get: () => channel,
            set: (c: Channel) => {
              channel = c;
              const failures: unknown[] = [];
              w.__storyFailures = failures;
              c.on("playFunctionThrewException", (e) => failures.push(e));
              c.on("unhandledErrorsWhilePlaying", (e) => failures.push(e));
              c.on("storyThrewException", (e) => failures.push(e));
              c.on("storyErrored", (e) => failures.push(e));
            },
          });
        });
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
        expect(
          await page.evaluate(() => (window as { __storyFailures?: unknown }).__storyFailures),
        ).toEqual([]);
        await waitForFonts(page, brandFonts(brand));
        await expect(page).toHaveScreenshot(`${story.id}--${brand}--${theme}.png`);
      });
    }
  }
}
