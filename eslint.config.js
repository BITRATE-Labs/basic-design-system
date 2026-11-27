import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import designSystem from "./eslint/index.js";

// The lab trials, the Agents stories and the agent tests use raw UI SDK parts on purpose;
// everything else keeps the preset's import rule.
const [, { patterns }] = designSystem[0].rules["no-restricted-imports"];
const rawUiSdk = {
  files: ["src/lab/ui-sdk/**", "src/stories/agents.stories.tsx", "tests/agent/**"],
  rules: {
    "no-restricted-imports": [
      "error",
      { patterns: patterns.filter((p) => !p.group.includes("@ui-sdk/*")) },
    ],
  },
};

export default defineConfig([
  globalIgnores([
    "dist",
    "storybook-static",
    "node_modules",
    "test-results",
    "playwright-report",
    // Deliberate violations for tests/lint-preset.test.ts.
    "tests/fixtures/lint",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  designSystem,
  rawUiSdk,
  {
    files: ["scripts/**", "eslint/**", "*.config.{js,ts}", ".storybook/main.ts"],
    languageOptions: { globals: globals.node },
  },
]);
