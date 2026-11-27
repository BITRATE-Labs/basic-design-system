import { expect, test, type Page } from "@playwright/test";

// The unsaved-changes nudge with real keyboard and mouse input, which user-event in a play
// function cannot give: a real press moves focus, and a real Tab meets Base UI's focus
// guards. Not an agent-bridge test; it lives here because this project runs over the built
// Storybook on every platform.

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=components-unsaved-changes--${id}&viewMode=story`);
  await page.waitForFunction(
    () =>
      (window as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } })
        .__STORYBOOK_PREVIEW__?.currentRender?.phase === "finished",
  );
}

const focusInside = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));

async function expectTabStaysInside(page: Page) {
  for (const key of [...Array(8).fill("Tab"), "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
    await page.keyboard.press(key);
    // Base UI's focus guards hand focus back on a later task, so poll briefly.
    await expect
      .poll(() => focusInside(page), { message: `focus after ${key}`, timeout: 500 })
      .toBe(true);
  }
}

for (const id of ["escape-while-dirty", "outside-press-while-dirty", "on-a-sheet"]) {
  test(`${id}: a real outside press and Escape keep focus and Tab inside`, async ({ page }) => {
    await openStory(page, id);
    const dialog = page.getByRole("dialog");
    await page.mouse.click(8, 8);
    await expect(dialog).toBeVisible();
    await expect.poll(() => focusInside(page), { timeout: 500 }).toBe(true);
    await expectTabStaysInside(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expectTabStaysInside(page);
  });
}

test("native dialog: a real Escape nudges, and repeated Escapes still close it", async ({
  page,
}) => {
  await openStory(page, "native-dialog");
  const dialog = page.getByRole("dialog");
  await page.getByLabel("Title").press("End");
  await page.keyboard.type("!");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-dirty-dismiss", "shake");
  // The browser's close watcher lets a page cancel Escape only while it holds a user
  // activation, so repeated Escapes with no input between close the dialog (measured in
  // Playwright 1.65's Chromium: the third). A native dialog can never trap anyone.
  for (let i = 0; i < 3 && (await dialog.isVisible()); i++) {
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
  }
  await expect(dialog).toBeHidden();
});
