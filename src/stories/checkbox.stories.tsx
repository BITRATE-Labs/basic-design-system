import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Sample option" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Checkbox aria-label="Disabled, off" disabled />
      <Checkbox aria-label="Disabled, on" disabled defaultChecked />
    </div>
  ),
};

export const InField: Story = {
  render: () => (
    <Field orientation="horizontal" className="max-w-sm">
      <Checkbox id="checkbox-search" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="checkbox-search">Show the item in search</FieldLabel>
        <FieldDescription>Hidden items are only visible by link.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field orientation="horizontal" data-invalid="true" className="max-w-sm">
      <Checkbox id="checkbox-rules" aria-invalid aria-describedby="checkbox-rules-error" />
      <FieldContent>
        <FieldLabel htmlFor="checkbox-rules">I have read the sample rules</FieldLabel>
        <FieldError id="checkbox-rules-error">Accept the rules to continue.</FieldError>
      </FieldContent>
    </Field>
  ),
};

const topics = [
  { id: "replies", label: "Replies to my items", checked: true },
  { id: "offers", label: "New offers", checked: true },
  { id: "digest", label: "Weekly digest", checked: false },
];

export const Group: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend variant="label">Email me about</FieldLegend>
      <FieldGroup className="gap-3">
        {topics.map((topic) => (
          <Field key={topic.id} orientation="horizontal">
            <Checkbox id={`checkbox-${topic.id}`} defaultChecked={topic.checked} />
            <FieldLabel htmlFor={`checkbox-${topic.id}`} className="font-normal">
              {topic.label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  ),
};

export const ToggleWithLabel: Story = {
  render: InField.render,
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Show the item in search" });
    await expect(checkbox).toBeChecked();
    await userEvent.click(canvas.getByText("Show the item in search"));
    await expect(checkbox).not.toBeChecked();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
  },
};
