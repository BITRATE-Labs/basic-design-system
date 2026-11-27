import { defineConfig } from "@playwright/test";

// Checks over the built static Storybook (npm run build-storybook first).
// visual: baselines are Linux-only; run through `npm run test:visual`, which skips elsewhere.
// agent: drives stories through the ui-sdk agent bridge; `npm run test:agent`, any platform.
const port = 6008;

export default defineConfig({
  projects: [
    { name: "visual", testDir: "tests/visual", testMatch: "*.visual.ts" },
    { name: "agent", testDir: "tests/agent", testMatch: "*.agent.ts" },
  ],
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1024, height: 768 },
  },
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css" },
  },
  webServer: {
    command: `vite preview --outDir storybook-static --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
});
