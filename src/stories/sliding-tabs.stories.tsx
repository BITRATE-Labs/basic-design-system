import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen, CreditCard, LayoutGrid, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { DirectionProvider } from "@/components/ui/direction";
import {
  SlidingNav,
  SlidingNavLink,
  SlidingTabsList,
  SlidingTabsTrigger,
} from "@/components/ui/sliding-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "Components/Sliding tabs",
  component: SlidingTabsList,
} satisfies Meta<typeof SlidingTabsList>;

export default meta;
type Story = StoryObj<typeof meta>;

const panels = [
  { value: "overview", label: "Overview", body: "A short summary of the sample item." },
  { value: "activity", label: "Activity", body: "Three updates in the last week." },
  { value: "files", label: "Files", body: "Two attachments, both placeholders." },
  { value: "settings", label: "Settings", body: "Visibility and notification options." },
];

const many = [
  "Overview",
  "Activity",
  "Files",
  "Members",
  "Schedule",
  "Reports",
  "Integrations",
  "Billing",
  "Audit log",
  "Settings",
];

const links = [
  { href: "#listings", label: "Listings", icon: LayoutGrid },
  { href: "#guides", label: "Guides", icon: BookOpen },
  { href: "#discussions", label: "Discussions", icon: MessagesSquare },
  { href: "#plans", label: "Plans", icon: CreditCard },
];

// The indicator has finished moving when its box matches the item's left, width and bottom.
async function expectIndicatorUnder(root: HTMLElement, item: HTMLElement) {
  const indicator = root.querySelector<HTMLElement>(
    '[data-slot="tabs-indicator"], [data-slot="sliding-nav-indicator"]',
  );
  await expect(indicator).toBeVisible();
  await document.fonts.ready;
  await waitFor(
    () => {
      const line = indicator!.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      expect(Math.abs(line.left - box.left)).toBeLessThan(1);
      expect(Math.abs(line.width - box.width)).toBeLessThan(1);
      expect(Math.abs(line.bottom - box.bottom)).toBeLessThan(1);
    },
    { timeout: 2000 },
  );
}

const lefts = (items: HTMLElement[]) => items.map((i) => i.getBoundingClientRect().left);

// No item moved by a whole pixel (sub-pixel text rounding aside).
async function expectUnmoved(items: HTMLElement[], before: number[]) {
  const moved = lefts(items).map((left, i) => Math.abs(left - before[i]));
  await expect(Math.max(...moved)).toBeLessThan(1);
}

