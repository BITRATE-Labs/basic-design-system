import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Calendar } from "@/components/ui-sdk/calendar";

// `today` is fixed so the story does not change from day to day.
const today = "2026-10-14";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  args: { today, locale: "en-US", className: "rounded-lg ring-1 ring-foreground/10" },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "2026-10-16" } };

export const Range: Story = {
  args: { mode: "range", defaultValue: ["2026-10-12", "2026-10-17"] },
};

export const MinMaxAndUnavailable: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    defaultMonth: "2026-10",
    min: "2026-10-05",
    max: "2026-10-28",
    unavailable: [{ weekday: [0, 6] }],
  },
};

export const Disabled: Story = {
  tags: ["!dev", "!autodocs"],
  args: { defaultValue: "2026-10-16", disabled: true },
};

function Picked() {
  const [value, setValue] = useState<string | null>("2026-10-16");
  return (
    <div className="flex flex-col gap-2">
      <Calendar
        today={today}
        locale="en-US"
        className="rounded-lg ring-1 ring-foreground/10"
        value={value}
        onValueChange={(next) => setValue(next as string | null)}
      />
      <p className="text-sm text-muted-foreground">Picked: {value ?? "none"}</p>
    </div>
  );
}

export const KeyboardPick: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Picked />,
  play: async ({ canvas, userEvent }) => {
    const selected = canvas.getByRole("gridcell", { name: /October 16, 2026/ });
    selected.focus();
    await expect(selected).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const next = canvas.getByRole("gridcell", { name: /October 23, 2026/ });
    await expect(next).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Picked: 2026-10-23")).toBeInTheDocument();
    await expect(next).toHaveAttribute("aria-selected", "true");
  },
};

export const NextMonth: Story = {
  tags: ["!dev", "!autodocs"],
  args: { defaultValue: "2026-10-16" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /next/i }));
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
  },
};
