import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
import "./lists-and-rows.css";
import { Subjects } from "./rows";

type Args = { revealActions: boolean };

const meta = {
  title: "Lab/Product ideas/6. Lists and rows",
  parameters: { layout: "padded" },
  args: { revealActions: false },
  argTypes: {
    revealActions: {
      name: "Hover-reveal secondary actions (Chronote)",
      control: "boolean",
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

function Option({
  label,
  idea,
  emulatePointer,
  children,
}: {
  label: string;
  idea: string;
  emulatePointer?: "coarse";
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="flex min-w-0 flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <div data-idea={idea || undefined} data-emulate-pointer={emulatePointer}>
        {children}
      </div>
    </section>
  );
}

const ideas = (base: string, reveal: boolean) =>
  [base, reveal ? "reveal-actions" : ""].filter(Boolean).join(" ");

export const Compare: Story = {
  render: ({ revealActions }) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <Option label="Stock: a stack of Cards and the stock Table" idea={ideas("", revealActions)}>
        <Subjects />
      </Option>
      <Option label="One-surface ruled list (drasil)" idea={ideas("ruled-list", revealActions)}>
        <Subjects />
      </Option>
    </div>
  ),
};

export const CompareWithRevealActions: Story = {
  name: "Compare with reveal actions",
  args: { revealActions: true },
  render: Compare.render,
};

// Ruled list, keyboard focus on the third row's checkbox: the focus-within highlight (selecta),
// beside the selected rail on row 2 and the checked wash on rows 2 and 3.
export const RuledListFocusWithin: Story = {
  name: "Ruled list: focus within a row",
  render: Compare.render,
  play: async ({ canvasElement }) => {
    const ruled = within(
      canvasElement.querySelector<HTMLElement>('[aria-label="One-surface ruled list (drasil)"]')!,
    );
    const box = ruled.getAllByRole("checkbox", { name: "Select SMP-104" })[0];
    box.focus();
    await expect(box).toHaveFocus();
  },
};

// Ruled list: unchecking row 2 leaves only the rail; checking row 1 adds a wash without a rail.
export const RuledListStates: Story = {
  name: "Ruled list: selected and checked are separate",
  render: () => (
    <div className="max-w-2xl">
      <Option label="One-surface ruled list (drasil)" idea="ruled-list">
        <Subjects />
      </Option>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [cardRow2] = canvas.getAllByRole("checkbox", { name: "Select SMP-102" });
    const [cardRow1] = canvas.getAllByRole("checkbox", { name: "Select SMP-101" });
    await userEvent.click(cardRow2);
    await userEvent.click(cardRow1);
    await expect(cardRow2).not.toBeChecked();
    await expect(cardRow1).toBeChecked();
  },
};

// Hover reveal: on a device that can hover, actions show only on the row under the pointer or
// holding focus. Tab into the row 3 actions to see the focus-within reveal.
export const RevealActionsFocus: Story = {
  name: "Reveal actions: keyboard focus",
  args: { revealActions: true },
  render: Compare.render,
  play: async ({ canvasElement }) => {
    const ruled = within(
      canvasElement.querySelector<HTMLElement>('[aria-label="One-surface ruled list (drasil)"]')!,
    );
    const archive = ruled.getAllByRole("button", { name: "Archive SMP-103" })[0];
    archive.focus();
    await expect(archive).toHaveFocus();
  },
};

// What a touch device (pointer: coarse, hover: none) gets: every row's actions stay visible.
// Storybook cannot switch the media feature, so this sets the lab-only data-emulate-pointer hook
// that stands in for it. A real touch device or devtools touch emulation shows the same thing.
export const RevealActionsCoarsePointer: Story = {
  name: "Reveal actions: coarse pointer",
  render: () => (
    <div className="grid gap-8 lg:grid-cols-2">
      <Option
        label="Fine pointer: actions hidden until hover or focus"
        idea="ruled-list reveal-actions"
      >
        <Subjects />
      </Option>
      <Option
        label="Coarse pointer (emulated): actions always visible"
        idea="ruled-list reveal-actions"
        emulatePointer="coarse"
      >
        <Subjects />
      </Option>
    </div>
  ),
};
