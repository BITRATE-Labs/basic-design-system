import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { expect, waitFor } from "storybook/test";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SettingsForm from "@/stories/settings-form.stories";
import { ColumnHeading, LabPage, pinned, PinSlot } from "./stage";
import "./surfaces.css";

type Idea = "stock" | "lit-edge" | "glass";

const ideaAttr: Record<Idea, string | undefined> = {
  stock: undefined,
  "lit-edge": "lit-edge",
  glass: "lit-edge glass",
};

const labels: Record<Idea, { title: string; source: string }> = {
  stock: { title: "Stock", source: "shadcn: ring-1 ring-foreground/10 with shadow-md" },
  "lit-edge": {
    title: "Lit edge, no blur",
    source: "Perkcord: lit top edge, sheen and tinted shadow on an opaque fill",
  },
  glass: {
    title: "Lit-edge glass",
    source: "Perkcord: the same with a translucent fill and backdrop blur",
  },
};

const meta = {
  title: "Lab/Product ideas/1. Surfaces",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SampleCard({ idea }: { idea?: string }) {
  return (
    <Card data-idea={idea}>
      <CardHeader>
        <CardTitle>Sample project</CardTitle>
        <CardDescription>Last edited three days ago.</CardDescription>
        <CardAction>
          <Badge variant="secondary">Draft</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Placeholder summary of the sample project. It has two drafts and one published page.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Open</Button>
        <Button size="sm" variant="outline">
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}

// One column: every surface in one option, open at once. Menus and popovers open below their
// triggers into reserved space; the Dialog and Sheet are pinned over a slot (stage.tsx).
function SurfaceColumn({
  idea,
  id,
  transparency,
}: {
  idea: Idea;
  id: string;
  transparency?: "reduce";
}) {
  const attr = ideaAttr[idea];
  const scope = { "data-idea": attr, "data-transparency": transparency };
  return (
    <div className="flex min-w-0 flex-col gap-4" {...scope}>
      <SampleCard />
      <div className="h-48">
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent {...scope} align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Move to folder</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-36">
        <Popover open>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>Details</PopoverTrigger>
          <PopoverContent {...scope} align="start" className="w-64">
            <PopoverHeader>
              <PopoverTitle>Sharing</PopoverTitle>
              <PopoverDescription>
                Anyone with the link can view. Only editors can change the sample project.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>
      <PinSlot name={`dialog-${id}`} height={196} />
      <Dialog open modal={false}>
        <DialogContent
          {...scope}
          data-lab-pinned=""
          initialFocus={false}
          style={pinned(`dialog-${id}`)}
        >
          <DialogHeader>
            <DialogTitle>Archive sample project?</DialogTitle>
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
      <PinSlot name={`sheet-${id}`} height={230} />
      <Sheet open modal={false}>
        <SheetContent
          {...scope}
          data-lab-pinned=""
          initialFocus={false}
          style={pinned(`sheet-${id}`, 230)}
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the sample list by status and owner.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-wrap gap-2 px-4">
            <Badge>Published</Badge>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">Archived</Badge>
          </div>
          <SheetFooter>
            <Button size="sm">Apply</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CompareSurfaces({
  busy,
  ideas = ["stock", "lit-edge", "glass"],
}: {
  busy: boolean;
  ideas?: Idea[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-6 px-6">
        {ideas.map((idea) => (
          <ColumnHeading key={idea} {...labels[idea]} />
        ))}
      </div>
      <LabPage busy={busy} className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <SurfaceColumn key={idea} idea={idea} id={`${idea}-${busy ? "busy" : "calm"}`} />
          ))}
        </div>
      </LabPage>
    </div>
  );
}

// Waits until every pinned popup is open and its entry animation has finished.
const settle: Story["play"] = async ({ canvasElement }) => {
  await waitFor(() => {
    const open = document.querySelectorAll("[data-lab-pinned][data-open]");
    expect(open.length).toBeGreaterThan(0);
  });
  await Promise.all(
    [...document.querySelectorAll<HTMLElement>("[data-open]")].flatMap((el) =>
      el.getAnimations().map((a) => a.finished),
    ),
  );
  await expect(canvasElement).toBeVisible();
};

export const Compare: Story = {
  render: () => <CompareSurfaces busy={false} />,
  play: settle,
};

export const CompareOverBusyBackground: Story = {
  name: "Compare over a busy background",
  render: () => <CompareSurfaces busy />,
  play: settle,
};

// The fallback is forced with data-transparency="reduce", which the glass rules treat exactly
// like prefers-reduced-transparency, prefers-contrast: more and missing backdrop-filter.
export const FallbackForced: Story = {
  name: "Fallback forced (reduced transparency, more contrast)",
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-6 px-6">
        <ColumnHeading title="Lit-edge glass" source="Perkcord: translucent fill and blur" />
        <ColumnHeading
          title="Lit-edge glass, fallback"
          source="Opaque fill, edge and shadow kept: reduced transparency, more contrast, or no backdrop-filter"
        />
      </div>
      <LabPage busy className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <SurfaceColumn idea="glass" id="fallback-live" />
          <SurfaceColumn idea="glass" id="fallback-forced" transparency="reduce" />
        </div>
      </LabPage>
    </div>
  ),
  play: settle,
};

const rows = [
  ["Sample page one", "Published", "2 days ago"],
  ["Sample page two", "Draft", "3 days ago"],
  ["Sample page three", "Draft", "5 days ago"],
  ["Sample page four", "Published", "1 week ago"],
  ["Sample page five", "Archived", "2 weeks ago"],
  ["Sample page six", "Published", "3 weeks ago"],
  ["Sample page seven", "Draft", "1 month ago"],
  ["Sample page eight", "Published", "2 months ago"],
];

function ListCard({ uniform }: { uniform: boolean }) {
  return (
    <Card data-idea="lit-edge glass" data-fill={uniform ? "uniform" : undefined}>
      <CardHeader>
        <CardTitle>Sample pages</CardTitle>
        <CardDescription>Eight placeholder rows.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Edited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([name, status, edited]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>{edited}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export const UniformFill: Story = {
  name: "Uniform fill for long lists",
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-6 px-6">
        <ColumnHeading title="Glass fill" source="Perkcord panel: 36% fill, sheen, blur" />
        <ColumnHeading
          title="Uniform fill"
          source='Perkcord data-fill="uniform": 82% fill, no sheen, for lists and tables'
        />
      </div>
      <LabPage busy className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <ListCard uniform={false} />
          <ListCard uniform />
        </div>
      </LabPage>
    </div>
  ),
};

// How an option would ship: the scope sits on <html>, so the Examples / Settings form's own
// menu and dialog (portaled to <body>) pick it up too.
function InAPage({ idea }: { idea: Idea }) {
  useEffect(() => {
    const root = document.documentElement;
    const attr = ideaAttr[idea];
    if (attr) root.dataset.idea = attr;
    return () => {
      delete root.dataset.idea;
    };
  }, [idea]);
  const Example = SettingsForm.component;
  return (
    <LabPage busy className="p-6">
      <Card className="mx-auto max-w-2xl">
        <CardContent>
          <Example />
        </CardContent>
      </Card>
    </LabPage>
  );
}

export const StockInAPage: Story = {
  name: "Stock in a page",
  render: () => <InAPage idea="stock" />,
};

export const LitEdgeInAPage: Story = {
  name: "Lit edge in a page",
  render: () => <InAPage idea="lit-edge" />,
};

export const GlassInAPage: Story = {
  name: "Glass in a page",
  render: () => <InAPage idea="glass" />,
};
