import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Components/Field",
  component: Field,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="field-display-name">Display name</FieldLabel>
      <Input id="field-display-name" placeholder="Sample Person" />
      <FieldDescription>Shown next to your items.</FieldDescription>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="field-quantity">Quantity</FieldLabel>
        <FieldDescription>Between 1 and 99.</FieldDescription>
      </FieldContent>
      <Input id="field-quantity" type="number" defaultValue={3} className="w-20" />
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field data-disabled="true">
      <FieldLabel htmlFor="field-workspace-id">Workspace ID</FieldLabel>
      <Input id="field-workspace-id" defaultValue="ws-000-sample" disabled />
      <FieldDescription>Set when the workspace is created.</FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-email">Email</FieldLabel>
      <Input
        id="field-email"
        type="email"
        defaultValue="not-an-email"
        aria-invalid
        aria-describedby="field-email-error"
      />
      <FieldError id="field-email-error">Enter an email address like name@example.com.</FieldError>
    </Field>
  ),
};

export const MultipleErrors: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-password">Password</FieldLabel>
      <Input
        id="field-password"
        type="password"
        defaultValue="abc"
        aria-invalid
        aria-describedby="field-password-error"
      />
      <FieldError
        id="field-password-error"
        errors={[{ message: "Use at least 12 characters." }, { message: "Include a number." }]}
      />
    </Field>
  ),
};

export const Group: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Shipping address</FieldLegend>
      <FieldDescription>Used for sample orders only.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="field-street">Street</FieldLabel>
          <Input id="field-street" placeholder="1 Example Road" />
        </Field>
        <FieldSeparator />
        <Field>
          <FieldLabel htmlFor="field-city">City</FieldLabel>
          <Input id="field-city" placeholder="Sampletown" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

export const LabelFocusesInput: Story = {
  render: Default.render,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Display name"));
    const input = canvas.getByRole("textbox", { name: "Display name" });
    await expect(input).toHaveFocus();
    await userEvent.keyboard("Sample Person");
    await expect(input).toHaveValue("Sample Person");
  },
};
