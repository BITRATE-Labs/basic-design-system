import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { expect, screen } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { findToasts, toasterTheme } from "./popup-test-utils";

// Each story shows its toasts from a button, as a product would. They stay until dismissed
// so the open state can be reviewed.
function ShowToast({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      Show toast
    </Button>
  );
}

const meta = {
  title: "Components/Sonner",
  component: Toaster,
  decorators: [
    (Story, { globals, parameters }) => (
      <div className="min-h-96">
        <Story />
        <Toaster
          theme={toasterTheme(globals)}
          expand={parameters.expand === true}
          visibleToasts={4}
        />
      </div>
    ),
  ],
  // The sonner store is global, so clear toasts left by the previous story.
  beforeEach: () => {
    toast.dismiss();
  },
  render: () => (
    <ShowToast
      onClick={() =>
        toast("Draft saved", {
          description: "The sample item is saved but not published.",
          duration: Infinity,
        })
      }
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await findToasts();
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { play: async () => {} };

// theme/motion.css retimes the toast; sonner's own transition must not win the cascade.
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    const [shown] = await findToasts();
    // The token reads "420ms" or "0.42s" depending on the engine; compare in seconds.
    const slow = getComputedStyle(document.documentElement).getPropertyValue("--duration-slow");
    const seconds = parseFloat(slow) / (slow.trim().endsWith("ms") ? 1000 : 1);
    await expect(parseFloat(getComputedStyle(shown).transitionDuration)).toBeCloseTo(seconds, 3);
  },
};

export const Types: Story = {
  parameters: { expand: true },
  render: () => (
    <ShowToast
      onClick={() => {
        const duration = Infinity;
        toast.info("Sync paused", { duration });
        toast.warning("Storage almost full", { duration });
        toast.error("Upload failed", { duration });
        toast.success("Item published", { duration });
      }}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await findToasts(4);
  },
};

export const WithAction: Story = {
  render: () => (
    <ShowToast
      onClick={() =>
        toast("Item archived", {
          duration: Infinity,
          action: { label: "Undo", onClick: () => {} },
        })
      }
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await findToasts();
    await expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();
  },
};

export const Loading: Story = {
  render: () => (
    <ShowToast onClick={() => toast.loading("Publishing sample item", { duration: Infinity })} />
  ),
};
