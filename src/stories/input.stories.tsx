import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Components/Input",
  component: Input,
  args: { placeholder: "Sample text", "aria-label": "Sample input" },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  tags: ["!dev", "!autodocs"],
  args: { defaultValue: "Weekly sample report" },
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Input type="email" placeholder="name@example.com" aria-label="Email" />
      <Input type="password" defaultValue="placeholder" aria-label="Password" />
      <Input type="number" defaultValue={12} aria-label="Quantity" />
      <Input type="search" placeholder="Search items" aria-label="Search" />
      <Input type="file" aria-label="Attachment" />
    </div>
  ),
};

export const Disabled: Story = {
  tags: ["!dev", "!autodocs"],
  args: { disabled: true, defaultValue: "Locked value" },
};

export const ReadOnly: Story = {
  tags: ["!dev", "!autodocs"],
  args: { readOnly: true, defaultValue: "Read-only value" },
};

export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Input
        aria-label="Email"
        aria-invalid
        aria-describedby="input-invalid-error"
        defaultValue="not-an-email"
      />
      <p id="input-invalid-error" className="text-sm text-destructive">
        Enter an email address like name@example.com.
      </p>
    </div>
  ),
};

export const Typing: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Sample input" });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard("Hello sample");
    await expect(input).toHaveValue("Hello sample");
  },
};
