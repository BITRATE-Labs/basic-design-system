import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Components/Field",
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="field-display-name">Display name</FieldLabel>
      <Input id="field-display-name" placeholder="Example Person" />
      <FieldDescription>Shown next to your listings.</FieldDescription>
    </Field>
  ),
};
