import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShieldIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/components/ui/button";
import { DirectionProvider } from "@/components/ui/direction";
import { SegmentedControl } from "@/components/ui/segmented-control";

const meta = {
  title: "Components/Segmented control",
  component: SegmentedControl,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

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

// The thumb has arrived when it covers the checked segment's box.
async function expectThumbOver(root: HTMLElement, radio: HTMLElement) {
  const thumb = root.querySelector<HTMLElement>("[data-slot=segmented-control-thumb]")!;
  await waitFor(() => {
    const a = thumb.getBoundingClientRect();
    const b = radio.getBoundingClientRect();
    expect(Math.abs(a.left - b.left)).toBeLessThan(1);
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  });
}

const lefts = (root: HTMLElement) =>
  [...root.querySelectorAll("[data-slot=segmented-control-label]")].map(
    (label) => label.getBoundingClientRect().left,
  );

export const Default: Story = {
  args: { legend: "Listing view", options: views, defaultValue: "active", className: "max-w-md" },
};

export const Small: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    legend: "Listing view",
    options: views,
    defaultValue: "drafts",
    size: "sm",
    className: "w-54 max-w-full",
  },
};

export const WithIcons: Story = {
  args: {
    legend: "Assistant mode",
    options: roles,
    defaultValue: "member",
    className: "max-w-sm",
  },
};

export const Weights: Story = {
  tags: ["!dev", "!autodocs"],
  args: { legend: "Billing cadence", options: cadence, defaultValue: "monthly" },
  render: (args) => (
    <div className="grid max-w-md gap-6">
      <SegmentedControl {...args} legend="Weighted 1 : 2" />
      <SegmentedControl
        legend="Small, weighted 5 : 9"
        options={roles}
        defaultValue="moderator"
        size="sm"
        className="w-54 max-w-full"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The wide option takes two thirds of the track, and the thumb follows it there.
    const root = canvasElement.querySelector<HTMLElement>("[data-slot=segmented-control]")!;
    const [monthly, yearly] = within(root).getAllByRole("radio");
    await expect(
      yearly.getBoundingClientRect().width / monthly.getBoundingClientRect().width,
    ).toBeCloseTo(2, 1);
    await userEvent.click(yearly);
    await expectThumbOver(root, yearly);
    yearly.blur();
  },
};

export const DisabledOption: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    legend: "Listing view",
    options: views.map((v) => ({ ...v, disabled: v.value === "archived" })),
    defaultValue: "active",
    className: "max-w-md",
  },
  render: (args) => (
    <div className="grid max-w-md gap-6">
      <SegmentedControl {...args} legend="One option disabled" />
      <SegmentedControl
        legend="Whole control disabled"
        options={views}
        defaultValue="active"
        disabled
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole("radiogroup", { name: "One option disabled" });
    const archived = within(group).getByRole("radio", { name: "Archived" });
    await expect(archived).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(archived);
    await expect(archived).toHaveAttribute("aria-checked", "false");
    archived.blur();
  },
};

export const FullWidth: Story = {
  args: { legend: "Listing view", options: views, defaultValue: "drafts" },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="p-4">
      <SegmentedControl {...args} className="w-full" />
    </div>
  ),
};

function InFormSample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="grid max-w-md gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get("cadence")));
      }}
    >
      <SegmentedControl
        legend="Billing cadence"
        name="cadence"
        options={cadence}
        defaultValue="monthly"
      />
      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        <output className="text-sm text-muted-foreground">
          {submitted ? `Submitted cadence: ${submitted}` : "Not submitted yet"}
        </output>
      </div>
    </form>
  );
}

export const InForm: Story = {
  tags: ["!dev", "!autodocs"],
  args: { legend: "Billing cadence", options: cadence },
  render: () => <InFormSample />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Yearly, billed once" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByText("Submitted cadence: yearly")).toBeVisible();
    canvas.getByRole("button", { name: "Save" }).blur();
  },
};

export const Keyboard: Story = {
  tags: ["!dev", "!autodocs"],
  args: { legend: "Listing view", options: views, defaultValue: "active", className: "max-w-md" },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>("[data-slot=segmented-control]")!;
    await expect(canvas.getByRole("radiogroup", { name: "Listing view" })).toBeVisible();
    await document.fonts.ready;
    const before = lefts(root);
    // Tab reaches the checked option; arrows move and check, as in the stock RadioGroup.
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Active" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    const drafts = canvas.getByRole("radio", { name: "Drafts" });
    await waitFor(() => expect(drafts).toHaveAttribute("aria-checked", "true"));
    await expect(drafts).toHaveFocus();
    await expectThumbOver(root, drafts);
    // The focus outline is drawn inside the focused segment.
    const label = drafts.parentElement!.querySelector<HTMLElement>(
      "[data-slot=segmented-control-label]",
    )!;
    await expect(getComputedStyle(label).outlineStyle).toBe("solid");
    await expect(getComputedStyle(label).outlineWidth).toBe("2px");
    await expect(getComputedStyle(label).outlineOffset).toBe("-2px");
    // Arrows wrap, and selection never moves a label.
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() =>
      expect(canvas.getByRole("radio", { name: "Active" })).toHaveAttribute("aria-checked", "true"),
    );
    await expect(
      Math.max(...lefts(root).map((left, i) => Math.abs(left - before[i]))),
    ).toBeLessThan(1);
  },
};

export const RightToLeft: Story = {
  tags: ["!dev", "!autodocs"],
  args: { legend: "Billing cadence", options: cadence, defaultValue: "monthly" },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="max-w-md">
        <SegmentedControl {...args} />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>("[data-slot=segmented-control]")!;
    const monthly = canvas.getByRole("radio", { name: "Monthly" });
    const yearly = canvas.getByRole("radio", { name: "Yearly, billed once" });
    // The first option sits on the right, and ArrowLeft moves to the next one.
    await expect(monthly.getBoundingClientRect().left).toBeGreaterThan(
      yearly.getBoundingClientRect().left,
    );
    await expectThumbOver(root, monthly);
    await userEvent.click(monthly);
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(yearly).toHaveAttribute("aria-checked", "true"));
    await expectThumbOver(root, yearly);
  },
};
