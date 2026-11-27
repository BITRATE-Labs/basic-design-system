import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandDialogTrigger,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DatePicker,
  DatePickerContent,
  DatePickerGroup,
  DatePickerInput,
  DatePickerTrigger,
} from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  TokenInput,
  TokenInputEditor,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@/components/ui/token-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { expectCovered, expectOnTop, findPopover, hoverTooltip } from "./popup-test-utils";

// Each story puts a tooltip or popover trigger in a container that clips or layers its
// children, opens the popup, and checks with the browser's hit test that the popup is
// painted on top of everything and not clipped. See Docs / Layers for the rule.

type Kind = "tooltip" | "popover" | "menu";
type Side = "top" | "bottom";
type Container = RefObject<HTMLElement | null>;

const TIP = "Sample tooltip text";
const POPOVER = "Sample popover body";

function Probe({
  kind,
  side = "bottom",
  container,
}: {
  kind: Kind;
  side?: Side;
  container?: Container;
}) {
  if (kind === "tooltip") {
    return (
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>Hover me</TooltipTrigger>
        <TooltipContent side={side} container={container}>
          {TIP}
        </TooltipContent>
      </Tooltip>
    );
  }
  if (kind === "menu") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Open menu
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side} container={container} className="w-48">
          <DropdownMenuItem>Sample item one</DropdownMenuItem>
          <DropdownMenuItem>Sample item two</DropdownMenuItem>
          <DropdownMenuItem>Sample item three</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>Open popover</PopoverTrigger>
      <PopoverContent side={side} container={container}>
        <p>{POPOVER}. It is taller than the container it was opened from.</p>
        <Button size="sm">Sample action</Button>
      </PopoverContent>
    </Popover>
  );
}

// Opens the probe and checks the popup kept the side it asked for: a popup squeezed by a
// clipping ancestor flips or shifts instead, which a hit test alone would not notice.
async function openProbe(
  kind: Kind,
  user: {
    hover(el: Element): Promise<void>;
    unhover(el: Element): Promise<void>;
    click(el: Element): Promise<void>;
  },
  side: Side = "bottom",
) {
  let popup: HTMLElement;
  if (kind === "tooltip") {
    popup = await hoverTooltip(user, await screen.findByRole("button", { name: "Hover me" }), TIP);
  } else if (kind === "menu") {
    await user.click(await screen.findByRole("button", { name: "Open menu" }));
    popup = await screen.findByRole("menu");
    await waitFor(() => expect(popup).toHaveAttribute("data-open"));
    await Promise.all(popup.getAnimations().map((a) => a.finished));
  } else {
    await user.click(await screen.findByRole("button", { name: "Open popover" }));
    popup = await findPopover(new RegExp(POPOVER));
  }
  await expect(popup).toHaveAttribute("data-side", side);
  return popup;
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm text-muted-foreground">{children}</p>;
}

