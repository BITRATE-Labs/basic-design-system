import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const conditions = [
  { label: "New", value: "new" },
  { label: "Like new", value: "like-new" },
  { label: "Used", value: "used" },
];

const places = ["Sampletown", "Example City", "Placeholder Bay", "Testville"];

const delivery = [
  { value: "pickup", label: "Pick-up only" },
  { value: "post", label: "Pick-up or post" },
];

function ListingForm() {
  return (
    <form className="mx-auto flex max-w-xl flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <FieldSet>
        <FieldLegend>Item</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="listing-title">Title</FieldLabel>
            <Input id="listing-title" defaultValue="Sample desk lamp" />
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="listing-description">Description</FieldLabel>
            <Textarea
              id="listing-description"
              defaultValue="Works."
              aria-invalid
              aria-describedby="listing-description-error"
            />
            <FieldError id="listing-description-error">Write at least 20 characters.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="listing-condition">Condition</FieldLabel>
            <Select items={conditions} defaultValue="like-new">
              <SelectTrigger id="listing-condition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="listing-place">Location</FieldLabel>
            <Combobox items={places} defaultValue="Sampletown">
              <ComboboxInput id="listing-place" className="w-full" />
              <ComboboxContent>
                <ComboboxEmpty>No places found.</ComboboxEmpty>
                <ComboboxList>
                  {(place: string) => (
                    <ComboboxItem key={place} value={place}>
                      {place}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FieldDescription>Only the town is shown.</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend variant="label">Delivery</FieldLegend>
        <RadioGroup defaultValue="post">
          {delivery.map((d) => (
            <Field key={d.value} orientation="horizontal">
              <RadioGroupItem id={`listing-${d.value}`} value={d.value} />
              <FieldLabel htmlFor={`listing-${d.value}`} className="font-normal">
                {d.label}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>

      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="listing-offers">Accept offers</FieldLabel>
            <FieldDescription>Buyers can suggest a different price.</FieldDescription>
          </FieldContent>
          <Switch id="listing-offers" defaultChecked />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="listing-rules" defaultChecked />
          <FieldLabel htmlFor="listing-rules" className="font-normal">
            The item follows the sample listing rules
          </FieldLabel>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline">
          Discard
        </Button>
        <Button type="submit">Publish</Button>
      </div>
    </form>
  );
}

const meta = {
  title: "Examples/Listing form",
  component: ListingForm,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ListingForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
