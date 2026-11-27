import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CopyIcon,
  EllipsisIcon,
  PencilIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { openModal } from "@/stories/popup-test-utils";
import "./touch-and-feedback.css";
import { useDirtyDismiss } from "./use-dirty-dismiss";
import { usePressPop } from "./use-press-pop";

const meta = {
  title: "Lab/Product ideas/8. Touch and feedback",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Column({
  title,
  source,
  children,
}: {
  title: string;
  source: string;
  children: ReactNode;
}) {
  return (
    <section className="grid content-start gap-3">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{source}</p>
      </div>
      {children}
    </section>
  );
}

// --- Touch targets -------------------------------------------------------------------

type Pointer = { idea?: boolean; coarse?: boolean };
const scope = ({ idea, coarse }: Pointer) =>
  idea
    ? { "data-idea": "touch-targets", "data-preview-pointer": coarse ? "coarse" : undefined }
    : {};

function IconAction({
  label,
  children,
  size,
}: {
  label: string;
  children: ReactNode;
  size?: "icon" | "icon-sm";
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size={size ?? "icon"} aria-label={label} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ListingCard(pointer: Pointer & { menuOpen?: boolean }) {
  return (
    <Card {...scope(pointer)} className="max-w-sm">
      <CardHeader>
        <CardTitle>Sample listing</CardTitle>
        <CardDescription>Posted by name@example.com</CardDescription>
        <CardAction className="flex gap-1">
          <IconAction label="Edit">
            <PencilIcon />
          </IconAction>
          <IconAction label="Share">
            <ShareIcon />
          </IconAction>
          <DropdownMenu defaultOpen={pointer.menuOpen}>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label="More actions" />}
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44" {...scope(pointer)}>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <CopyIcon />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PencilIcon />
                  Rename
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">Tags</span>
        {["sample", "example"].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 rounded-md bg-muted ps-2 text-xs"
          >
            {tag}
            <Button variant="ghost" size="icon-xs" aria-label={`Remove ${tag}`}>
              <XIcon />
            </Button>
          </span>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Dirty dialog ----------------------------------------------------------------------

function EditDialog({ nudge, label }: { nudge: boolean; label: string }) {
  const dirty = useDirtyDismiss();
  const extra = nudge ? dirty.contentProps : {};
  return (
    <Dialog onOpenChange={nudge ? dirty.onOpenChange : undefined}>
      <DialogTrigger render={<Button variant="outline" className="justify-self-start" />}>
        {label}
      </DialogTrigger>
      <DialogContent {...extra}>
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit sample listing</DialogTitle>
            <DialogDescription>
              Type something, then press Escape or click outside.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${label}-title`}>Title</FieldLabel>
              <Input id={`${label}-title`} defaultValue="Sample listing" />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${label}-notes`}>Notes</FieldLabel>
              <Textarea id={`${label}-notes`} placeholder="Placeholder notes" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
          {nudge && <p data-dirty-dismiss-status role="status" className="sr-only" />}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Opens the dialog, types into it and presses Escape: the dismiss is refused.
async function refuseDismiss(canvas: { getByRole: typeof screen.getByRole }, label: string) {
  const dialog = await openModal(canvas, label);
  await userEvent.type(screen.getByLabelText("Title"), " (edited)");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
  await expect(dialog).toHaveAttribute("data-open");
  return dialog;
}

// --- Selection pop -------------------------------------------------------------------

type Item = { id: string; name: string };
const items: Item[] = [
  { id: "a", name: "Sample event" },
  { id: "b", name: "Example meetup" },
  { id: "c", name: "Placeholder workshop" },
];

function FavoriteButton({
  item,
  pressed,
  onToggle,
  pop,
}: {
  item: Item;
  pressed: boolean;
  onToggle: () => void;
  pop: boolean;
}) {
  const { iconRef, onClick } = usePressPop<SVGSVGElement>(pressed, onToggle);
  const label = `${pressed ? "Remove favorite" : "Favorite"}: ${item.name}`;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={pressed}
      onClick={pop ? onClick : onToggle}
    >
      <StarIcon ref={iconRef} className={pressed ? "fill-current" : undefined} />
    </Button>
  );
}

function Favorites({ pop, initial = ["b"] }: { pop: boolean; initial?: string[] }) {
  const [saved, setSaved] = useState(new Set(initial));
  const toggle = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  return (
    <div className="grid gap-2" data-idea={pop ? "selection-pop" : undefined}>
      <ul className="grid gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1"
          >
            <span>{item.name}</span>
            <FavoriteButton
              item={item}
              pressed={saved.has(item.id)}
              onToggle={() => toggle(item.id)}
              pop={pop}
            />
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => setSaved(new Set(items.map((i) => i.id)))}
      >
        Load saved state from the server
      </Button>
    </div>
  );
}

// --- Compare -------------------------------------------------------------------------

export const Compare: Story = {
  render: () => (
    <div className="grid gap-10">
      <div data-preview-targets className="grid gap-6 md:grid-cols-2">
        <Column
          title="Stock"
          source="Icon buttons 24 to 32px on every pointer, default cursor. Dashed lines mark hit areas."
        >
          <ListingCard />
        </Column>
        <Column
          title="44px targets on coarse pointers, pointer cursor"
          source="Perkcord icon buttons and menu items; previewed here as a coarse pointer"
        >
          <ListingCard idea coarse />
        </Column>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Column title="Stock" source="Escape or an outside click closes and drops the edits">
          <EditDialog nudge={false} label="Edit (stock)" />
        </Column>
        <Column
          title="Refuse-to-dismiss nudge"
          source="Perkcord dialog shell: a changed dialog shakes and focuses its actions"
        >
          <EditDialog nudge label="Edit (nudge)" />
        </Column>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Column title="Stock" source="The star fills; nothing else marks the press">
          <Favorites pop={false} />
        </Column>
        <Column
          title="Selection pop on the user's own press"
          source="VRDex favourite button: 220ms pop, never on load or on server state"
        >
          <Favorites pop />
        </Column>
      </div>
    </div>
  ),
};

// --- Focused stories -------------------------------------------------------------------

export const TouchTargetsMenu: Story = {
  name: "Touch targets: coarse pointer, menu open",
  render: () => (
    <div data-preview-targets className="grid gap-6 md:grid-cols-2">
      <Column title="Stock" source="32px icon buttons, about 28px menu rows">
        <ListingCard menuOpen />
      </Column>
      <Column
        title="44px on coarse pointers"
        source="Perkcord sizes, previewed as a coarse pointer"
      >
        <ListingCard idea coarse menuOpen />
      </Column>
    </div>
  ),
};

export const TouchTargetsFinePointer: Story = {
  name: "Touch targets: fine pointer (no change)",
  render: () => (
    <div data-preview-targets>
      <Column
        title="The same option on a mouse"
        source="Without a coarse pointer only the cursor changes; sizes stay stock"
      >
        <ListingCard idea />
      </Column>
    </div>
  ),
};

export const DirtyDialogNudge: Story = {
  name: "Dirty dialog: nudge",
  render: () => <EditDialog nudge label="Edit listing" />,
  play: async ({ canvas }) => {
    await refuseDismiss(canvas, "Edit listing");
  },
};

export const DirtyDialogReducedMotion: Story = {
  name: "Dirty dialog: reduced motion ring",
  render: () => (
    <div data-preview-motion="reduce">
      <p className="mb-3 text-sm text-muted-foreground">
        Previewing prefers-reduced-motion: the action row is ringed for 900ms instead of a shake.
      </p>
      <ReducedMotionDialog />
    </div>
  ),
  play: async ({ canvas }) => {
    const dialog = await refuseDismiss(canvas, "Edit listing");
    await expect(dialog).toHaveAttribute("data-dirty-dismiss", "ring");
  },
};

// The dialog portals out of the preview wrapper, so its popup carries the preview mark too.
function ReducedMotionDialog() {
  const dirty = useDirtyDismiss();
  return (
    <Dialog onOpenChange={dirty.onOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>Edit listing</DialogTrigger>
      <DialogContent {...dirty.contentProps} data-preview-motion="reduce">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit sample listing</DialogTitle>
            <DialogDescription>
              Type something, then press Escape or click outside.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="reduced-title">Title</FieldLabel>
            <Input id="reduced-title" defaultValue="Sample listing" />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
          <p data-dirty-dismiss-status role="status" className="sr-only" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const DirtyDialogPristine: Story = {
  name: "Dirty dialog: pristine closes",
  render: () => <EditDialog nudge label="Edit listing" />,
  play: async ({ canvas }) => {
    await openModal(canvas, "Edit listing");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const SelectionPop: Story = {
  name: "Selection pop: user press only",
  render: () => <Favorites pop />,
  play: async ({ canvas, canvasElement }) => {
    // Initial saved state rendered with no pop.
    await expect(canvasElement.querySelector("[data-selection-pop]")).toBeNull();
    // A press pops the icon it selected.
    const star = canvas.getByRole("button", { name: "Favorite: Sample event" });
    await userEvent.click(star);
    await expect(star.querySelector("svg")).toHaveAttribute("data-selection-pop");
    await waitFor(() => expect(canvasElement.querySelector("[data-selection-pop]")).toBeNull());
    // State from the server selects the rest without a pop.
    await userEvent.click(canvas.getByRole("button", { name: "Load saved state from the server" }));
    await expect(canvasElement.querySelector("[data-selection-pop]")).toBeNull();
  },
};

export const SelectionPopReducedMotion: Story = {
  name: "Selection pop: reduced motion",
  render: () => (
    <div data-preview-motion="reduce">
      <p className="mb-3 text-sm text-muted-foreground">
        Previewing prefers-reduced-motion: the star fills without the pop.
      </p>
      <Favorites pop />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Favorite: Sample event" }));
    await expect(canvasElement.querySelector("[data-selection-pop]")).toBeNull();
  },
};
