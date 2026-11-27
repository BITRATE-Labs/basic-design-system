import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, waitFor } from "storybook/test";
import {
  DatePicker,
  DatePickerContent,
  DatePickerGroup,
  DatePickerInput,
  DatePickerTrigger,
} from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

// `today` is fixed so screenshots do not change from day to day.
const today = "2026-10-14";

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  decorators: [
    (Story) => (
      <div className="flex max-w-xs flex-col gap-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function SamplePicker(props: React.ComponentProps<typeof DatePicker>) {
  const [value, setValue] = useState(props.defaultValue ?? null);
  return (
    <>
      <Label htmlFor="due-date">Due date</Label>
      <DatePicker
        today={today}
        locale="en-US"
        {...props}
        defaultValue={undefined}
        value={value}
        onValueChange={(next) => setValue(next)}
      >
        <DatePickerGroup>
          <DatePickerInput id="due-date" placeholder="MM/DD/YYYY" />
          <DatePickerTrigger />
        </DatePickerGroup>
        <DatePickerContent />
      </DatePicker>
      <p className="text-sm text-muted-foreground">Value: {String(value ?? "none")}</p>
    </>
  );
}

export const Empty: Story = { render: () => <SamplePicker /> };

export const WithValue: Story = { render: () => <SamplePicker defaultValue="2026-10-16" /> };

export const Disabled: Story = {
  render: () => <SamplePicker defaultValue="2026-10-16" disabled />,
};

export const Open: Story = {
  render: () => <SamplePicker defaultValue="2026-10-16" />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Choose date/ }));
    const popup = await screen.findByRole("dialog");
    await waitFor(() => expect(popup).toBeVisible());
    // Opening focuses the selected date.
    await waitFor(() =>
      expect(screen.getByRole("gridcell", { name: /October 16, 2026/ })).toHaveFocus(),
    );
  },
};

export const PickFromCalendar: Story = {
  render: () => <SamplePicker defaultValue="2026-10-16" />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Choose date/ });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("gridcell", { name: /October 20, 2026/ }));
    await expect(canvas.getByText("Value: 2026-10-20")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Due date")).toHaveValue("10/20/2026");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const TypedDate: Story = {
  render: () => <SamplePicker />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Due date"), "11/02/2026{Enter}");
    await expect(canvas.getByText("Value: 2026-11-02")).toBeInTheDocument();
  },
};

export const Invalid: Story = {
  render: () => <SamplePicker />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("Due date");
    await userEvent.type(input, "not a date{Enter}");
    await waitFor(() => expect(input).toHaveAttribute("data-invalid"));
    await expect(canvas.getByText("Value: none")).toBeInTheDocument();
  },
};
