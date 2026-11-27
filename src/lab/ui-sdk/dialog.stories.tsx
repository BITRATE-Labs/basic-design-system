import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState, type ReactNode } from "react";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as Stock from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { expectCovered, expectOnTop, findPopover, hoverTooltip } from "@/stories/popup-test-utils";
import { getAgent } from "./agent";
import * as Sdk from "./dialog-sdk";

// Port trial: the stock Base UI Dialog beside the same component on UI SDK, plus the
// repository's layering cases run against both. Findings: ds-ui-sdk-port-trial.md.

const meta = {
  title: "Lab/UI SDK/Dialog",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story["play"]>;

type Lib = "stock" | "sdk";
const libs = { stock: Stock, sdk: Sdk } as const;
const trigger = { stock: "Open stock dialog", sdk: "Open UI SDK dialog" } as const;
const title = { stock: "Stock dialog", sdk: "UI SDK dialog" } as const;

function SampleDialog({ lib, children }: { lib: Lib; children?: ReactNode }) {
  const D = libs[lib];
  return (
    <D.Dialog>
      <D.DialogTrigger render={<Button variant="outline" />}>{trigger[lib]}</D.DialogTrigger>
      <D.DialogContent>
        <D.DialogHeader>
          <D.DialogTitle>{title[lib]}</D.DialogTitle>
          <D.DialogDescription>
            Archived items stay searchable. You can restore them at any time.
          </D.DialogDescription>
        </D.DialogHeader>
        {children}
        <D.DialogFooter>
          <D.DialogClose render={<Button variant="outline" />}>Cancel</D.DialogClose>
          <Button>Archive</Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
}

async function openDialog(lib: Lib) {
  (await screen.findByRole("button", { name: trigger[lib] })).click();
  const dialog = await screen.findByRole("dialog", { name: title[lib] });
  await waitFor(() => expect(dialog).toBeVisible());
  await Promise.all(dialog.getAnimations().map((a) => a.finished));
  return dialog;
}

export const StockDialog: Story = {
  render: () => <SampleDialog lib="stock" />,
  play: async () => {
    await openDialog("stock");
  },
};

export const SdkDialog: Story = {
  render: () => <SampleDialog lib="sdk" />,
  play: async () => {
    await openDialog("sdk");
  },
};

export const SideBySide: Story = {
  render: () => (
    <div className="flex gap-4">
      <SampleDialog lib="stock" />
      <SampleDialog lib="sdk" />
    </div>
  ),
};

// The stock story's keyboard play, run against each library.
const keyboard =
  (lib: Lib): Play =>
  async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: trigger[lib] });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(button).toHaveFocus());
  };

export const StockKeyboardOpenAndEscape: Story = {
  render: () => <SampleDialog lib="stock" />,
  play: keyboard("stock"),
};

export const SdkKeyboardOpenAndEscape: Story = {
  render: () => <SampleDialog lib="sdk" />,
  play: keyboard("sdk"),
};

// --- Layering: where each dialog ends up when opened from a clipping or top-layer host.

type Host = "overflow" | "transform" | "native" | "popover-attribute";

function HostBox({ host, children }: { host: Host; children: ReactNode }) {
  const native = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  if (host === "overflow") {
    return <div className="h-24 w-72 overflow-hidden rounded-md border p-2">{children}</div>;
  }
  if (host === "transform") {
    return (
      <div className="rounded-md border border-dashed p-2" style={{ transform: "translateX(8px)" }}>
        <div className="h-24 w-72 rounded-md border p-2" style={{ contain: "paint" }}>
          {children}
        </div>
      </div>
    );
  }
  const box =
    "m-auto w-80 overflow-visible rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10";
  if (host === "native") {
    return (
      <div>
        <Button onClick={() => native.current?.showModal()}>Open host</Button>
        {/* eslint-disable-next-line no-restricted-syntax -- the native top-layer case under test */}
        <dialog ref={native} aria-label="Native host" className={box}>
          {children}
        </dialog>
      </div>
    );
  }
  return (
    <div>
      <Button onClick={() => panel.current?.showPopover()}>Open host</Button>
      <div ref={panel} popover="manual" role="dialog" aria-label="Popover host" className={box}>
        {children}
      </div>
    </div>
  );
}

