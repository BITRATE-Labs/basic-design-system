import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";
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
import { Textarea } from "@/components/ui/textarea";
import { useDirtyDismiss } from "@/hooks/use-dirty-dismiss";
import { openModal } from "./popup-test-utils";

const meta = {
  title: "Components/Unsaved changes",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const MESSAGE = "You have unsaved changes. Save them, or use Cancel to discard them.";

function Fields({ id }: { id: string }) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>
        <Input id={`${id}-title`} defaultValue="Sample item" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-notes`}>Notes</FieldLabel>
        <Textarea id={`${id}-notes`} placeholder="Placeholder notes" />
      </Field>
    </FieldGroup>
  );
}

function EditDialog() {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { onOpenChange, popup, announcement } = useDirtyDismiss({
    dirty,
    onOpenChange: (next) => {
      setOpen(next);
      if (next) setDirty(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>Edit item</DialogTrigger>
      <DialogContent ref={popup}>
        <form
          className="grid gap-4"
          onChange={() => setDirty(true)}
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit sample item</DialogTitle>
            <DialogDescription>
              Type something, then press Escape or click outside.
            </DialogDescription>
          </DialogHeader>
          <Fields id="dialog" />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
        {announcement}
      </DialogContent>
    </Dialog>
  );
}

function EditSheet() {
  const [dirty, setDirty] = useState(false);
  const { onOpenChange, popup, announcement } = useDirtyDismiss({
    dirty,
    onOpenChange: (next) => next && setDirty(false),
  });
  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger render={<Button variant="outline" />}>Edit item</SheetTrigger>
      <SheetContent ref={popup}>
        <form
          className="flex flex-1 flex-col gap-4"
          onChange={() => setDirty(true)}
          onSubmit={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>Edit sample item</SheetTitle>
            <SheetDescription>Type something, then press Escape or click outside.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Fields id="sheet" />
          </div>
          <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          </SheetFooter>
        </form>
        {announcement}
      </SheetContent>
    </Sheet>
  );
}

// A native modal <dialog> has no onOpenChange: its cancel event (Escape) calls the nudge.
// Browsers honour preventDefault on cancel only after a user activation, such as typing,
// so a second Escape with nothing typed in between always closes it.
function NativeEditDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [dirty, setDirty] = useState(false);
  const { popup, nudge, announcement } = useDirtyDismiss({ dirty });
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setDirty(false);
          ref.current?.showModal();
        }}
      >
        Edit item
      </Button>
      {/* eslint-disable-next-line no-restricted-syntax -- the native top-layer case under test */}
      <dialog
        ref={(el) => {
          ref.current = el;
          popup(el);
        }}
        aria-labelledby="native-heading"
        className="m-auto w-full max-w-sm rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 backdrop:bg-foreground/10"
        onCancel={(e) => {
          if (!dirty) return;
          e.preventDefault();
          nudge();
        }}
      >
        <form method="dialog" className="grid gap-4" onChange={() => setDirty(true)}>
          <h2 id="native-heading" className="text-base leading-none font-medium">
            Edit sample item
          </h2>
          <Fields id="native" />
          <div data-slot="dialog-footer" className="flex justify-end gap-2 rounded-lg">
            <Button variant="outline" value="cancel" type="submit" formNoValidate>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
        {announcement}
      </dialog>
    </>
  );
}

// The in-app reduced-motion setting, on <html> because the popup portals to <body>.
function ReducedMotion({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.motion = "reduce";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, []);
  return children;
}

const status = () => document.querySelector("[data-slot=dirty-dismiss-status]");

async function openDirty(name = "Edit item", text = " (edited)") {
  const popup = await openModal(screen, name);
  await userEvent.type(screen.getByLabelText("Title"), text);
  return popup;
}

// Focus stays inside the popup after the nudge. user-event's Tab does not follow Base UI's
// focus guards, so the real-keyboard Tab check is tests/agent/dirty-dismiss.agent.ts.
async function expectFocusInside(popup: HTMLElement) {
  await expect(popup.contains(document.activeElement)).toBe(true);
}

async function expectNudged(popup: HTMLElement) {
  await expect(popup).toHaveAttribute(popup instanceof HTMLDialogElement ? "open" : "data-open");
  await waitFor(() => expect(status()).toHaveTextContent(MESSAGE));
  await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
}

const finished = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

export const EscapeWhileDirty: Story = {
  render: () => <EditDialog />,
  play: async () => {
    const popup = await openDirty();
    await userEvent.keyboard("{Escape}");
    await expect(popup).toHaveAttribute("data-dirty-dismiss", "shake");
    await expectNudged(popup);
    await finished(popup);
    await expect(popup).not.toHaveAttribute("data-dirty-dismiss");
    await expectFocusInside(popup);
  },
};

export const OutsidePressWhileDirty: Story = {
  render: () => <EditDialog />,
  play: async () => {
    const popup = await openDirty();
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=dialog-overlay]")!);
    await expectNudged(popup);
    await finished(popup);
    await expectFocusInside(popup);
  },
};

export const CleanDialogCloses: Story = {
  render: () => <EditDialog />,
  play: async () => {
    await openModal(screen, "Edit item");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await openModal(screen, "Edit item");
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=dialog-overlay]")!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const ExplicitDiscardCloses: Story = {
  render: () => <EditDialog />,
  play: async () => {
    await openDirty();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await openDirty();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const ReducedMotionOutline: Story = {
  render: () => (
    <ReducedMotion>
      <EditDialog />
    </ReducedMotion>
  ),
  play: async () => {
    const popup = await openDirty();
    await userEvent.keyboard("{Escape}");
    const footer = popup.querySelector("[data-slot=dialog-footer]")!;
    await expect(footer).toHaveAttribute("data-dirty-dismiss", "ring");
    await expect(popup).not.toHaveAttribute("data-dirty-dismiss");
    await expectNudged(popup);
    await waitFor(() => expect(footer).not.toHaveAttribute("data-dirty-dismiss"), {
      timeout: 2000,
    });
  },
};

export const OnASheet: Story = {
  render: () => <EditSheet />,
  play: async () => {
    const popup = await openDirty();
    await userEvent.keyboard("{Escape}");
    await expect(popup).toHaveAttribute("data-dirty-dismiss", "shake");
    await waitFor(() => expect(status()).toHaveTextContent(MESSAGE));
    await waitFor(() => expect(screen.getByRole("button", { name: "Save changes" })).toHaveFocus());
    await finished(popup);
    await expectFocusInside(popup);
  },
};

export const NativeDialog: Story = {
  render: () => <NativeEditDialog />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit item" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(screen.getByLabelText("Title"), " (edited)");
    // user-event does not fire the browser's cancel on Escape, so dispatch it as the browser
    // would.
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    await expect(dialog).toHaveAttribute("data-dirty-dismiss", "shake");
    await expectNudged(dialog);
    await finished(dialog);
  },
};
