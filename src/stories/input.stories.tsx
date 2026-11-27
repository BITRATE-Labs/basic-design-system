import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Components/Input",
  component: Input,
  args: { placeholder: "Sample text", "aria-label": "Sample input" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
