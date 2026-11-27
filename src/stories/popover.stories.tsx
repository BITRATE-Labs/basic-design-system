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
  // Every story opens its popover by clicking the first button on the canvas.
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole("button")[0]);
    await findPopover();
  },
} satisfies Meta<typeof SamplePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { play: async () => {} };

export const Bottom: Story = {};
export const Top: Story = { args: { side: "top" } };
export const Right: Story = { args: { side: "right" } };
export const Left: Story = { args: { side: "left" } };
export const AlignStart: Story = { args: { align: "start" } };
export const AlignEnd: Story = { args: { align: "end" } };

export const LongText: Story = {
  args: {
    description:
      "Anyone with the link can view the sample item. Members of the sample workspace can also comment, and owners can change who has access at any time from the item's settings.",
  },
};

export const IconOnly: Story = {
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
