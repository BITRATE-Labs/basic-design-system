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
} satisfies Meta<typeof SampleTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// The stories a reader sees render closed; hovering or focusing the trigger opens the tooltip.
export const Default: Story = {};

// Interaction checks below are tagged !dev and !autodocs: hidden from the sidebar and the
// docs page, still run by the story render check. Each opens its tooltip by hovering the
// first button on the canvas.
const hover: Story["play"] = async ({ canvas, userEvent }) => {
  await hoverTooltip(userEvent, canvas.getAllByRole("button")[0]);
};

export const Top: Story = { tags: ["!dev", "!autodocs"], play: hover };
export const Right: Story = { tags: ["!dev", "!autodocs"], args: { side: "right" }, play: hover };
export const Bottom: Story = {
  tags: ["!dev", "!autodocs"],
  args: { side: "bottom" },
  play: hover,
};
export const Left: Story = { tags: ["!dev", "!autodocs"], args: { side: "left" }, play: hover };
export const AlignStart: Story = {
  tags: ["!dev", "!autodocs"],
  args: { side: "bottom", align: "start", label: "A wider sample button" },
  play: hover,
};
export const AlignEnd: Story = {
  tags: ["!dev", "!autodocs"],
  args: { side: "bottom", align: "end", label: "A wider sample button" },
  play: hover,
};

export const LongText: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    tip: "Copies the sample link to the clipboard. Anyone with the link can view the item, but only members can comment on it.",
  },
  play: hover,
};

export const WithShortcut: Story = {
  tags: ["!dev", "!autodocs"],
  play: hover,
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
  tags: ["!dev", "!autodocs"],
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
  tags: ["!dev", "!autodocs"],
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
  tags: ["!dev", "!autodocs"],
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

// Closed versions of the checks above, for reading.
export const WithShortcutClosed: Story = {
  ...WithShortcut,
  name: "With shortcut",
  tags: [],
  play: undefined,
};
export const IconOnlyClosed: Story = {
  ...IconOnly,
  name: "Icon only",
  tags: [],
  play: undefined,
};