// A fixed-size box whose bottom edge the trigger sits on, so a bottom popup must leave it.
function EdgeBox({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex h-24 w-72 items-end rounded-md border p-2 ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

function OverflowHidden({ kind }: { kind: Kind }) {
  return (
    <div>
      <Caption>Trigger at the edge of an overflow: hidden container.</Caption>
      <EdgeBox className="overflow-hidden">
        <Probe kind={kind} />
      </EdgeBox>
    </div>
  );
}

function ScrollContainer({ kind }: { kind: Kind }) {
  return (
    <div className="pt-40">
      <Caption>Trigger inside a scrolling container.</Caption>
      <div data-testid="scroller" className="h-40 w-72 overflow-y-auto rounded-md border p-2">
        {Array.from({ length: 4 }, (_, i) => (
          <p key={`a${i}`} className="mb-2 text-sm">
            Sample line {i + 1} above the trigger.
          </p>
        ))}
        <Probe kind={kind} side="top" />
        {Array.from({ length: 8 }, (_, i) => (
          <p key={`b${i}`} className="mt-2 text-sm">
            Sample line {i + 1} below the trigger.
          </p>
        ))}
      </div>
    </div>
  );
}

// Inline z-index values stand in for a product's own stacking; they are the hazard
// under test, not a pattern to copy.
function StackingContext({ kind }: { kind: Kind }) {
  return (
    <div className="relative">
      <Caption>
        Trigger in a z-index: 1 stacking context; the sibling below has z-index: 9999.
      </Caption>
      <EdgeBox className="relative bg-card" style={{ zIndex: 1 }}>
        <Probe kind={kind} />
      </EdgeBox>
      <div
        className="absolute left-0 flex h-40 w-96 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground"
        style={{ zIndex: 9999 }}
      >
        Sibling with z-index: 9999
      </div>
    </div>
  );
}

function TransformAndContain({ kind }: { kind: Kind }) {
  return (
    <div>
      <Caption>Trigger inside a transformed ancestor that holds a contain: paint box.</Caption>
      <div
        className="rounded-md border border-dashed p-2"
        style={{ transform: "translateX(8px) scale(1)" }}
      >
        <EdgeBox style={{ contain: "paint" }}>
          <Probe kind={kind} />
        </EdgeBox>
      </div>
    </div>
  );
}

function InsideDialog({ kind }: { kind: Kind }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sample dialog</DialogTitle>
          <DialogDescription>
            The shared Dialog. Popups opened inside it render above it.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Probe kind={kind} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// A native modal <dialog> sits in the browser's top layer, above every z-index.
function NativeDialog({ kind, useContainer }: { kind: Kind; useContainer: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <div>
      <Button onClick={() => ref.current?.showModal()}>Open native dialog</Button>
      {/* eslint-disable-next-line no-restricted-syntax -- the native top-layer case under test */}
      <dialog
        ref={ref}
        className="m-auto w-80 overflow-visible rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 backdrop:bg-foreground/10"
      >
        <p className="mb-3 text-sm font-medium">Native modal dialog</p>
        <p className="mb-3 text-sm text-muted-foreground">
          {useContainer ? "Popups portal into this dialog." : "Popups portal into the body."}
        </p>
        <Probe kind={kind} container={useContainer ? ref : undefined} />
      </dialog>
    </div>
  );
}

// An element shown with the popover attribute is in the top layer too, and its UA style
// sets overflow: auto, so without overflow-visible the host scrolls instead of letting the
// popup out.
function PopoverAttribute({ kind }: { kind: Kind }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <Button onClick={() => ref.current?.showPopover()}>Open top-layer panel</Button>
      <div
        ref={ref}
        popover="manual"
        role="dialog"
        aria-label="Top-layer panel"
        className="m-auto w-80 overflow-visible rounded-xl border-0 bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10"
      >
        <p className="mb-3 text-sm font-medium">Element with the popover attribute</p>
        <p className="mb-3 text-sm text-muted-foreground">Popups portal into this element.</p>
        <Probe kind={kind} container={ref} />
      </div>
    </div>
  );
}

// A third-party overlay portaled to <body>, outside the app root's `isolate`. Below
// z-index 50 it stays under the shared popups (Docs / Layers, rule 1).
function BodyOverlay({ kind }: { kind: Kind }) {
  return (
    <div>
      <Caption>An overlay portaled to the body with z-index: 49 covers the lower page.</Caption>
      <Probe kind={kind} />
      {createPortal(
        <div
          className="fixed inset-x-0 top-28 bottom-0 flex items-center justify-center bg-muted text-sm text-muted-foreground"
          style={{ zIndex: 49 }}
        >
          Sample body-level overlay, z-index: 49
        </div>,
        document.body,
      )}
    </div>
  );
}

const meta = {
  title: "Layering",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story["play"]>;

const onTop =
  (kind: Kind): Play =>
  async ({ userEvent }) => {
    await expectOnTop(await openProbe(kind, userEvent));
  };

export const OverflowHiddenTooltip: Story = {
  render: () => <OverflowHidden kind="tooltip" />,
  play: onTop("tooltip"),
};
export const OverflowHiddenPopover: Story = {
  render: () => <OverflowHidden kind="popover" />,
  play: onTop("popover"),
};

const scrolled =
  (kind: Kind): Play =>
  async ({ canvas, userEvent }) => {
    const scroller = canvas.getByTestId("scroller");
    scroller.scrollTop = 72;
    const popup = await openProbe(kind, userEvent, "top");
    await expectOnTop(popup);
    // The popup follows its trigger when the container scrolls.
    const trigger = canvas.getAllByRole("button")[0];
    const gap = () => trigger.getBoundingClientRect().top - popup.getBoundingClientRect().top;
    const before = gap();
    scroller.scrollTop = 48;
    await waitFor(() => expect(Math.abs(gap() - before)).toBeLessThan(1));
    await expectOnTop(popup);
  };

export const ScrollContainerTooltip: Story = {
  render: () => <ScrollContainer kind="tooltip" />,
  play: scrolled("tooltip"),
};
export const ScrollContainerPopover: Story = {
  render: () => <ScrollContainer kind="popover" />,
  play: scrolled("popover"),
};

export const StackingContextTooltip: Story = {
  render: () => <StackingContext kind="tooltip" />,
  play: onTop("tooltip"),
};
export const StackingContextPopover: Story = {
  render: () => <StackingContext kind="popover" />,
  play: onTop("popover"),
};

export const TransformAndContainTooltip: Story = {
  render: () => <TransformAndContain kind="tooltip" />,
  play: onTop("tooltip"),
};
export const TransformAndContainPopover: Story = {
  render: () => <TransformAndContain kind="popover" />,
  play: onTop("popover"),
};

const inDialog =
  (kind: Kind, open: string): Play =>
  async (context) => {
    await context.userEvent.click(context.canvas.getByRole("button", { name: open }));
    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    const popup = await openProbe(kind, context.userEvent);
    await expectOnTop(popup);
    // The trigger sits at the dialog's bottom, so an unclipped popup reaches past it.
    await expect(popup.getBoundingClientRect().bottom).toBeGreaterThan(
      dialog.getBoundingClientRect().bottom,
    );
  };

export const DialogTooltip: Story = {
  render: () => <InsideDialog kind="tooltip" />,
  play: inDialog("tooltip", "Open dialog"),
};
export const DialogPopover: Story = {
  render: () => <InsideDialog kind="popover" />,
  play: inDialog("popover", "Open dialog"),
};

export const NativeDialogTooltip: Story = {
  render: () => <NativeDialog kind="tooltip" useContainer />,
  play: inDialog("tooltip", "Open native dialog"),
};
export const NativeDialogPopover: Story = {
  render: () => <NativeDialog kind="popover" useContainer />,
  play: inDialog("popover", "Open native dialog"),
};
export const NativeDialogDropdownMenu: Story = {
  render: () => <NativeDialog kind="menu" useContainer />,
  play: inDialog("menu", "Open native dialog"),
};

// Without `container`, the popup portals into the body, which paints below the top layer.
// This pins down why the rule exists: if it starts passing, Base UI handles the top layer
// itself and the `container` rule can go.
const coveredInNativeDialog =
  (kind: Kind): Play =>
  async (context) => {
    await context.userEvent.click(
      context.canvas.getByRole("button", { name: "Open native dialog" }),
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    const popup = await openProbe(kind, context.userEvent);
    await expectCovered(popup);
  };

export const NativeDialogBodyPortalTooltip: Story = {
  render: () => <NativeDialog kind="tooltip" useContainer={false} />,
  play: coveredInNativeDialog("tooltip"),
};
export const NativeDialogBodyPortalPopover: Story = {
  render: () => <NativeDialog kind="popover" useContainer={false} />,
  play: coveredInNativeDialog("popover"),
};

export const PopoverAttributePopover: Story = {
  render: () => <PopoverAttribute kind="popover" />,
  play: inDialog("popover", "Open top-layer panel"),
};

export const BodyOverlayPopover: Story = {
  render: () => <BodyOverlay kind="popover" />,
  play: onTop("popover"),
};

// UI SDK popups inside the shared Dialog. UI SDK closes its popup on Escape but lets the key
// bubble, and Base UI's Dialog closes on any Escape that reaches it, so the date picker and
// command palette wrappers stop the Escape their content used. One press closes only the
// popup; the dialog stays open.
function SdkInDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sample dialog</DialogTitle>
          <DialogDescription>The shared Dialog with a UI SDK popup inside.</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

const escapeClosesOnlyPopup =
  (openPopup: (user: Parameters<Play>[0]["userEvent"]) => Promise<HTMLElement>): Play =>
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = await screen.findByRole("dialog", { name: "Sample dialog" });
    await waitFor(() => expect(dialog).toBeVisible());
    const popup = await openPopup(userEvent);
    await waitFor(() => expect(popup).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(screen.getByRole("dialog", { name: "Sample dialog" })).toBeVisible();
  };

export const DialogDatePickerEscape: Story = {
  render: () => (
    <SdkInDialog>
      <DatePicker today="2026-10-14" locale="en-US">
        <DatePickerGroup>
          <DatePickerInput aria-label="Due date" placeholder="MM/DD/YYYY" />
          <DatePickerTrigger aria-label="Choose date" />
        </DatePickerGroup>
        <DatePickerContent />
      </DatePicker>
    </SdkInDialog>
  ),
  play: escapeClosesOnlyPopup(async (user) => {
    await user.click(screen.getByRole("button", { name: "Choose date" }));
    return screen.findByRole("grid");
  }),
};

// Known gap, pinned: the trigger menu leaves Escape to a document listener, which runs after
// Base UI's Dialog has already closed on the same key, so a wrapper cannot stop it without
// also stopping UI SDK. One Escape closes the menu and the dialog. Keep TokenInput out of
// the shared Dialog until this story fails (then turn it into an escapeClosesOnlyPopup check).
export const DialogTokenInputEscapeKnownGap: Story = {
  render: () => (
    <SdkInDialog>
      <TokenInput>
        <TokenInputEditor aria-label="Message" placeholder="Type @ to mention" />
        <TriggerMenu
          triggers={[
            { char: "@", type: "mention", items: [{ value: "sample-a", label: "Sample User A" }] },
          ]}
        >
          <TriggerMenuContent>
            <TriggerMenuList>
              {(state) =>
                (state.items as { value: string; label: string }[]).map((item) => (
                  <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                    {item.label}
                  </TriggerMenuItem>
                ))
              }
            </TriggerMenuList>
          </TriggerMenuContent>
        </TriggerMenu>
      </TokenInput>
    </SdkInDialog>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Sample dialog" })).toBeVisible(),
    );
    await userEvent.click(screen.getByRole("textbox", { name: "Message" }));
    await userEvent.keyboard("@Sam");
    await waitFor(() => expect(screen.getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Sample dialog" })).not.toBeInTheDocument(),
    );
  },
};

export const DialogCommandPaletteEscape: Story = {
  render: () => (
    <SdkInDialog>
      <CommandDialog trigger={<CommandDialogTrigger>Search commands</CommandDialogTrigger>}>
        <Command>
          <CommandInput aria-label="Search commands" placeholder="Type a command" />
          <CommandList>
            <CommandItem value="new-note">New sample note</CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>
    </SdkInDialog>
  ),
  play: escapeClosesOnlyPopup(async (user) => {
    await user.click(screen.getByRole("button", { name: "Search commands" }));
    return screen.findByRole("dialog", { name: "Command palette" });
  }),
};
