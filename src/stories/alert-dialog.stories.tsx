import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2Icon } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { openModal } from "./popup-test-utils";

function SampleAlertDialog({
  size = "default",
  media = false,
}: {
  size?: "default" | "sm";
  media?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete item</AlertDialogTrigger>
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          {media && (
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>Delete this sample item?</AlertDialogTitle>
          <AlertDialogDescription>
            The item and its drafts are removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const meta = {
  title: "Components/Alert dialog",
  component: SampleAlertDialog,
  args: { size: "default", media: false },
  argTypes: { size: { control: "select", options: ["default", "sm"] } },
} satisfies Meta<typeof SampleAlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const open: Story["play"] = async ({ canvas }) => {
  await openModal(canvas, "Delete item", "alertdialog");
};

export const Default: Story = {};

// Interaction checks below are tagged !dev and !autodocs: hidden from the sidebar and the
// docs page, still run by the story render check.
export const Small: Story = { tags: ["!dev", "!autodocs"], args: { size: "sm" }, play: open };
export const WithMedia: Story = { tags: ["!dev", "!autodocs"], args: { media: true }, play: open };
export const SmallWithMedia: Story = {
  tags: ["!dev", "!autodocs"],
  args: { size: "sm", media: true },
  play: open,
};

// Focus starts inside the popup; Escape closes it and returns focus to the trigger.
export const KeyboardOpenAndEscape: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Delete item" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("alertdialog");
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// Clicking the backdrop does not dismiss an alert dialog; the user must choose.
export const BackdropClickKeepsOpen: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    const dialog = await openModal(canvas, "Delete item", "alertdialog");
    const backdrop = document.querySelector<HTMLElement>("[data-slot=alert-dialog-overlay]")!;
    await userEvent.pointer({ keys: "[MouseLeft]", target: backdrop, coords: { x: 5, y: 5 } });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(dialog).toBeVisible();
  },
};
