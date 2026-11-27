import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findSelect } from "./popup-test-utils";

const sizes = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
  { label: "Extra large", value: "extra-large" },
];

function SizeSelect({
  defaultValue,
  disabled,
  size,
}: {
  defaultValue?: string;
  disabled?: boolean;
  size?: "sm" | "default";
}) {
  return (
    <Select items={sizes} defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger size={size} className="w-48" aria-label="Size">
        <SelectValue placeholder="Choose a size" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {sizes.map((item) => (
            <SelectItem key={item.value} value={item.value} disabled={item.value === "extra-large"}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const meta = {
  title: "Components/Select",
  component: SizeSelect,
  decorators: [
    (Story) => (
      <div className="min-h-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SizeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};

export const WithValue: Story = { args: { defaultValue: "medium" } };

export const Small: Story = { args: { size: "sm", defaultValue: "medium" } };

export const Disabled: Story = { args: { disabled: true, defaultValue: "medium" } };

export const Open: Story = {
  args: { defaultValue: "medium" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Size" }));
    await findSelect("Large");
  },
};

const categories = [
  { label: "Chairs", value: "chairs" },
  { label: "Desks", value: "desks" },
  { label: "Lamps", value: "lamps" },
  { label: "Rugs", value: "rugs" },
];

export const Groups: Story = {
  render: () => (
    <Select items={categories}>
      <SelectTrigger className="w-48" aria-label="Category">
        <SelectValue placeholder="Choose a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Furniture</SelectLabel>
          <SelectItem value="chairs">Chairs</SelectItem>
          <SelectItem value="desks">Desks</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Decor</SelectLabel>
          <SelectItem value="lamps">Lamps</SelectItem>
          <SelectItem value="rugs">Rugs</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Category" }));
    await findSelect("Decor");
  },
};

export const InField: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="select-condition">Condition</FieldLabel>
      <Select
        items={[
          { label: "New", value: "new" },
          { label: "Used", value: "used" },
        ]}
        defaultValue="used"
      >
        <SelectTrigger id="select-condition" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="used">Used</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Shown on the listing.</FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true" className="max-w-sm">
      <FieldLabel htmlFor="select-region">Region</FieldLabel>
      <Select
        items={[
          { label: "North sample region", value: "north" },
          { label: "South sample region", value: "south" },
        ]}
      >
        <SelectTrigger
          id="select-region"
          className="w-full"
          aria-invalid
          aria-describedby="select-region-error"
        >
          <SelectValue placeholder="Choose a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="north">North sample region</SelectItem>
          <SelectItem value="south">South sample region</SelectItem>
        </SelectContent>
      </Select>
      <FieldError id="select-region-error">Choose where the item is.</FieldError>
    </Field>
  ),
};

export const ChooseOption: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Size" });
    await userEvent.click(trigger);
    await findSelect();
    await userEvent.click(screen.getByRole("option", { name: "Large" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Large"));
    await waitFor(() => expect(document.querySelector("[data-slot=select-content]")).toBeNull());
  },
};
