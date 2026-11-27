import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>
        <Spinner data-icon="inline-start" />
        Saving
      </Button>
      <Button variant="outline" disabled>
        <Spinner data-icon="inline-start" />
        Loading items
      </Button>
      <Button variant="outline" size="icon" disabled aria-label="Refreshing">
        <Spinner />
      </Button>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Loading sample items
    </div>
  ),
};
