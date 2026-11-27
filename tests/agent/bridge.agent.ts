import { expect, test, type Page } from "@playwright/test";
import type { AgentStep } from "@ui-sdk/react/agent";
import type { agent } from "../../src/components/ui-sdk/agent";

// Drives the built Storybook through the bridge the preview decorator puts on window.agent,
// the same calls a model makes: snapshot, query and act.
type Bridge = NonNullable<typeof agent>;
type Tool = { name: string; execute: (input: object) => unknown };
type Win = Window & { agent: Bridge; __tools?: Tool[] };

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.waitForFunction(() => {
    const w = window as unknown as Win & {
      __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } };
    };
    return w.agent && w.__STORYBOOK_PREVIEW__?.currentRender?.phase === "finished";
  });
}

const snapshot = (page: Page) => page.evaluate(() => (window as unknown as Win).agent.snapshot());
const act = (page: Page, steps: AgentStep[]) =>
  page.evaluate((steps) => (window as unknown as Win).agent.act({ steps }), steps);
const status = (page: Page) => page.getByRole("status");

test("sees only ui-sdk parts, not the stock Base UI components", async ({ page }) => {
  await openStory(page, "examples-settings-form--default");
  await expect(page.getByRole("button").first()).toBeVisible();
  expect(await snapshot(page)).toEqual([]);
});

test("opens a dialog, switches its tab, fills the form and submits it", async ({ page }) => {
  await openStory(page, "agents--workspace-dialog");
  expect(await snapshot(page)).toContainEqual(
    expect.objectContaining({ component: "dialog", open: false }),
  );

  const opened = await act(page, [
    { ref: "Edit workspace", action: "press" },
    { ref: "Workspace sections", action: "setValue", args: ["Notifications"] },
  ]);
  expect(opened.ok, opened.error?.message).toBe(true);
  await expect(page.getByRole("dialog", { name: "Workspace settings" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Notifications" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const components = await snapshot(page);
  expect(components).toContainEqual(
    expect.objectContaining({ component: "dialog", label: "Workspace settings", open: true }),
  );
  expect(components).toContainEqual(
    expect.objectContaining({ component: "tabs", value: "notifications" }),
  );

  const submitted = await act(page, [
    { ref: "Digest email", action: "setValue", args: ["digest@example.com"] },
    { ref: "Workspace name", action: "setValue", args: ["Renamed Workspace"] },
    { ref: "Save changes", action: "press" },
  ]);
  expect(submitted.ok, submitted.error?.message).toBe(true);
  await expect(status(page)).toHaveText("Saved: Renamed Workspace, digest to digest@example.com");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("never performs a data-agent-confirm action without the person", async ({ page }) => {
  await openStory(page, "agents--confirm-required");
  expect(await snapshot(page)).toContainEqual(
    expect.objectContaining({ label: "Delete workspace", confirm: "Deletes the sample workspace" }),
  );
  const press = [{ ref: "Delete workspace", action: "press" }];
  const asked: string[] = [];

  page.once("dialog", (d) => (asked.push(d.message()), d.dismiss()));
  const refused = await act(page, press);
  expect(refused.ok).toBe(false);
  expect(refused.error?.message).toContain("The person said no");
  await expect(status(page)).toHaveText("Workspace exists.");

  page.once("dialog", (d) => (asked.push(d.message()), d.accept()));
  const allowed = await act(page, press);
  expect(allowed.ok, allowed.error?.message).toBe(true);
  await expect(status(page)).toHaveText("Workspace deleted.");
  expect(asked).toHaveLength(2);
  expect(asked[0]).toContain("Deletes the sample workspace");
});

test("leaves a data-agent-hidden region out of snapshot, query and act", async ({ page }) => {
  await openStory(page, "agents--hidden-region");
  const labels = (await snapshot(page)).map((c) => c.label);
  expect(labels).toContain("Backup email");
  expect(labels).not.toContain("Recovery code");
  expect(
    await page.evaluate(() => (window as unknown as Win).agent.query({ text: "Recovery" })),
  ).toEqual([]);

  const result = await act(page, [{ ref: "Recovery code", action: "setValue", args: ["x"] }]);
  expect(result.ok).toBe(false);
  await expect(page.getByRole("textbox", { name: "Recovery code" })).toHaveValue(
    "SAMPLE-0000-0000",
  );
});

test("reports agent changes as source agent and lets the app cancel them", async ({ page }) => {
  await openStory(page, "agents--agent-changes");
  const moved = await act(page, [
    { ref: "Settings sections", action: "setValue", args: ["Notifications"] },
  ]);
  expect(moved.ok, moved.error?.message).toBe(true);
  await expect(status(page)).toHaveText("notifications opened by an agent.");

  const billing = await act(page, [
    { ref: "Settings sections", action: "setValue", args: ["Billing"] },
  ]);
  expect(billing.ok).toBe(false);
  expect(billing.error?.message).toContain("didn't take");
  await expect(status(page)).toHaveText("Refused: only a person opens Billing.");

  await page.getByRole("tab", { name: "Billing" }).click();
  await expect(status(page)).toHaveText("billing opened by a person.");
});

test("offers the tools over WebMCP, and confirm steps still ask the person", async ({ page }) => {
  // A stand-in for a browser's document.modelContext, as in the ui-sdk skill's testing.md.
  await page.addInitScript(() => {
    const w = window as unknown as Win;
    w.__tools = [];
    Object.assign(document, {
      modelContext: { registerTool: async (tool: Tool) => void w.__tools!.push(tool) },
    });
  });
  await openStory(page, "agents--confirm-required");
  expect(
    await page.evaluate(() => (window as unknown as Win).__tools!.map((t) => t.name).sort()),
  ).toEqual(["act", "query", "snapshot"]);

  let asked = 0;
  page.on("dialog", (d) => (asked++, d.dismiss()));
  const result = await page.evaluate(
    () =>
      (window as unknown as Win)
        .__tools!.find((t) => t.name === "act")!
        .execute({ steps: [{ ref: "Delete workspace", action: "press" }] }) as Promise<{
        ok: boolean;
      }>,
  );
  expect(result.ok).toBe(false);
  expect(asked).toBe(1);
  await expect(status(page)).toHaveText("Workspace exists.");
});
