import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShieldIcon, UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DirectionProvider } from "@/components/ui/direction";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlidingTabsList, SlidingTabsTrigger } from "@/components/ui/sliding-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SegmentedControl } from "./segmented-control";

const meta = {
  title: "Lab/Product ideas/3. Selection indicators",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// One choice, shown in each control. Synthetic content only.
const views = [
  { value: "active", label: "Active" },
  { value: "drafts", label: "Drafts" },
  { value: "archived", label: "Archived" },
];
const cadence = [
  { value: "monthly", label: "Monthly", weight: 1 },
  { value: "yearly", label: "Yearly, billed once", weight: 2 },
];
const roles = [
  {
    value: "member",
    weight: 5,
    label: (
      <>
        <UserIcon className="size-[15px]" aria-hidden="true" />
        Member
      </>
    ),
  },
  {
    value: "moderator",
    weight: 9,
    label: (
      <>
        <ShieldIcon className="size-[15px]" aria-hidden="true" />
        Moderator
      </>
    ),
  },
];

function Option({
  title,
  source,
  children,
}: {
  title: string;
  source: string;
  children: ReactNode;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{source}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}

function StockPill() {
  return (
    <Tabs defaultValue="active">
      <TabsList aria-label="Listing view">
        {views.map((v) => (
          <TabsTrigger key={v.value} value={v.value}>
            {v.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((v) => (
        <TabsContent key={v.value} value={v.value} className="text-muted-foreground">
          {v.label} sample listings.
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StockRadios() {
  return (
    <RadioGroup defaultValue="monthly" aria-label="Billing cadence">
      {cadence.map((c) => (
        <div key={c.value} className="flex items-center gap-2">
          <RadioGroupItem value={c.value} id={`stock-cadence-${c.value}`} />
          <Label htmlFor={`stock-cadence-${c.value}`}>{c.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function Sliding() {
  return (
    <Tabs defaultValue="active">
      <SlidingTabsList aria-label="Listing view">
        {views.map((v) => (
          <SlidingTabsTrigger key={v.value} value={v.value}>
            {v.label}
          </SlidingTabsTrigger>
        ))}
      </SlidingTabsList>
      {views.map((v) => (
        <TabsContent key={v.value} value={v.value} className="text-muted-foreground">
          {v.label} sample listings.
        </TabsContent>
      ))}
    </Tabs>
  );
}

function Segmented() {
  return (
    <>
      <SegmentedControl legend="Listing view" options={views} defaultValue="active" />
      <SegmentedControl legend="Billing cadence" options={cadence} defaultValue="monthly" />
      <SegmentedControl
        legend="Assistant mode"
        options={roles}
        defaultValue="member"
        compact
        className="w-54 max-w-full"
      />
    </>
  );
}

export const Compare: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-3">
      <Option title="Stock" source="Tabs pill and RadioGroup, as shadcn ships them">
        <StockPill />
        <StockRadios />
      </Option>
      <Option
        title="Sliding 3px bar"
        source="Perkcord sliding navigation; already in the system as Sliding tabs"
      >
        <Sliding />
      </Option>
      <Option
        title="Weighted segmented control"
        source="Perkcord sliding radio group: tinted thumb, weighted widths, 44px and compact sizes"
      >
        <Segmented />
      </Option>
    </div>
  ),
};

const segment = (root: HTMLElement, name: string) =>
  root.querySelector<HTMLElement>(`[role=radio][aria-labelledby$="-${name}"]`)!;

// The thumb has arrived when it covers the segment's box.
async function expectThumbOver(root: HTMLElement, item: HTMLElement) {
  const thumb = root.querySelector<HTMLElement>("[data-slot=segmented-control-thumb]")!;
  await waitFor(() => {
    const a = thumb.getBoundingClientRect();
    const b = item.getBoundingClientRect();
    expect(Math.abs(a.left - b.left)).toBeLessThan(1);
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  });
}

export const SegmentedMotion: Story = {
  name: "Segmented: thumb motion",
  render: () => (
    <div className="grid max-w-md gap-6">
      <SegmentedControl legend="Listing view" options={views} defaultValue="active" />
      <SegmentedControl legend="Billing cadence" options={cadence} defaultValue="monthly" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Click across both controls; the last click leaves the wide segment selected.
    const [viewsRoot, cadenceRoot] = canvasElement.querySelectorAll<HTMLElement>(
      "[data-slot=segmented-control]",
    );
    await userEvent.click(segment(viewsRoot, "archived"));
    await expectThumbOver(viewsRoot, segment(viewsRoot, "archived"));
    await userEvent.click(segment(cadenceRoot, "yearly"));
    await expectThumbOver(cadenceRoot, segment(cadenceRoot, "yearly"));
  },
};

export const SegmentedKeyboard: Story = {
  name: "Segmented: keyboard focus",
  render: () => (
    <div className="grid max-w-md gap-6">
      <SegmentedControl legend="Listing view" options={views} defaultValue="active" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Tab in, then arrow right: the stock RadioGroup moves and checks, the outline sits inside.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const drafts = segment(canvasElement, "drafts");
    await waitFor(() => expect(drafts).toHaveAttribute("data-checked"));
    await expect(drafts).toHaveFocus();
  },
};

export const SegmentedReducedMotion: Story = {
  name: "Segmented: reduced motion",
  render: () => (
    <div data-preview-motion="reduce" className="grid max-w-md gap-6">
      <p className="text-sm text-muted-foreground">
        Previewing prefers-reduced-motion: the thumb jumps without sliding.
      </p>
      <SegmentedControl legend="Listing view" options={views} defaultValue="active" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>("[data-slot=segmented-control]")!;
    await userEvent.click(segment(root, "archived"));
    const thumb = root.querySelector<HTMLElement>("[data-slot=segmented-control-thumb]")!;
    await expect(getComputedStyle(thumb).transitionDuration).toBe("0s, 0s");
  },
};

export const SegmentedStates: Story = {
  name: "Segmented: sizes, weights, disabled, right to left",
  render: () => (
    <div className="grid max-w-md gap-6">
      <SegmentedControl legend="Equal weights" options={views} defaultValue="drafts" />
      <SegmentedControl legend="Weighted 1 : 2" options={cadence} defaultValue="yearly" />
      <SegmentedControl
        legend="Compact, weighted 5 : 9"
        options={roles}
        defaultValue="moderator"
        compact
        className="w-54 max-w-full"
      />
      <SegmentedControl
        legend="One option disabled"
        options={views.map((v) => ({ ...v, disabled: v.value === "archived" }))}
        defaultValue="active"
      />
      <SegmentedControl
        legend="Whole control disabled"
        options={views}
        defaultValue="active"
        disabled
      />
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <SegmentedControl legend="Right to left" options={cadence} defaultValue="yearly" />
        </div>
      </DirectionProvider>
    </div>
  ),
};
