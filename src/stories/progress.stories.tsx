import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: { value: 40, "aria-label": "Upload progress" },
  argTypes: { value: { control: { type: "range", min: 0, max: 100 } } },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <Progress value={args.value}>
      <ProgressLabel>Uploading sample file</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar", { name: "Uploading sample file" })).toBeVisible();
    await expect(canvas.getByText("40%")).toBeVisible();
  },
};

export const Complete: Story = { args: { value: 100 } };

export const Indeterminate: Story = {
  args: { value: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  },
};
