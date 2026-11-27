import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoldIcon, CopyIcon } from "lucide-react";
import { expect, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { expectClosed, findTooltip, hoverTooltip } from "./popup-test-utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function SampleTooltip({
  side,
  align,
  label = "Save draft",
  tip = "Saves without publishing",
}: {
  side?: Side;
  align?: Align;
  label?: string;
  tip?: string;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>{label}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          {tip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

const meta = {
  title: "Components/Tooltip",
  component: SampleTooltip,
  args: { side: "top", align: "center" },
  argTypes: {
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
  // Every story opens its tooltip by hovering the first button on the canvas.
  play: async ({ canvas, userEvent }) => {
    await hoverTooltip(userEvent, canvas.getAllByRole("button")[0]);
  },
} satisfies Meta<typeof SampleTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { play: async () => {} };

export const Top: Story = {};
export const Right: Story = { args: { side: "right" } };
export const Bottom: Story = { args: { side: "bottom" } };
export const Left: Story = { args: { side: "left" } };
export const AlignStart: Story = {
  args: { side: "bottom", align: "start", label: "A wider sample button" },
};
export const AlignEnd: Story = {
  args: { side: "bottom", align: "end", label: "A wider sample button" },
};

export const LongText: Story = {
  args: {
    tip: "Copies the sample link to the clipboard. Anyone with the link can view the item, but only members can comment on it.",
  },
};

export const WithShortcut: Story = {
  render: () => (
    <div className="flex min-h-64 items-center justify-center">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          <CopyIcon />
          Copy link
        </TooltipTrigger>
        <TooltipContent>
          Copy link <Kbd>Ctrl+L</Kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

// An icon-only button needs its own accessible name; the tooltip only describes it.
export const IconOnly: Story = {
  render: () => (
    <div className="flex min-h-64 items-center justify-center">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Bold" />}>
          <BoldIcon />
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Bold" });
    await hoverTooltip(userEvent, trigger, "Bold");
  },
};

// A disabled button gets no pointer events or focus, so it could never show a tooltip.
// focusableWhenDisabled keeps it focusable and hoverable while aria-disabled blocks
// activation, so the tooltip can say why it is disabled.
export const DisabledTrigger: Story = {
  render: () => (
    <div className="flex min-h-64 items-center justify-center">
      <Tooltip>
        <TooltipTrigger render={<Button disabled focusableWhenDisabled />}>Publish</TooltipTrigger>
        <TooltipContent>Add a title before publishing</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Publish" });
    await expect(trigger).toHaveAttribute("aria-disabled", "true");
    await hoverTooltip(userEvent, trigger, "Add a title before publishing");
  },
};

export const KeyboardFocusAndEscape: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Save draft" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tip = await findTooltip("Saves without publishing");
    await waitFor(() => expect(tip).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expectClosed("tooltip-content");
    await expect(trigger).toHaveFocus();
  },
};
