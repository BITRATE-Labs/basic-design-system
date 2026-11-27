import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: { placeholder: "Add a short note", "aria-label": "Note" },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue:
      "The sample item ships in a plain box.\nPick-up is possible on weekdays after five.",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Notes are locked for this item." },
};

export const InField: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="textarea-description">Description</FieldLabel>
      <Textarea id="textarea-description" placeholder="What is the sample item?" />
      <FieldDescription>Up to 500 characters.</FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="textarea-reason">Reason</FieldLabel>
      <Textarea
        id="textarea-reason"
        defaultValue="ok"
        aria-invalid
        aria-describedby="textarea-reason-error"
      />
      <FieldError id="textarea-reason-error">Write at least 20 characters.</FieldError>
    </Field>
  ),
};

export const Typing: Story = {
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Note" });
    await userEvent.tab();
    await expect(textarea).toHaveFocus();
    await userEvent.keyboard("First line{Enter}Second line");
    await expect(textarea).toHaveValue("First line\nSecond line");
  },
};
