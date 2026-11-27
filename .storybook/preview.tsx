import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview, ReactRenderer } from "@storybook/react-vite";
import { brands } from "../dist/tokens";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { agent, AgentProvider } from "../src/components/ui-sdk/agent";
import "../src/index.css";

// Sets data-brand on <html> so the page background follows --background too.
const withBrand: Decorator = (Story, context) => {
  document.documentElement.dataset.brand = context.globals.brand ?? "basic";
  return <Story />;
};

// Products wrap their app root in TooltipProvider once (shadcn's setup), so stories do too.
const withTooltipProvider: Decorator = (Story) => (
  <TooltipProvider>
    <Story />
  </TooltipProvider>
);

// Load the brand's fonts before the story renders: a play function that measures text
// (scrolling a tab into view, say) otherwise measures the fallback font, and the swap
// moves things afterwards. Offline the fallback stays; the visual test reports that.
const loadBrandFonts = async (brand: string) => {
  // The Google Fonts stylesheets declare the faces; fonts.load finds none before they arrive.
  await Promise.all(
    [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
      .filter((link) => !link.sheet)
      .map(
        (link) =>
          new Promise((done) => {
            link.addEventListener("load", done, { once: true });
            link.addEventListener("error", done, { once: true });
          }),
      ),
  );
  document.documentElement.dataset.brand = brand;
  const style = getComputedStyle(document.documentElement);
  await Promise.all(
    ["--font-sans", "--font-display", "--font-mono"].map((name) =>
      document.fonts.load(`1em ${style.getPropertyValue(name)}`).catch(() => []),
    ),
  );
};

// Every story has the bridge. It sees only the ui-sdk parts a story renders (stock Base UI
// components are invisible to it), and window.agent lets the browser console and
// tests/agent drive it (Docs / Agents).
const withAgent: Decorator = (Story) => {
  (window as { agent?: typeof agent }).agent = agent;
  return (
    <AgentProvider webmcp>
      <Story />
    </AgentProvider>
  );
};

const preview: Preview = {
  loaders: [({ globals }) => loadBrandFonts(globals.brand ?? "basic")],
  globalTypes: {
    brand: {
      description: "Brand",
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: brands.map((b) => ({ value: b, title: b })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { brand: "basic" },
  parameters: {
    // Lab/ holds throwaway options (src/lab/README.md), so it always sorts last.
    options: {
      storySort: { order: ["Docs", "Components", "Examples", "Layering", "*", "Lab"] },
    },
  },
  decorators: [
    withAgent,
    withTooltipProvider,
    withBrand,
    withThemeByClassName<ReactRenderer>({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
