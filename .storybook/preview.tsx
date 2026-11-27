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