// Hit test at the centre and 24px inside each corner (the shared helper samples 3px in,
// which lands outside the dialog's rounded corners). True when the dialog is on top there.
function dialogOnTop(dialog: HTMLElement) {
  const r = dialog.getBoundingClientRect();
  const i = 24;
  return [
    [r.left + r.width / 2, r.top + r.height / 2],
    [r.left + i, r.top + i],
    [r.right - i, r.top + i],
    [r.left + i, r.bottom - i],
    [r.right - i, r.bottom - i],
  ].every(([x, y]) => dialog.contains(document.elementFromPoint(x, y)));
}

// Opens the host (if it is a top-layer element), then the dialog inside it, and reports
// whether the dialog is painted on top and inside the viewport.
const fromHost =
  (host: Host, lib: Lib, onTop: boolean): Play =>
  async () => {
    if (host === "native" || host === "popover-attribute") {
      (await screen.findByRole("button", { name: "Open host" })).click();
    }
    const dialog = await openDialog(lib);
    await waitFor(() => expect(dialogOnTop(dialog)).toBe(onTop));
  };

function hostStory(host: Host, lib: Lib, onTop: boolean): Story {
  return {
    render: () => (
      <HostBox host={host}>
        <SampleDialog lib={lib} />
      </HostBox>
    ),
    play: fromHost(host, lib, onTop),
  };
}

export const InOverflowHiddenStock = hostStory("overflow", "stock", true);
export const InOverflowHiddenSdk = hostStory("overflow", "sdk", true);
export const InTransformContainStock = hostStory("transform", "stock", true);
export const InTransformContainSdk = hostStory("transform", "sdk", true);
// The stock dialog portals to <body>, which paints below a top-layer host.
export const InNativeDialogStock = hostStory("native", "stock", false);
export const InNativeDialogSdk = hostStory("native", "sdk", true);
export const InPopoverAttributeStock = hostStory("popover-attribute", "stock", false);
export const InPopoverAttributeSdk = hostStory("popover-attribute", "sdk", true);

// --- Layering: stock popups opened inside each dialog.

type Kind = "tooltip" | "popover" | "menu";

function Probe({ kind, container }: { kind: Kind; container?: HTMLElement | null }) {
  if (kind === "tooltip") {
    return (
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>Hover me</TooltipTrigger>
        <TooltipContent side="bottom" container={container}>
          Sample tooltip text
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
        <DropdownMenuContent container={container} className="w-48">
          <DropdownMenuItem>Sample item one</DropdownMenuItem>
          <DropdownMenuItem>Sample item two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>Open popover</PopoverTrigger>
      <PopoverContent container={container}>
        <p>Sample popover body. It is taller than the space below the trigger.</p>
        <Button size="sm">Sample action</Button>
      </PopoverContent>
    </Popover>
  );
}

// Probe inside the dialog; with `contained`, the popup takes the dialog as its container
// and the dialog gets overflow-visible, as Docs / Layers asks for top-layer hosts.
function ProbeInDialog({ lib, kind, contained }: { lib: Lib; kind: Kind; contained: boolean }) {
  const D = libs[lib];
  const [content, setContent] = useState<HTMLElement | null>(null);
  return (
    <D.Dialog>
      <D.DialogTrigger render={<Button />}>{trigger[lib]}</D.DialogTrigger>
      <D.DialogContent ref={setContent} className={contained ? "overflow-visible" : undefined}>
        <D.DialogHeader>
          <D.DialogTitle>{title[lib]}</D.DialogTitle>
          <D.DialogDescription>
            A stock popup opened from the bottom of the dialog.
          </D.DialogDescription>
        </D.DialogHeader>
        <div>
          <Probe kind={kind} container={contained ? content : undefined} />
        </div>
      </D.DialogContent>
    </D.Dialog>
  );
}

async function openProbe(
  kind: Kind,
  user: {
    hover(el: Element): Promise<void>;
    unhover(el: Element): Promise<void>;
    click(el: Element): Promise<void>;
  },
) {
  if (kind === "tooltip") {
    return hoverTooltip(user, await screen.findByRole("button", { name: "Hover me" }));
  }
  if (kind === "menu") {
    await user.click(await screen.findByRole("button", { name: "Open menu" }));
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu).toHaveAttribute("data-open"));
    await Promise.all(menu.getAnimations().map((a) => a.finished));
    return menu;
  }
  await user.click(await screen.findByRole("button", { name: "Open popover" }));
  return findPopover(/Sample popover body/);
}

