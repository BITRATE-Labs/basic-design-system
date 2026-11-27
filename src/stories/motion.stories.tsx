import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { scales } from "../../dist/tokens";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SlidingTabsList, SlidingTabsTrigger } from "@/components/ui/sliding-tabs";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Every animated shared component, one row each: stock shadcn's timing ("before", for
// reference only) beside the system's (theme/motion.css reading the motion tokens). Each row
// plays one column at a time or both together. The theme retimes every instance, so the
// before column sets stock's values inline; its surfaces are the brand's, since only the
// timing is compared here.

const meta = {
  title: "Foundations/Motion",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SLOW = 5;
// How long Play holds a popup open once it has entered, before slow motion.
const HOLD_MS = 900;

type Settings = { slow: boolean; reduce: boolean };
type TokenDuration = "fast" | "base" | "slow" | "indicator";
type TokenEase = "standard" | "emphasized" | "indicator";
type Stock = { ms: number; ease: string };
type Row = {
  id: string;
  label: string;
  // Stock's timing, or what stock does instead.
  before: Stock | string;
  // The tokens the system uses, in then out (out is the same as in when absent), or a
  // description.
  after: { in: [TokenDuration, TokenEase]; out?: [TokenDuration, TokenEase] } | string;
  render: (props: CellProps) => ReactNode;
  onPlay?: () => void;
};
// held: Play is running, so the popup stays open whatever it is asked. pin: where a fixed
// dialog or sheet sits during this Play (over its own cell).
type CellProps = {
  side: "before" | "after";
  play: number;
  held: boolean;
  pin?: DOMRect;
  settings: Settings;
  row: Row;
};

const ms = (value: string) => parseFloat(value);
const slowBy = ({ slow }: Settings) => (slow ? SLOW : 1);
// Stock ignores reduced motion; the tokens collapse to 1ms.
const afterMs = (d: TokenDuration, s: Settings) =>
  s.reduce ? 1 : ms(scales[`--duration-${d}`]) * slowBy(s);

function enterMs(row: Row, side: CellProps["side"], s: Settings) {
  if (side === "before") return typeof row.before === "string" ? 0 : row.before.ms * slowBy(s);
  if (row.id === "arrival") return s.reduce ? 0 : ARRIVAL_MS * slowBy(s);
  return typeof row.after === "string" ? 0 : afterMs(row.after.in[0], s);
}

// Inline stock timing for the before column: tw-animate popups read these two variables.
function stockAnimation({ row, side, settings }: CellProps): CSSProperties | undefined {
  if (side === "after" || typeof row.before === "string") return undefined;
  return {
    "--tw-animation-duration": `${row.before.ms * slowBy(settings)}ms`,
    "--tw-ease": row.before.ease,
  } as CSSProperties;
}

// Each cell's popup has its own open state, so a click opens only that one. While Play holds
// the row, both columns stay open even when the other column's popup takes focus.
function useOpen(held: boolean) {
  const [open, setOpen] = useState(false);
  return { open: held || open, onOpenChange: setOpen };
}

function MenuCell(props: CellProps) {
  return (
    <DropdownMenu {...useOpen(props.held)} modal={false}>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-demo={`menu-${props.side}`}
        align="start"
        className="w-44"
        style={stockAnimation(props)}
      >
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Move to folder</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PopoverCell(props: CellProps) {
  return (
    <Popover {...useOpen(props.held)}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>Popover</PopoverTrigger>
      <PopoverContent
        data-demo={`popover-${props.side}`}
        align="start"
        className="w-56"
        style={stockAnimation(props)}
      >
        <PopoverHeader>
          <PopoverTitle>Sharing</PopoverTitle>
          <PopoverDescription>Anyone with the link can view.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

function TooltipCell(props: CellProps) {
  return (
    <Tooltip {...useOpen(props.held)}>
      <TooltipTrigger render={<Button variant="outline" size="sm" />}>Tooltip</TooltipTrigger>
      <TooltipContent
        data-demo={`tooltip-${props.side}`}
        side="right"
        style={stockAnimation(props)}
      >
        Sample hint
      </TooltipContent>
    </Tooltip>
  );
}

function DialogCell(props: CellProps) {
  const { pin, side } = props;
  const style: CSSProperties = {
    ...stockAnimation(props),
    ...(pin && { top: pin.top + pin.height / 2, left: pin.left + pin.width / 2, width: pin.width }),
  };
  return (
    <div data-pin={`dialog-${side}`} className="h-40 w-full rounded-lg border border-dashed">
      <Dialog {...useOpen(props.held)} modal={false}>
        <DialogContent data-demo={`dialog-${side}`} initialFocus={false} style={style}>
          <DialogHeader>
            <DialogTitle>Archive sample project?</DialogTitle>
            <DialogDescription>Archived items stay searchable.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SheetCell(props: CellProps) {
  const { pin, row, side, settings } = props;
  // The sheet is a CSS transition, not tw-animate.
  const stock =
    side === "before" && typeof row.before !== "string"
      ? {
          transitionDuration: `${row.before.ms * slowBy(settings)}ms`,
          transitionTimingFunction: row.before.ease,
        }
      : {};
  const style: CSSProperties = {
    ...stock,
    ...(pin && {
      top: pin.top,
      left: pin.left,
      width: pin.width,
      height: pin.height,
      right: "auto",
      bottom: "auto",
    }),
  };
  return (
    <div data-pin={`sheet-${side}`} className="h-40 w-full rounded-lg border border-dashed">
      <Sheet {...useOpen(props.held)} modal={false}>
        <SheetContent
          data-demo={`sheet-${side}`}
          initialFocus={false}
          showCloseButton={false}
          style={style}
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the sample list by status.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Play remounts the section, so the entrance runs again. Stock has no entrance.
function SectionCell({ side, play }: CellProps) {
  const after = side === "after";
  return (
    <section key={play} className={after ? "motion-enter w-full" : "w-full"}>
      <div className="grid gap-2 sm:grid-cols-2">
        {["One", "Two", "Three", "Four"].map((n, i) => (
          <Card key={n} size="sm" className={after ? `motion-enter motion-delay-${i + 1}` : ""}>
            <CardHeader>
              <CardTitle>Item {n.toLowerCase()}</CardTitle>
              <CardDescription>Placeholder</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

const tabs = ["Overview", "Activity", "Files"];

// Play moves the selection between the first and last tab; clicking a tab works as usual.
function TabsCell({ side, play, settings }: CellProps) {
  const [state, setState] = useState({ play, value: tabs[0] });
  if (state.play !== play) setState({ play, value: tabs[play % 2 ? 2 : 0] });
  const onValueChange = (value: unknown) => setState({ play, value: value as string });
  return (
    <Tabs value={state.value} onValueChange={onValueChange} className="max-w-full">
      {side === "before" ? (
        // Stock's fade uses Tailwind's default transition duration, so slow motion scales it.
        <TabsList
          variant="line"
          className="max-w-full justify-start overflow-x-auto"
          style={
            { "--default-transition-duration": `${150 * slowBy(settings)}ms` } as CSSProperties
          }
        >
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : (
        <SlidingTabsList>
          {tabs.map((t) => (
            <SlidingTabsTrigger key={t} value={t}>
              {t}
            </SlidingTabsTrigger>
          ))}
        </SlidingTabsList>
      )}
    </Tabs>
  );
}

const ARRIVAL_ID = "motion-arrival-target";
const ARRIVAL_MS = 520;

// Only one element can be :target, and stock has no highlight, so only the after column's
// reply carries the id.
function ArrivalCell({ side, play, settings }: CellProps) {
  const after = side === "after";
  // The duration is taken when Play runs: changing it on a finished animation replays it.
  const slowNow = settings.slow && !settings.reduce;
  const [timing, setTiming] = useState({ play, slow: slowNow });
  if (timing.play !== play) setTiming({ play, slow: slowNow });
  useEffect(
    () => () => {
      if (after && window.location.hash) window.location.hash = "";
    },
    [after],
  );
  const slow = timing.slow;
  return (
    <div className="flex w-full flex-col gap-1 rounded-lg border p-1">
      <p className="p-2 text-sm">Placeholder reply one.</p>
      <article
        id={after ? ARRIVAL_ID : undefined}
        className={after ? "motion-arrival rounded-md p-2" : "rounded-md p-2"}
        style={slow ? { animationDuration: `${ARRIVAL_MS * SLOW}ms` } : undefined}
      >
        <p className="text-sm">Placeholder reply two. A deep link points here.</p>
      </article>
    </div>
  );
}

const rows: Row[] = [
  {
    id: "menu",
    label: "Menu",
    before: { ms: 100, ease: "ease" },
    after: { in: ["fast", "standard"] },
    render: (p) => <MenuCell {...p} />,
  },
  {
    id: "popover",
    label: "Popover",
    before: { ms: 100, ease: "ease" },
    after: { in: ["fast", "standard"] },
    render: (p) => <PopoverCell {...p} />,
  },
  {
    id: "tooltip",
    label: "Tooltip",
    before: { ms: 150, ease: "ease" },
    after: { in: ["fast", "standard"] },
    render: (p) => <TooltipCell {...p} />,
  },
  {
    id: "dialog",
    label: "Dialog",
    before: { ms: 100, ease: "ease" },
    after: { in: ["base", "emphasized"], out: ["fast", "standard"] },
    render: (p) => <DialogCell {...p} />,
  },
  {
    id: "sheet",
    label: "Sheet",
    before: { ms: 200, ease: "ease-in-out" },
    after: { in: ["slow", "emphasized"], out: ["base", "standard"] },
    render: (p) => <SheetCell {...p} />,
  },
  {
    id: "section",
    label: "Section entrance",
    before: "None: the section appears at once.",
    after: { in: ["slow", "emphasized"] },
    render: (p) => <SectionCell {...p} />,
  },
  {
    id: "tabs",
    label: "Sliding tab move",
    before: "Stock line tabs: the underline swaps in place with a 150ms fade.",
    after: { in: ["indicator", "indicator"] },
    render: (p) => <TabsCell {...p} />,
  },
  {
    id: "arrival",
    label: "Arrival highlight",
    before: "None: the linked item only scrolls into view.",
    after:
      "cubic-bezier(0.18, 0.75, 0.28, 1): rises 18px from 25% opacity while a 22% primary tint fades to an 8% resting tint.",
    render: (p) => <ArrivalCell {...p} />,
    // :target changes only on a real hash change, so clear it first.
    onPlay: () => {
      window.location.hash = "";
      requestAnimationFrame(() => (window.location.hash = ARRIVAL_ID));
    },
  },
];

function readout(row: Row, side: CellProps["side"], s: Settings) {
  if (side === "before")
    return typeof row.before === "string"
      ? row.before
      : `In and out: ${row.before.ms * slowBy(s)}ms ${row.before.ease}. No reduced-motion path.`;
  if (typeof row.after === "string")
    return s.reduce
      ? "Reduced motion: the resting tint, no animation."
      : `${ARRIVAL_MS * slowBy(s)}ms ${row.after}`;
  const phase = ([d, e]: [TokenDuration, TokenEase]) =>
    `${afterMs(d, s)}ms ${scales[`--ease-${e}`]} (--duration-${d}, --ease-${e})`;
  const { in: enter, out } = row.after;
  if (row.id === "section") {
    const rise = s.reduce ? 0 : ms(scales["--motion-rise-distance"]);
    const step = s.reduce ? 0 : ms(scales["--motion-delay-step"]) * slowBy(s);
    return `${phase(enter)}; ${rise}px rise; children ${step}ms apart.`;
  }
  return out ? `In: ${phase(enter)}. Out: ${phase(out)}.` : `In and out: ${phase(enter)}.`;
}

const motionVars = [
  "--duration-fast",
  "--duration-base",
  "--duration-slow",
  "--duration-indicator",
  "--motion-delay-step",
] as const;

function MotionPage() {
  const [settings, setSettings] = useState<Settings>({ slow: false, reduce: false });
  const [plays, setPlays] = useState<Record<string, number>>({});
  const [held, setHeld] = useState<Record<string, boolean>>({});
  const [pins, setPins] = useState<Record<string, DOMRect>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  // The after column reads the tokens, so the toggles change them on <html>: slow motion
  // multiplies them, and reduced motion uses the shipped data-motion="reduce" collapse.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.reduce) root.dataset.motion = "reduce";
    else if (settings.slow)
      for (const name of motionVars) root.style.setProperty(name, `${ms(scales[name]) * SLOW}ms`);
    return () => {
      delete root.dataset.motion;
      for (const name of motionVars) root.style.removeProperty(name);
    };
  }, [settings]);

  const play = (row: Row, sides: CellProps["side"][]) => {
    setPins(
      Object.fromEntries(
        [...document.querySelectorAll<HTMLElement>("[data-pin]")].map((el) => [
          el.dataset.pin!,
          el.getBoundingClientRect(),
        ]),
      ),
    );
    for (const side of sides) {
      const key = `${row.id}-${side}`;
      setPlays((p) => ({ ...p, [key]: (p[key] ?? 0) + 1 }));
      setHeld((h) => ({ ...h, [key]: true }));
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(
        () => setHeld((h) => ({ ...h, [key]: false })),
        enterMs(row, side, settings) + HOLD_MS * slowBy(settings),
      );
    }
    if (sides.includes("after")) row.onPlay?.();
  };
  const toggle = (key: keyof Settings) => (value: boolean) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      {/* Two dialogs and two sheets open side by side, so their full-page overlays are hidden
          on this page. Each overlay uses the same timing as its dialog or sheet. */}
      <style>{`[data-slot="dialog-overlay"], [data-slot="sheet-overlay"] { display: none; }`}</style>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="motion-slow" checked={settings.slow} onCheckedChange={toggle("slow")} />
          <Label htmlFor="motion-slow">{`Slow motion ×${SLOW}`}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="motion-reduce" checked={settings.reduce} onCheckedChange={toggle("reduce")} />
          <Label htmlFor="motion-reduce">Reduced motion</Label>
        </div>
      </div>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Before and After play one column; Both plays the row in both columns at once. Popups open,
        hold, then close, and each trigger also opens its own popup. Reduced motion applies the
        system&apos;s collapse (every duration 1ms, no rise, no stagger). Stock has no
        reduced-motion path, so the before column keeps moving.
      </p>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1fr)] items-start gap-x-3 gap-y-8 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-6">
        <span />
        <h3 className="text-sm font-medium text-muted-foreground">
          Before: stock shadcn timing, for reference
        </h3>
        <h3 className="text-sm font-medium">After: the system</h3>
        {rows.map((row) => (
          <div key={row.id} className="contents">
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm font-medium">{row.label}</span>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["Before", ["before"]],
                    ["After", ["after"]],
                    ["Both", ["before", "after"]],
                  ] as const
                ).map(([name, sides]) => (
                  <Button
                    key={name}
                    size="xs"
                    variant={name === "Both" ? "default" : "outline"}
                    aria-label={`Play ${row.label.toLowerCase()} ${name.toLowerCase()}`}
                    onClick={() => play(row, [...sides])}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
            {(["before", "after"] as const).map((side) => (
              <div key={side} className="flex min-h-36 min-w-0 flex-col items-start gap-2">
                <p className="text-xs text-muted-foreground">{readout(row, side, settings)}</p>
                {row.render({
                  row,
                  side,
                  settings,
                  play: plays[`${row.id}-${side}`] ?? 0,
                  held: held[`${row.id}-${side}`] ?? false,
                  pin: pins[`${row.id}-${side}`],
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const isOpen = (demo: string) =>
  document.querySelector(`[data-demo="${demo}"]`)?.hasAttribute("data-open") ?? false;
const wait = (msValue: number) => new Promise((resolve) => setTimeout(resolve, msValue));

export const Default: Story = {
  name: "Motion",
  render: () => <MotionPage />,
};

// The interaction check, kept off the page above so nothing opens or closes there by itself
// while someone is using it.
export const ClickCheck: Story = {
  name: "Motion click check",
  render: () => <MotionPage />,
  // The lab comparison this page replaces closed a menu the moment it was clicked: both of
  // its columns shared one open state, so one column's dismissal closed both. Here each popup
  // owns its state, so a click opens it and it stays open. Then Play opens and closes both
  // columns' copies together.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const kind of ["menu", "popover"]) {
      const triggers = canvas.getAllByRole("button", { name: new RegExp(`^${kind}$`, "i") });
      for (const [index, side] of ["before", "after"].entries()) {
        await userEvent.click(triggers[index]);
        await wait(500);
        await expect(isOpen(`${kind}-${side}`), `${kind} ${side} still open`).toBe(true);
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(isOpen(`${kind}-${side}`)).toBe(false));
      }
    }
    // One column plays alone, then both together.
    await userEvent.click(canvas.getByRole("button", { name: "Play menu after" }));
    await waitFor(() => expect(isOpen("menu-after")).toBe(true));
    await expect(isOpen("menu-before")).toBe(false);
    await waitFor(() => expect(isOpen("menu-after")).toBe(false), { timeout: 3000 });
    await userEvent.click(canvas.getByRole("button", { name: "Play menu both" }));
    await waitFor(() => expect(isOpen("menu-before") && isOpen("menu-after")).toBe(true));
    await waitFor(() => expect(isOpen("menu-before") || isOpen("menu-after")).toBe(false), {
      timeout: 3000,
    });
    await Promise.all(document.getAnimations().map((a) => a.finished));
    // Rest without a focus ring on the last Play button.
    (document.activeElement as HTMLElement | null)?.blur();
  },
};
