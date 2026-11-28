import {
  ArgTypes,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
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

// Glass brands paint their page backdrop behind every story, as the product does, so the
// surfaces are judged over it. Flat brands ignore the attribute (Foundations / Surfaces).
const withSurfaceBackdrop: Decorator = (Story) => {
  document.body.dataset.surfaceBackdrop = "";
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
// moves things afterwards. Offline the fallback stays; the story render check reports that.
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
// tests/agent drive it (Agents (UI SDK beta) / Agent bridge).
const withAgent: Decorator = (Story) => {
  (window as { agent?: typeof agent }).agent = agent;
  return (
    <AgentProvider webmcp>
      <Story />
    </AgentProvider>
  );
};

// Every component gets a docs page: the main story, then the variants, then the props table.
// Interaction checks carry the !dev and !autodocs tags, so they stay out of the sidebar and
// off these pages; the story render check still runs them from index.json.
const DocsPage = () => (
  <>
    <Title />
    <Subtitle />
    <Description />
    <Primary />
    <Stories includePrimary={false} title="Variants" />
    <ArgTypes />
  </>
);

const preview: Preview = {
  tags: ["autodocs"],
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
    docs: { page: DocsPage },
    // Start here, Foundations in reading order, Components alphabetical, Examples, Agents,
    // and Lab last (throwaway options, src/lab/README.md). Stories inside one component keep
    // their file order, so the main story comes first. Storybook parses storySort as plain
    // JavaScript, so it takes no type annotations.
    options: {
      storySort: (a, b) => {
        const roots = [
          "Start here",
          "Foundations",
          "Components",
          "Examples",
          "Agents (UI SDK beta)",
          "Lab",
        ];
        const foundations = ["Tokens", "Surfaces", "Motion", "Layers"];
        const rank = (title) => {
          const [root, child] = title.split("/");
          const r = roots.indexOf(root);
          return [
            r < 0 ? roots.length - 1 : r,
            root === "Foundations" ? foundations.indexOf(child) : 0,
          ];
        };
        if (a.title === b.title) return 0;
        const [ra, ca] = rank(a.title);
        const [rb, cb] = rank(b.title);
        return ra - rb || ca - cb || a.title.localeCompare(b.title);
      },
    },
  },
  decorators: [
    withAgent,
    withTooltipProvider,
    withSurfaceBackdrop,
    withBrand,
    withThemeByClassName<ReactRenderer>({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
