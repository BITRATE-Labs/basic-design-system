import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const options = [
  { value: "pickup", label: "Pick-up", description: "Collect from the sample address." },
  { value: "post", label: "Post", description: "Two to four working days." },
  { value: "courier", label: "Courier", description: "Next day, where available." },
];

function Delivery({
  defaultValue,
  disabled,
  disabledItem,
  invalid,
}: {
  defaultValue?: string;
  disabled?: boolean;
  disabledItem?: string;
  invalid?: boolean;
}) {
  return (
    <FieldSet className="max-w-sm">
      <FieldLegend variant="label">Delivery</FieldLegend>
      <FieldDescription>How the buyer receives the sample item.</FieldDescription>
      <RadioGroup
        defaultValue={defaultValue}
        disabled={disabled}
        aria-describedby={invalid ? "radio-delivery-error" : undefined}
      >
        {options.map((option) => (
          <Field
            key={option.value}
            orientation="horizontal"
            data-invalid={invalid || undefined}
            data-disabled={disabled || option.value === disabledItem || undefined}
          >
            <RadioGroupItem
              id={`radio-${option.value}`}
              value={option.value}
              disabled={option.value === disabledItem}
              aria-invalid={invalid || undefined}
            />
            <FieldContent>
              <FieldLabel htmlFor={`radio-${option.value}`}>{option.label}</FieldLabel>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
      {invalid && <FieldError id="radio-delivery-error">Choose how to deliver.</FieldError>}
    </FieldSet>
  );
}

const meta = {
  title: "Components/Radio group",
  component: Delivery,
  args: { defaultValue: "post" },
} satisfies Meta<typeof Delivery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoSelection: Story = {
  tags: ["!dev", "!autodocs"],
  args: { defaultValue: undefined },
};

export const DisabledItem: Story = {
  tags: ["!dev", "!autodocs"],
  args: { disabledItem: "courier" },
};

export const Disabled: Story = { tags: ["!dev", "!autodocs"], args: { disabled: true } };

export const Invalid: Story = { args: { defaultValue: undefined, invalid: true } };

export const KeyboardSelection: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Pick-up"));
    await expect(canvas.getByRole("radio", { name: "Pick-up" })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    const post = canvas.getByRole("radio", { name: "Post" });
    await expect(post).toBeChecked();
    await expect(post).toHaveFocus();
  },
};
