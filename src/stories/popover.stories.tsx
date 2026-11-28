import type { Meta, StoryObj } from "@storybook/react-vite";
import { SlidersHorizontalIcon } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { expectClosed, findPopover } from "./popup-test-utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function SamplePopover({
  side,
  align,
  label = "Share",
  description = "Anyone with the link can view the sample item.",
}: {
  side?: Side;
  align?: Align;
  label?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>{label}</PopoverTrigger>
        <PopoverContent side={side} align={align}>
          <PopoverHeader>
            <PopoverTitle>Share link</PopoverTitle>
            <PopoverDescription>{description}</PopoverDescription>
          </PopoverHeader>
          <Button size="sm">Copy link</Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const meta = {
  title: "Components/Popover",
  component: SamplePopover,
  args: { side: "bottom", align: "center" },
  argTypes: {
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
} satisfies Meta<typeof SamplePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

// The stories a reader sees render closed; clicking the trigger opens the popover.
export const Default: Story = {};

// Interaction checks below are tagged !dev and !autodocs: hidden from the sidebar and the
// docs page, still run by the story render check. Each opens its popover by clicking the
// first button on the canvas.
const click: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getAllByRole("button")[0]);
  await findPopover();
};

export const Bottom: Story = { tags: ["!dev", "!autodocs"], play: click };
export const Top: Story = { tags: ["!dev", "!autodocs"], args: { side: "top" }, play: click };
export const Right: Story = { tags: ["!dev", "!autodocs"], args: { side: "right" }, play: click };
export const Left: Story = { tags: ["!dev", "!autodocs"], args: { side: "left" }, play: click };
export const AlignStart: Story = {
  tags: ["!dev", "!autodocs"],
  args: { align: "start" },
  play: click,
};
export const AlignEnd: Story = { tags: ["!dev", "!autodocs"], args: { align: "end" }, play: click };

export const LongText: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    description:
      "Anyone with the link can view the sample item. Members of the sample workspace can also comment, and owners can change who has access at any time from the item's settings.",
  },
  play: click,
};

export const IconOnly: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="flex min-h-96 items-center justify-center">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="icon" aria-label="Filters" />}>
          <SlidersHorizontalIcon />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Filters</PopoverTitle>
          </PopoverHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="popover-tag">Tag</FieldLabel>
              <Input id="popover-tag" placeholder="example-tag" />
            </Field>
          </FieldGroup>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await findPopover("Filters");
  },
};

export const DisabledTrigger: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="flex min-h-96 items-center justify-center">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />} disabled>
          Share
        </PopoverTrigger>
        <PopoverContent>Never shown</PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Share" })).toBeDisabled();
    await expect(screen.queryByText("Never shown")).not.toBeInTheDocument();
  },
};

export const KeyboardOpenAndEscape: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Share" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const popover = await findPopover("Share link");
    await waitFor(() => expect(popover).toBeVisible());
    await expect(popover).toHaveAccessibleName("Share link");
    await userEvent.keyboard("{Escape}");
    await expectClosed("popover-content");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// A closed version of the check above, for reading.
export const IconOnlyClosed: Story = { ...IconOnly, name: "Icon only", tags: [], play: undefined };
