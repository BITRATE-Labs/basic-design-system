import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, type ReactNode } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Surfaces in a glass brand (perkcord) over its page backdrop, the same in a flat brand, and
// the opaque fallback. Each story pins its brand; the theme toolbar switches light and dark.
// See Docs / Surfaces.
const meta = {
  title: "Foundations/Surfaces",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  ["Sample item one", "Published", "3 days ago"],
  ["Sample item two", "Draft", "1 week ago"],
  ["Sample item three", "Published", "2 weeks ago"],
  ["Sample item four", "Archived", "1 month ago"],
];

function PageHeading() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">Sample workspace</h1>
      <p className="text-muted-foreground">
        Placeholder page text. The surfaces below sit on the page backdrop.
      </p>
    </div>
  );
}

function ProjectCard() {
  return (
    <Card>
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

// data-fill="uniform": the even fill for long lists and tables.
function ListCard() {
  return (
    <Card data-fill="uniform">
      <CardHeader>
        <CardTitle>Recent items</CardTitle>
        <CardDescription>Uniform fill, for long lists and tables.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([name, status, updated]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell className="text-right text-muted-foreground">{updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Page({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <PageHeading />
      <div className="grid items-start gap-6 md:grid-cols-2">
        <ProjectCard />
        <ListCard />
      </div>
      {children}
    </div>
  );
}

// Cards, an open menu, popover and tooltip over the backdrop. Each popup opens below its own
// trigger inside a slot as wide and tall as the popup, so none collide; the slots wrap into
// rows on narrow screens.
function Overview() {
  return (
    <Page>
      <div className="flex flex-wrap gap-6">
        <div className="h-48 w-48">
          <DropdownMenu open modal={false}>
            <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
              Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
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
        <div className="h-40 w-64">
          <Popover open>
            <PopoverTrigger render={<Button variant="secondary" size="sm" />}>
              Details
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <PopoverHeader>
                <PopoverTitle>Sharing</PopoverTitle>
                <PopoverDescription>
                  Anyone with the link can view. Only editors can change the sample project.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
        <div className="h-20 w-52">
          <Tooltip open>
            <TooltipTrigger render={<Button variant="outline" size="sm" />}>Help</TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              Opens the sample help page
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Page>
  );
}

const popupsOpen: Story["play"] = async () => {
  await waitFor(() => {
    for (const slot of ["dropdown-menu-content", "popover-content", "tooltip-content"])
      expect(document.querySelector(`[data-slot="${slot}"]`)).toBeVisible();
  });
};

export const Glass: Story = {
  globals: { brand: "perkcord" },
  render: () => <Overview />,
  play: popupsOpen,
};

export const GlassDialog: Story = {
  globals: { brand: "perkcord" },
  render: () => (
    <Page>
      <Dialog open>
        <DialogContent initialFocus={false}>
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
    </Page>
  ),
};

export const GlassSheet: Story = {
  globals: { brand: "perkcord" },
  render: () => (
    <Page>
      <Sheet open>
        <SheetContent initialFocus={false}>
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
    </Page>
  ),
};

// The same page in a flat brand: stock surfaces, no backdrop.
export const Flat: Story = {
  globals: { brand: "basic" },
  render: () => <Overview />,
  play: popupsOpen,
};

// data-transparency="reduce" on <html>: the opaque fallback that reduced transparency, more
// contrast, forced colours and browsers without backdrop-filter also get. The edge, sheen and
// tinted shadow stay.
function ReducedTransparency() {
  useLayoutEffect(() => {
    document.documentElement.dataset.transparency = "reduce";
    return () => {
      delete document.documentElement.dataset.transparency;
    };
  }, []);
  return <Overview />;
}

export const GlassFallback: Story = {
  globals: { brand: "perkcord" },
  render: () => <ReducedTransparency />,
  play: popupsOpen,
};
