import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { findCombobox } from "./popup-test-utils";

const items = ["Sample chair", "Sample desk", "Sample lamp", "Sample shelf", "Sample rug"];

function ItemList() {
  return (
    <ComboboxContent>
      <ComboboxEmpty>No items found.</ComboboxEmpty>
      <ComboboxList>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  );
}

function ItemCombobox({
  defaultValue,
  disabled,
  showClear,
}: {
  defaultValue?: string;
  disabled?: boolean;
  showClear?: boolean;
}) {
  return (
    <Combobox items={items} defaultValue={defaultValue}>
      <ComboboxInput
        placeholder="Search items"
        aria-label="Item"
        disabled={disabled}
        showClear={showClear}
        className="w-64"
      />
      <ItemList />
    </Combobox>
  );
}

const meta = {
  title: "Components/Combobox",
  component: ItemCombobox,
  decorators: [
    (Story) => (
      <div className="min-h-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ItemCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  tags: ["!dev", "!autodocs"],
  args: { defaultValue: "Sample lamp" },
};

export const WithClear: Story = {
  tags: ["!dev", "!autodocs"],
  args: { defaultValue: "Sample lamp", showClear: true },
};

export const Disabled: Story = {
  tags: ["!dev", "!autodocs"],
  args: { disabled: true, defaultValue: "Sample lamp" },
};

export const Open: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Item" }));
    await findCombobox("Sample shelf");
  },
};

export const Filtered: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Item" }), "sh");
    const popup = await findCombobox("Sample shelf");
    await expect(popup).not.toHaveTextContent("Sample chair");
  },
};

export const NoMatches: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Item" }), "sofa");
    await findCombobox("No items found.");
  },
};

export const ChooseWithKeyboard: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Item" });
    await userEvent.type(input, "de");
    await findCombobox("Sample desk");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(input).toHaveValue("Sample desk"));
    await waitFor(() => expect(document.querySelector("[data-slot=combobox-content]")).toBeNull());
  },
};

export const InField: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combobox-related">Related item</FieldLabel>
      <Combobox items={items}>
        <ComboboxInput id="combobox-related" placeholder="Search items" />
        <ItemList />
      </Combobox>
      <FieldDescription>Shown under the listing.</FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Field data-invalid="true" className="max-w-sm">
      <FieldLabel htmlFor="combobox-replaces">Replaces</FieldLabel>
      <Combobox items={items} defaultValue="Sample rug">
        <ComboboxInput
          id="combobox-replaces"
          aria-invalid
          aria-describedby="combobox-replaces-error"
        />
        <ItemList />
      </Combobox>
      <FieldError id="combobox-replaces-error">An item cannot replace itself.</FieldError>
    </Field>
  ),
};

function TagCombobox() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={items} multiple defaultValue={["Sample chair", "Sample desk"]}>
      <ComboboxChips ref={anchor} className="w-80">
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((value) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Add an item" aria-label="Items" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export const Multiple: Story = { render: () => <TagCombobox /> };

export const MultipleOpen: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <TagCombobox />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Items" }));
    await findCombobox("Sample lamp");
    await userEvent.click(screen.getByRole("option", { name: "Sample lamp" }));
    await waitFor(() => expect(canvas.getByText("Sample lamp")).toBeVisible());
  },
};
