import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, PencilIcon, TrashIcon } from "lucide-react";
import * as React from "react";
import { expect, screen, waitFor } from "storybook/test";
import { brands } from "../../../../dist/tokens";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidingNav, SlidingNavLink } from "@/components/ui/sliding-tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import "./brand-tint.css";
import "./status-triads.css";
import { ContrastReadout } from "./contrast";

// Group 4 of the product-ideas lab. Notes: state-and-status-colour.mdx in this folder.
// [data-lab-state="hover"] plus the stock hover classes draws a hover state at rest, so
// stock and the option can be compared side by side; the option CSS answers both.

const meta = {
  title: "Lab/Product ideas/4. State and status colour",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Tint = "stock" | "brand-tint" | "brand-tint-contrast";
const tintLabels: Record<Tint, string> = {
  stock: "Stock: grey accent and muted hover",
  "brand-tint": "Loominist: brand tint wash (primary at 5% hover, 7% current, 3% selected)",
  "brand-tint-contrast":
    "Loominist brand tint, adjusted for contrast: current nav link text in foreground",
};
const tintScope: Record<Tint, Record<`data-${string}`, string>> = {
  stock: {},
  "brand-tint": { "data-idea": "brand-tint" },
  "brand-tint-contrast": { "data-idea": "brand-tint", "data-adjust": "contrast" },
};

function Column({
  label,
  children,
  ...scope
}: { label: string; children: React.ReactNode } & Record<`data-${string}`, string>) {
  return (
    <section {...scope} className="min-w-0 rounded-lg border bg-background p-4 text-foreground">
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <ContrastReadout>{children}</ContrastReadout>
    </section>
  );
}

// Hover classes copied from the stock components, for drawing hover at rest.
const stockHover = {
  ghost: "bg-muted text-foreground dark:bg-muted/50",
  outline: "bg-muted text-foreground dark:bg-input/50",
  row: "bg-muted/50",
  menuItem: "bg-accent text-accent-foreground",
  navLink: "text-foreground",
};

function WashButtons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" data-variant="ghost">
        Ghost
      </Button>
      <Button
        variant="ghost"
        data-variant="ghost"
        data-lab-state="hover"
        className={stockHover.ghost}
        data-contrast="Ghost hover: wash on page"
        data-contrast-kind="surface"
      >
        <span data-contrast="Ghost hover: text">Ghost, hovered</span>
      </Button>
      <Button variant="outline" data-variant="outline">
        Outline
      </Button>
      <Button
        variant="outline"
        data-variant="outline"
        data-lab-state="hover"
        className={stockHover.outline}
      >
        <span data-contrast="Outline hover: text">Outline, hovered</span>
      </Button>
    </div>
  );
}