function SlidingSample({
  items = panels.map((p) => p.label),
  disabled,
  icons,
  listClassName,
  className = "max-w-md",
}: {
  items?: string[];
  disabled?: string;
  icons?: boolean;
  listClassName?: string;
  className?: string;
}) {
  return (
    <Tabs defaultValue={items[0]} className={className}>
      <SlidingTabsList className={listClassName}>
        {items.map((label, i) => {
          const Icon = links[i % links.length].icon;
          return (
            <SlidingTabsTrigger key={label} value={label} disabled={label === disabled}>
              {icons ? <Icon data-icon="inline-start" /> : null}
              {label}
            </SlidingTabsTrigger>
          );
        })}
      </SlidingTabsList>
      {items.map((label) => (
        <TabsContent key={label} value={label} className="p-2">
          {panels.find((p) => p.label === label)?.body ?? `Placeholder content for ${label}.`}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export const Default: Story = {
  render: () => <SlidingSample />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tabs = canvas.getAllByRole("tab");
    await expectIndicatorUnder(canvasElement, tabs[0]);
    await document.fonts.ready;
    const before = lefts(tabs);
    await userEvent.click(canvas.getByRole("tab", { name: "Files" }));
    await expectIndicatorUnder(canvasElement, canvas.getByRole("tab", { name: "Files" }));
    // Selection changes colour only, so nothing moves.
    await expectUnmoved(tabs, before);
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(canvas.getByRole("tab", { name: "Settings" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expectIndicatorUnder(canvasElement, canvas.getByRole("tab", { name: "Settings" }));
  },
};

function NavigationBar({ dir }: { dir?: "rtl" }) {
  const [current, setCurrent] = useState(links[0].href);
  return (
    <div dir={dir} className="bg-background text-foreground">
      {/* The hairline is an inset shadow, not a border, so the indicator paints over it. */}
      <header className="flex items-stretch gap-6 px-4 shadow-[inset_0_-1px_0_var(--color-border)]">
        <span className="flex items-center text-sm font-semibold">Sample Workspace</span>
        <SlidingNav aria-label="Sections">
          {links.map((link) => (
            <SlidingNavLink
              key={link.href}
              href={link.href}
              active={current === link.href}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(link.href);
              }}
            >
              {link.label}
            </SlidingNavLink>
          ))}
        </SlidingNav>
      </header>
    </div>
  );
}

export const NavigationBarStory: Story = {
  name: "Navigation bar",
  render: () => <NavigationBar />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const nav = canvas.getByRole("navigation", { name: "Sections" });
    await expect(canvas.getByRole("link", { name: "Listings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expectIndicatorUnder(nav, canvas.getByRole("link", { name: "Listings" }));
    const items = canvas.getAllByRole("link");
    await document.fonts.ready;
    const before = lefts(items);
    await userEvent.click(canvas.getByRole("link", { name: "Discussions" }));
    await expect(canvas.getByRole("link", { name: "Discussions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvasElement.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    await expectIndicatorUnder(nav, canvas.getByRole("link", { name: "Discussions" }));
    await expectUnmoved(items, before);
    canvas.getByRole("link", { name: "Discussions" }).blur();
  },
};

export const StockVsSliding: Story = {
  name: "Stock vs sliding",
  render: () => (
    <div className="grid gap-8 sm:grid-cols-2">
      <section className="grid content-start gap-2">
        <h3 className="text-sm text-muted-foreground">Stock line variant</h3>
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            {panels.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {panels.map((p) => (
            <TabsContent key={p.value} value={p.value} className="p-2">
              {p.body}
            </TabsContent>
          ))}
        </Tabs>
      </section>
      <section className="grid content-start gap-2">
        <h3 className="text-sm text-muted-foreground">Sliding</h3>
        <SlidingSample className="" />
      </section>
    </div>
  ),
};

export const NarrowOverflow: Story = {
  render: () => <SlidingSample items={many} className="w-60" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const list = canvas.getByRole("tablist");
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{End}{Enter}");
    const last = canvas.getByRole("tab", { name: "Settings" });
    await expect(last).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(list.scrollLeft).toBeGreaterThan(0));
    await expectIndicatorUnder(canvasElement, last);
  },
};

export const ManyItems: Story = {
  render: () => (
    <SlidingSample
      items={many}
      className="max-w-sm"
      listClassName="flex-wrap overflow-visible group-data-horizontal/tabs:h-auto"
    />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const first = canvas.getByRole("tab", { name: "Overview" });
    const target = canvas.getByRole("tab", { name: "Settings" });
    // Wrapped onto a later row: the indicator moves down as well as across.
    await expect(target.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().bottom - 1,
    );
    await userEvent.click(target);
    await expectIndicatorUnder(canvasElement, target);
  },
};

export const WithIcons: Story = {
  render: () => <SlidingSample icons />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const target = canvas.getByRole("tab", { name: "Activity" });
    await userEvent.click(target);
    await expectIndicatorUnder(canvasElement, target);
  },
};

export const DisabledItem: Story = {
  render: () => <SlidingSample disabled="Files" />,
  play: async ({ canvas, canvasElement }) => {
    const first = canvas.getByRole("tab", { name: "Overview" });
    await expect(canvas.getByRole("tab", { name: "Files" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expectIndicatorUnder(canvasElement, first);
  },
};

export const RightToLeft: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="grid gap-6">
        <SlidingSample />
        <NavigationBar dir="rtl" />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    const tabs = canvas.getAllByRole("tab");
    // First tab sits on the right.
    await expect(tabs[0].getBoundingClientRect().left).toBeGreaterThan(
      tabs[1].getBoundingClientRect().left,
    );
    await userEvent.click(tabs[1]);
    await expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    await expectIndicatorUnder(canvas.getByRole("tablist"), tabs[1]);
    // ArrowLeft moves to the tab on the visual left, the next one in reading order.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(tabs[2]).toHaveFocus();
    const guides = canvas.getByRole("link", { name: "Guides" });
    await userEvent.click(guides);
    await expectIndicatorUnder(canvas.getByRole("navigation"), guides);
    guides.blur();
  },
};
