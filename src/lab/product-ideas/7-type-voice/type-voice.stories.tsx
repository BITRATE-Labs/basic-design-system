import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { brands } from "../../../../dist/tokens";
import { PageHeader, Samples, UsageCard } from "./samples";
import "./type-voice.css";

const meta = {
  title: "Lab/Product ideas/7. Type voice",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: "Stock sizes", idea: "" },
  { label: "Role-named type scale (Perkcord)", idea: "role-scale" },
  {
    label: "Role scale with eyebrow and display heading (Perkcord + Loominist)",
    idea: "role-scale eyebrow-display",
  },
];

function Option({ label, idea, children }: { label: string; idea: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="flex min-w-0 flex-col gap-4">
      <p className="border-b pb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div data-idea={idea || undefined}>{children}</div>
    </section>
  );
}

export const Compare: Story = {
  render: () => (
    <div className="grid gap-10 xl:grid-cols-3">
      {options.map((o) => (
        <Option key={o.label} {...o}>
          <Samples />
        </Option>
      ))}
    </div>
  ),
};

// The same page header and card in every brand at once, so the display faces can be compared
// (Loominist's display face is Cormorant Garamond; the others use their sans or grotesk).
// The light/dark toolbar still applies.
export const AllBrands: Story = {
  name: "All brands",
  render: () => (
    <div className="flex flex-col gap-6">
      {brands.map((brand) => (
        <div
          key={brand}
          data-brand={brand}
          className="grid gap-6 rounded-lg bg-background p-4 font-sans text-foreground xl:grid-cols-3"
        >
          {options.map((o) => (
            <Option key={o.label} label={`${brand}: ${o.label}`} idea={o.idea}>
              <div className="flex flex-col gap-4">
                <PageHeader />
                <UsageCard />
              </div>
            </Option>
          ))}
        </div>
      ))}
    </div>
  ),
};
