import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { openModal } from "./popup-test-utils";

type Side = "top" | "right" | "bottom" | "left";

function SampleSheet({
  side = "right",
  showCloseButton,
}: {
  side?: Side;
  showCloseButton?: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
      <SheetContent side={side} showCloseButton={showCloseButton}>
        <SheetHeader>
          <SheetTitle>Sample filters</SheetTitle>
          <SheetDescription>Narrow the sample list. Changes apply when you save.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button>Save</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const meta = {
  title: "Components/Sheet",
  component: SampleSheet,
  args: { side: "right" },
  argTypes: { side: { control: "select", options: ["top", "right", "bottom", "left"] } },
} satisfies Meta<typeof SampleSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const open: Story["play"] = async ({ canvas }) => {
  await openModal(canvas, "Open sheet");
};

export const Closed: Story = {};
export const Right: Story = { play: open };
export const Left: Story = { args: { side: "left" }, play: open };
export const Top: Story = { args: { side: "top" }, play: open };
export const Bottom: Story = { args: { side: "bottom" }, play: open };
export const WithoutCloseButton: Story = { args: { showCloseButton: false }, play: open };

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button />}>Edit item</SheetTrigger>
      <SheetContent>
        <form className="flex h-full flex-col" onSubmit={(e) => e.preventDefault()}>
          <SheetHeader>
            <SheetTitle>Edit item</SheetTitle>
            <SheetDescription>Changes apply to the sample item only.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="px-4">
            <Field>
              <FieldLabel htmlFor="sheet-title">Title</FieldLabel>
              <Input id="sheet-title" defaultValue="Sample item" />
            </Field>
            <Field>
              <FieldLabel htmlFor="sheet-tag">Tag</FieldLabel>
              <Input id="sheet-tag" placeholder="example-tag" />
            </Field>
          </FieldGroup>
          <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvas }) => {
    await openModal(canvas, "Edit item");
  },
};

export const KeyboardOpenAndEscape: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open sheet" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const sheet = await screen.findByRole("dialog");
    await waitFor(() => expect(sheet).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
