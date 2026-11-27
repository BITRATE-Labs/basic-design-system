import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import designSystem from "./eslint/index.js";

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
  {
    files: ["scripts/**", "eslint/**", "*.config.{js,ts}", ".storybook/main.ts"],
    languageOptions: { globals: globals.node },
  },
]);
