import { defineConfig } from "@playwright/test";

// Visual check over the built static Storybook (npm run build-storybook first).
// Baselines are Linux-only; run through `npm run test:visual`, which skips elsewhere.
const port = 6008;

export default defineConfig({
  testDir: "tests/visual",
  testMatch: "*.visual.ts",
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
