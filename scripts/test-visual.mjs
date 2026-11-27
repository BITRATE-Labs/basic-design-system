// Runs the Playwright visual suite. Baselines are Linux-only (CI's pinned Playwright
// container), so every other platform skips instead of failing on font rendering.
// Extra arguments pass through, e.g. `npm run test:visual -- --update-snapshots`.
import { spawnSync } from "node:child_process";

if (process.platform !== "linux") {
  console.log(
    `test:visual: skipped on ${process.platform}. Baselines are Linux-only; ` +
      "CI runs this check in the pinned Playwright container.",
  );
  process.exit(0);
}

const { status } = spawnSync(
  "npx",
  ["playwright", "test", "--project=visual", ...process.argv.slice(2)],
  {
    stdio: "inherit",
  },
);
process.exit(status ?? 1);