function probeStory(lib: Lib, kind: Kind, contained: boolean, onTop: boolean): Story {
  return {
    render: () => <ProbeInDialog lib={lib} kind={kind} contained={contained} />,
    play: async ({ userEvent }) => {
      const dialog = await openDialog(lib);
      const popup = await openProbe(kind, userEvent);
      if (!onTop) {
        await expectCovered(popup);
        return;
      }
      await expectOnTop(popup);
      // A popover or menu is taller than the space below its trigger, so an unclipped one
      // reaches past the dialog. The tooltip is too short to show this.
      if (kind === "tooltip") return;
      await expect(popup.getBoundingClientRect().bottom).toBeGreaterThan(
        dialog.getBoundingClientRect().bottom,
      );
    },
  };
}

// Stock dialog: popups portal to <body> at z-50 after the dialog and land on top.
export const StockDialogPopover = probeStory("stock", "popover", false, true);
// UI SDK dialog is in the top layer, so a body-portaled popup paints under it.
export const SdkDialogPopoverBodyPortal = probeStory("sdk", "popover", false, false);
export const SdkDialogTooltipBodyPortal = probeStory("sdk", "tooltip", false, false);
export const SdkDialogMenuBodyPortal = probeStory("sdk", "menu", false, false);
// The existing container rule fixes it.
export const SdkDialogPopoverContainer = probeStory("sdk", "popover", true, true);
export const SdkDialogTooltipContainer = probeStory("sdk", "tooltip", true, true);
export const SdkDialogMenuContainer = probeStory("sdk", "menu", true, true);

// --- Agent bridge: what an agent can do with each dialog on the same page. Both hold
// the stock Field and Input, which the bridge cannot see in either.

function NameField({ lib }: { lib: Lib }) {
  return (
    <Field>
      <FieldLabel htmlFor={`agent-name-${lib}`}>Display name</FieldLabel>
      <Input id={`agent-name-${lib}`} defaultValue="Sample name" />
    </Field>
  );
}

export const AgentBridge: Story = {
  render: () => (
    <div className="flex gap-4">
      <SampleDialog lib="stock">
        <NameField lib="stock" />
      </SampleDialog>
      <SampleDialog lib="sdk">
        <NameField lib="sdk" />
      </SampleDialog>
    </div>
  ),
  play: async () => {
    const agent = getAgent();
    await waitFor(() =>
      expect(agent.snapshot().some((c) => "component" in c && c.component === "dialog")).toBe(true),
    );
    const dialogs = agent.snapshot().filter((c) => "component" in c && c.component === "dialog");
    await expect(dialogs).toHaveLength(1);

    // Open the SDK dialog and close it with its Cancel part in one call.
    const sdk = await agent.act({
      steps: [
        { ref: trigger.sdk, action: "press" },
        { ref: title.sdk, action: "press", args: ["Cancel"] },
      ],
    });
    await expect(sdk.ok).toBe(true);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    const stock = await agent.act({ steps: [{ ref: trigger.stock, action: "press" }] });
    await expect(stock.ok).toBe(false);
  },
};
