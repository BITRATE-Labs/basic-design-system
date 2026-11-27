import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  args: { "aria-label": "Sample setting" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch aria-label="Small" size="sm" defaultChecked />
      <Switch aria-label="Default" defaultChecked />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Switch aria-label="Disabled, off" disabled />
      <Switch aria-label="Disabled, on" disabled defaultChecked />
    </div>
  ),
};

export const InField: Story = {
  render: () => (
    <Field orientation="horizontal" className="max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="switch-away">Away mode</FieldLabel>
        <FieldDescription>Pauses offers on every sample item.</FieldDescription>
      </FieldContent>
      <Switch id="switch-away" />
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field orientation="horizontal" data-invalid="true" className="max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="switch-public">Public listing</FieldLabel>
        <FieldError id="switch-public-error">Add a photo before making it public.</FieldError>
      </FieldContent>
      <Switch id="switch-public" aria-invalid aria-describedby="switch-public-error" />
    </Field>
  ),
};

export const ToggleWithLabel: Story = {
  render: InField.render,
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Away mode" });
    await expect(control).not.toBeChecked();
    await userEvent.click(canvas.getByText("Away mode"));
    await expect(control).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(control).not.toBeChecked();
  },
};
