import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { openModal } from "./popup-test-utils";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this item?</DialogTitle>
          <DialogDescription>
            Archived items stay searchable. You can restore them at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Archive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Closed: Story = { render: () => <BasicDialog /> };

export const Open: Story = {
  render: () => <BasicDialog />,
  play: async ({ canvas }) => {
    await openModal(canvas, "Open dialog");
  },
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit details</DialogTrigger>
      <DialogContent>
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit details</DialogTitle>
            <DialogDescription>Changes apply to the sample item only.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dialog-title">Title</FieldLabel>
              <Input id="dialog-title" defaultValue="Sample item" />
            </Field>
            <Field>
              <FieldLabel htmlFor="dialog-tag">Tag</FieldLabel>
              <Input id="dialog-tag" placeholder="example-tag" />
              <FieldDescription>Lowercase letters and dashes.</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas }) => {
    await openModal(canvas, "Edit details");
  },
};

const paragraphs = Array.from(
  { length: 12 },
  (_, i) =>
    `Section ${i + 1}. Placeholder terms for a sample service. This text exists only to make the dialog body taller than the screen, so the scrolling behaviour can be checked.`,
);

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sample terms</DialogTitle>
          <DialogDescription>Scroll to read every section.</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 max-h-80 overflow-y-auto px-4">
          {paragraphs.map((p) => (
            <p key={p} className="mb-3 leading-normal">
              {p}
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose render={<Button />}>Accept</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas }) => {
    await openModal(canvas, "Open dialog");
  },
};

export const KeyboardOpenAndEscape: Story = {
  render: () => <BasicDialog />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open dialog" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
