import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { useGlobals } from "storybook/preview-api";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SettingsForm from "@/stories/settings-form.stories";
import { ColumnHeading, pinned, PinSlot } from "../1-surfaces/stage";
import "./motion.css";
import { SCENE_TIMING, startThemeTransition } from "./theme-transition";

const meta = {
  title: "Lab/Product ideas/2. Motion and timing",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Kind = "dialog" | "menu" | "popover" | "tooltip" | "sheet";
type OpenState = Record<Kind, boolean>;
const allClosed: OpenState = {
  dialog: false,
  menu: false,
  popover: false,
  tooltip: false,
  sheet: false,
};
const allOpen: OpenState = { dialog: true, menu: true, popover: true, tooltip: true, sheet: true };
// How long Replay holds everything open before closing it.
const HOLD_MS = 1200;

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

// The staggered section: Perkcord's .motion-enter with .motion-delay-N on each child. The
// stock column has no entrance, so the same markup simply appears.
function Section({ scope }: { scope: Record<string, string | undefined> }) {
  return (
    <section className="motion-enter flex flex-col gap-2" {...scope}>
      <h3 className="text-sm font-medium">Sample section</h3>
      <div className="grid grid-cols-2 gap-2">
        {["One", "Two", "Three", "Four"].map((n, i) => (
          <Card key={n} size="sm" className={`motion-enter motion-delay-${i + 1}`}>
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

function MotionColumn({
  id,
  motion,
  reduce,
  open,
  setOpen,
  replay,
}: {
  id: string;
  motion: boolean;
  reduce: boolean;
  open: OpenState;
  setOpen: (kind: Kind, value: boolean) => void;
  replay: number;
}) {
  const scope = {
    "data-idea": motion ? "motion" : undefined,
    "data-motion": motion && reduce ? "reduce" : undefined,
  };
  const on = (kind: Kind) => ({
    open: open[kind],
    onOpenChange: (value: boolean) => setOpen(kind, value),
  });
  return (
    <div className="flex min-w-0 flex-col gap-4" {...scope}>
      <ColumnHeading
        title={motion ? "Motion tokens" : "Stock"}
        source={
          motion
            ? "Perkcord: 160, 240 and 420ms; emphasised and standard easing; 18px rise; 70ms step"
            : "shadcn: 100ms ease (tooltip 150ms, sheet 200ms ease-in-out); no reduced-motion path"
        }
      />
      <div className="flex items-center justify-between pt-10">
        <DropdownMenu {...on("menu")} modal={false}>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent {...scope} align="start" className="w-44">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Move to folder</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip {...on("tooltip")}>
          <TooltipTrigger render={<Button variant="outline" size="sm" />}>Tooltip</TooltipTrigger>
          <TooltipContent {...scope}>Sample hint</TooltipContent>
        </Tooltip>
        <Popover {...on("popover")}>
          <PopoverTrigger render={<Button variant="outline" size="sm" />}>Popover</PopoverTrigger>
          <PopoverContent {...scope} align="end" className="w-56">
            <PopoverHeader>
              <PopoverTitle>Sharing</PopoverTitle>
              <PopoverDescription>Anyone with the link can view.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>
      <div className="h-32" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen("dialog", !open.dialog)}>
          Dialog
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpen("sheet", !open.sheet)}>
          Sheet
        </Button>
      </div>
      <PinSlot name={`motion-dialog-${id}`} height={176} />
      <Dialog {...on("dialog")} modal={false}>
        <DialogContent
          {...scope}
          data-lab-pinned=""
          initialFocus={false}
          style={pinned(`motion-dialog-${id}`)}
        >
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
      <PinSlot name={`motion-sheet-${id}`} height={150} />
      <Sheet {...on("sheet")} modal={false}>
        <SheetContent
          {...scope}
          data-lab-pinned=""
          initialFocus={false}
          style={pinned(`motion-sheet-${id}`, 150)}
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the sample list by status.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Section key={replay} scope={scope} />
    </div>
  );
}

function CompareMotion() {
  const [open, setOpenState] = useState<OpenState>(allClosed);
  const [replay, setReplay] = useState(0);
  const [reduce, setReduce] = useState(false);
  // While Replay or Hold runs, a popup's own close request (a click elsewhere, focus moving)
  // is ignored, so every popup stays open for the comparison.
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const setOpen = (kind: Kind, value: boolean) => {
    if (!held || value) setOpenState((s) => ({ ...s, [kind]: value }));
  };
  const hold = (value: boolean) => {
    clearTimeout(timer.current);
    setHeld(value);
    setOpenState(value ? allOpen : allClosed);
  };
  const run = () => {
    hold(true);
    setReplay((n) => n + 1);
    timer.current = setTimeout(() => hold(false), HOLD_MS);
  };
  const columns = { open, setOpen, replay, reduce };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={run}>Replay enter and exit</Button>
        <Button variant="outline" onClick={() => hold(!held)}>
          {held ? "Close all" : "Hold all open"}
        </Button>
        <ToggleRow
          id="motion-reduce"
          label="Preview reduced motion (tokens column)"
          checked={reduce}
          onChange={setReduce}
        />
      </div>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Every trigger opens the same popup in both columns at once. Replay opens all five, holds
        them for {HOLD_MS / 1000} seconds, closes them, and replays the section entrance.
      </p>
      <div className="grid grid-cols-2 gap-8">
        <MotionColumn id="stock" motion={false} {...columns} />
        <MotionColumn id="tokens" motion {...columns} />
      </div>
    </div>
  );
}

export const Compare: Story = {
  render: () => <CompareMotion />,
  play: async ({ canvasElement }) => {
    // Open everything and let it settle, so the story opens on the state worth comparing.
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Hold all open" }));
    await waitFor(() =>
      expect(document.querySelectorAll("[data-lab-pinned][data-open]")).toHaveLength(4),
    );
    await Promise.all(document.getAnimations().map((a) => a.finished));
  },
};

// ---- Arrival highlight -------------------------------------------------------------------

const replies = [
  "Placeholder reply one. A short note on the sample project.",
  "Placeholder reply two. It asks a question about the draft.",
  "Placeholder reply three. A deep link points here.",
  "Placeholder reply four. It answers the question above.",
];

type ArrivalMode = "off" | "shipped" | "fixed";
const arrivalScope: Record<ArrivalMode, string | undefined> = {
  off: undefined,
  shipped: "arrival",
  fixed: "arrival arrival-fixed",
};

// :target only changes on a real hash change, so replaying clears the hash first.
function goTo(hash: string) {
  window.location.hash = "";
  requestAnimationFrame(() => {
    window.location.hash = hash;
  });
}

function Arrival({ initial }: { initial: ArrivalMode }) {
  const [mode, setMode] = useState<ArrivalMode>(initial);
  useEffect(
    () => () => {
      window.location.hash = "";
    },
    [],
  );
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <RadioGroup
        value={mode}
        onValueChange={(value) => setMode(value as ArrivalMode)}
        className="gap-2"
      >
        {(
          [
            ["off", "Stock: no arrival highlight"],
            ["shipped", "Perkcord as shipped (ends transparent, the 8% rest tint never shows)"],
            ["fixed", "Perkcord with the fix (settles on the 8% rest tint)"],
          ] as const
        ).map(([value, label]) => (
          <div key={value} className="flex items-center gap-2">
            <RadioGroupItem value={value} id={`arrival-${value}`} />
            <Label htmlFor={`arrival-${value}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
      <div className="flex gap-2">
        <Button onClick={() => goTo("reply-3")}>Follow a link to reply three</Button>
        <Button variant="outline" onClick={() => goTo("reply-2")}>
          Reply two
        </Button>
      </div>
      <Card data-idea={arrivalScope[mode]}>
        <CardHeader>
          <CardTitle>Sample thread</CardTitle>
          <CardDescription>Four placeholder replies.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {replies.map((text, i) => (
            <div key={text}>
              {i > 0 && <Separator className="mb-1" />}
              <article id={`reply-${i + 1}`} data-arrival="" className="rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Sample member {i + 1}</p>
                <p>{text}</p>
              </article>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export const ArrivalHighlight: Story = {
  name: "Arrival highlight",
  render: () => <Arrival initial="fixed" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Follow a link to reply three" }),
    );
    await waitFor(() => expect(window.location.hash).toBe("#reply-3"));
    await Promise.all(document.getAnimations().map((a) => a.finished));
  },
};

// ---- Theme cross-fade --------------------------------------------------------------------

function ThemeFade({ dark, setTheme }: { dark: boolean; setTheme: (dark: boolean) => void }) {
  const [fade, setFade] = useState(true);
  const [scene, setScene] = useState(false);
  const Example = SettingsForm.component;
  const toggle = () => {
    // As in Perkcord's mode toggle: start the transition, then swap the class in the same task.
    if (fade) startThemeTransition(undefined, scene ? SCENE_TIMING : undefined);
    document.documentElement.classList.toggle("dark", !dark);
    setTheme(!dark);
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={toggle}>Switch to {dark ? "light" : "dark"}</Button>
        <ToggleRow
          id="theme-fade"
          label="Colour-only cross-fade (Perkcord); off is stock, an instant swap"
          checked={fade}
          onChange={setFade}
        />
        <ToggleRow
          id="theme-fade-scene"
          label="Timing: on is Perkcord with a community scene (500ms, cubic-bezier(0.4, 0, 0.2, 1)); off is its no-scene fallback (220ms, emphasised ease)"
          checked={scene}
          onChange={setScene}
        />
      </div>
      <Example />
    </div>
  );
}

export const ThemeCrossFade: Story = {
  name: "Theme cross-fade",
  render: function Render() {
    const [globals, updateGlobals] = useGlobals();
    return (
      <ThemeFade
        dark={globals.theme === "dark"}
        setTheme={(dark) => updateGlobals({ theme: dark ? "dark" : "light" })}
      />
    );
  },
};

// ---- In a page ---------------------------------------------------------------------------

// How it would ship: the tokens on <html>, so the Examples / Settings form's own menu, dialog
// and tabs read them. Open its menu and dialog to feel the difference.
function InAPage({ motion }: { motion: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    if (motion) root.dataset.idea = "motion";
    return () => {
      delete root.dataset.idea;
    };
  }, [motion]);
  const Example = SettingsForm.component;
  return (
    <div className="motion-enter">
      <Example />
    </div>
  );
}

export const StockInAPage: Story = {
  name: "Stock in a page",
  render: () => <InAPage motion={false} />,
};

export const TokensInAPage: Story = {
  name: "Motion tokens in a page",
  render: () => <InAPage motion />,
};
