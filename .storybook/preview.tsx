import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview, ReactRenderer } from "@storybook/react-vite";
import { brands } from "../dist/tokens";
import { TooltipProvider } from "../src/components/ui/tooltip";
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
    withTooltipProvider,
    withBrand,
    withThemeByClassName<ReactRenderer>({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