function WashMenu({ open, label }: { open?: boolean; label: string }) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="relative">
      {/* The content portals into this column, so the column's idea scope reaches it. */}
      <DropdownMenu open={open} modal={open ? false : undefined}>
        <DropdownMenuTrigger render={<Button variant="outline" />}>{label}</DropdownMenuTrigger>
        {container && (
          <DropdownMenuContent container={container} className="w-56">
            <DropdownMenuItem
              data-lab-state={open ? "hover" : undefined}
              className={open ? stockHover.menuItem : undefined}
              data-contrast={open ? "Menu highlight: wash on menu" : undefined}
              data-contrast-kind="surface"
            >
              <PencilIcon />
              <span data-contrast={open ? "Menu highlight: text" : undefined}>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CopyIcon />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}

const sampleRows = [
  { sku: "SMP-001", item: "Sample lamp", qty: 12 },
  { sku: "SMP-002", item: "Placeholder mug", qty: 3 },
  { sku: "SMP-003", item: "Example notebook", qty: 40 },
];

function WashTable({ forced }: { forced?: boolean }) {
  return (
    <Table>
      <TableBody>
        {sampleRows.map((r, i) => (
          <TableRow
            key={r.sku}
            data-state={i === 2 ? "selected" : undefined}
            data-lab-state={forced && i === 1 ? "hover" : undefined}
            className={forced && i === 1 ? stockHover.row : undefined}
            data-contrast={
              forced && i === 1 ? "Row hover: wash" : i === 2 ? "Row selected: wash" : undefined
            }
            data-contrast-kind="surface"
          >
            <TableCell className="font-medium">{r.sku}</TableCell>
            <TableCell>
              <span
                data-contrast={
                  forced && i === 1 ? "Row hover: text" : i === 2 ? "Row selected: text" : undefined
                }
              >
                {r.item}
                {i === 1 && forced ? " (hovered)" : i === 2 ? " (selected)" : ""}
              </span>
            </TableCell>
            <TableCell className="text-right">{r.qty}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const navLinks = ["Listings", "Guides", "Discussions"];

function WashNav({ forced }: { forced?: boolean }) {
  const [current, setCurrent] = React.useState(navLinks[0]);
  return (
    <SlidingNav
      aria-label="Sample sections"
      className="shadow-[inset_0_-1px_0_var(--color-border)]"
    >
      {navLinks.map((link, i) => (
        <SlidingNavLink
          key={link}
          href={`#${link.toLowerCase()}`}
          active={current === link}
          onClick={(event) => {
            event.preventDefault();
            setCurrent(link);
          }}
          data-lab-state={forced && i === 1 ? "hover" : undefined}
          className={forced && i === 1 ? stockHover.navLink : undefined}
          data-contrast={
            current === link
              ? "Nav current: text"
              : forced && i === 1
                ? "Nav hover: text"
                : undefined
          }
        >
          {link}
        </SlidingNavLink>
      ))}
    </SlidingNav>
  );
}

function WashSubjects({ forced, menuLabel }: { forced?: boolean; menuLabel?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <WashNav forced={forced} />
      <WashButtons />
      <WashTable forced={forced} />
      {menuLabel && <WashMenu open={forced} label={menuLabel} />}
      {/* Room for the open menu, which is positioned below its trigger. */}
      {forced && menuLabel && <div className="h-32" />}
    </div>
  );
}

type Tone = "success" | "warning" | "info" | "destructive";
const messages: Record<Tone, [string, string]> = {
  success: ["Success: listing published", "The sample listing is now visible to members."],
  warning: ["Warning: draft expires soon", "The sample draft is removed in 2 days."],
  info: ["Info: review in progress", "A moderator is checking the sample report."],
  destructive: ["Error: payment method declined", "Update the sample card to keep access."],
};
const tones = Object.keys(messages) as Tone[];

type Status = "stock" | "drasil" | "triad" | "callout";
const statusLabels: Record<Status, string> = {
  stock: "Stock: default Alert and the destructive variant",
  drasil: "drasil triads, drasil's own hex values",
  triad: "drasil triads, derived from each brand's status roles",
  callout: "drasil left-rule callout, lines from each brand's status roles",
};
const statusScope: Record<Status, Record<`data-${string}`, string>> = {
  stock: {},
  drasil: { "data-idea": "status-triad", "data-status-colours": "drasil" },
  triad: { "data-idea": "status-triad", "data-status-colours": "roles" },
  callout: { "data-idea": "status-callout", "data-status-colours": "roles" },
};

function StatusSubjects({ option }: { option: Status }) {
  return (
    <div className="flex flex-col gap-3">
      {tones.map((tone) => (
        <Alert
          key={tone}
          data-tone={option === "stock" ? undefined : tone}
          variant={option === "stock" && tone === "destructive" ? "destructive" : "default"}
          data-contrast={option === "callout" ? `${tone}: rule on page` : undefined}
          data-contrast-kind="border"
        >
          <AlertTitle data-contrast={`${tone}: title`}>{messages[tone][0]}</AlertTitle>
          <AlertDescription>
            <span data-contrast={`${tone}: description`}>{messages[tone][1]}</span>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

export const Compare: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 text-base font-semibold">Hover, selected and current wash</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          The second button of each kind, the middle table row, the middle nav link and the first
          menu item are drawn in their hover state. The last row is selected.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(tintLabels) as Tint[]).map((tint) => (
            <Column key={tint} label={tintLabels[tint]} {...tintScope[tint]}>
              <WashSubjects forced menuLabel="Actions" />
            </Column>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-1 text-base font-semibold">Status</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          The ratios under each column are measured from the rendered colours in the current brand
          and theme.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(statusLabels) as Status[]).map((option) => (
            <Column key={option} label={statusLabels[option]} {...statusScope[option]}>
              <StatusSubjects option={option} />
            </Column>
          ))}
        </div>
      </div>
    </div>
  ),
};

// Every brand at once, in the toolbar's light or dark mode. The brand wrapper sits
// outside the idea scope so the scope's color-mix reads that brand's roles. Menus are
// left out here (one open menu per brand would cover the page); Compare measures them.
export const ContrastInEveryBrand: Story = {
  name: "Contrast in every brand",
  render: () => (
    <div className="flex flex-col gap-6">
      {brands.map((brand) => (
        <div key={brand} data-brand={brand} className="rounded-lg bg-background p-3 font-sans">
          <h2 className="mb-2 text-sm font-semibold text-foreground">{brand}</h2>
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-5">
            {(Object.keys(tintLabels) as Tint[]).map((tint) => (
              <Column key={tint} label={tintLabels[tint]} {...tintScope[tint]}>
                <WashSubjects forced />
              </Column>
            ))}
            <Column label={statusLabels.triad} {...statusScope.triad}>
              <StatusSubjects option="triad" />
            </Column>
            <Column label={statusLabels.callout} {...statusScope.callout}>
              <StatusSubjects option="callout" />
            </Column>
          </div>
        </div>
      ))}
    </div>
  ),
};

// Live components to hover by hand, stock beside the tint.
export const LiveHover: Story = {
  name: "Live hover",
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(Object.keys(tintLabels) as Tint[]).map((tint) => (
        <Column key={tint} label={tintLabels[tint]} {...tintScope[tint]}>
          <WashSubjects menuLabel="Actions" />
        </Column>
      ))}
    </div>
  ),
};

// The real keyboard highlight in an open menu, which follows focus.
function menuHighlight(tint: Tint): Story {
  return {
    name: `Menu highlight, ${tint === "stock" ? "stock" : "Loominist tint"}`,
    render: () => (
      <div {...tintScope[tint]} className="pb-40">
        <WashMenu label="Actions" />
      </div>
    ),
    play: async ({ canvas, userEvent }) => {
      await userEvent.tab();
      await expect(canvas.getByRole("button", { name: "Actions" })).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      await waitFor(() => expect(screen.getByRole("menuitem", { name: /Rename/ })).toHaveFocus());
      await userEvent.keyboard("{ArrowDown}");
      await expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toHaveFocus();
    },
  };
}

export const MenuHighlightStock = menuHighlight("stock");
export const MenuHighlightTint = menuHighlight("brand-tint");
