import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import * as Stock from "@/components/ui/tabs";
import { getAgent } from "./agent";
import * as Sdk from "./tabs-sdk";

// Port trial: the stock Base UI Tabs beside the same component on UI SDK.
// Findings: side-session notes, ds-ui-sdk-port-trial.md.

const meta = {
  title: "Lab/UI SDK/Tabs",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Lib = "stock" | "sdk";
const libs = { stock: Stock, sdk: Sdk } as const;
const names = { stock: "Stock tabs", sdk: "UI SDK tabs" } as const;

const panels = [
  { value: "overview", label: "Overview", body: "A short summary of the sample item." },
  { value: "activity", label: "Activity", body: "Three updates in the last week." },
  { value: "files", label: "Files", body: "Two attachments, both placeholders." },
  { value: "settings", label: "Settings", body: "Visibility and notification options." },
];

function SampleTabs({
  lib,
  variant,
  orientation,
  disabled,
}: {
  lib: Lib;
  variant?: "default" | "line";
  orientation?: "horizontal" | "vertical";
  disabled?: string;
}) {
  const { Tabs, TabsContent, TabsList, TabsTrigger } = libs[lib];
  return (
    <Tabs defaultValue="overview" orientation={orientation} className="max-w-md">
      <TabsList variant={variant} aria-label={names[lib]}>
        {panels.map((p) => (
          <TabsTrigger key={p.value} value={p.value} disabled={p.value === disabled}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((p) => (
        <TabsContent key={p.value} value={p.value} className="p-2">
          {p.body}
        </TabsContent>
      ))}
    </Tabs>
  );
}

const cases = [
  { name: "Default", props: {} },
  { name: "Line", props: { variant: "line" } },
  { name: "Vertical", props: { orientation: "vertical" } },
  { name: "Disabled tab", props: { disabled: "files" } },
] as const;

function Column({ lib }: { lib: Lib }) {
  return (
    <div className="grid gap-6">
      <p className="text-sm font-medium">{lib === "stock" ? "Stock (Base UI)" : "UI SDK"}</p>
      {cases.map((c) => (
        <div key={c.name} className="grid gap-1">
          <p className="text-xs text-muted-foreground">{c.name}</p>
          <SampleTabs lib={lib} {...c.props} />
        </div>
      ))}
    </div>
  );
}

export const StockTabs: Story = { render: () => <Column lib="stock" /> };

export const SdkTabs: Story = { render: () => <Column lib="sdk" /> };

export const SideBySide: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <Column lib="stock" />
      <Column lib="sdk" />
    </div>
  ),
};

// The stock story's keyboard play, run against each library.
const keyboard: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  const activity = canvas.getByRole("tab", { name: "Activity" });
  await expect(activity).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(canvas.getByText("Three updates in the last week.")).toBeVisible();
};

export const StockKeyboardNavigation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SampleTabs lib="stock" />,
  play: keyboard,
};

export const SdkKeyboardNavigation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SampleTabs lib="sdk" />,
  play: keyboard,
};

// The agent bridge lists only UI SDK parts: it can read and change the SDK tabs and
// cannot see the stock ones on the same page.
export const AgentBridge: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <SampleTabs lib="stock" />
      <SampleTabs lib="sdk" />
    </div>
  ),
  play: async ({ canvas }) => {
    const agent = getAgent();
    await waitFor(() =>
      expect(agent.snapshot().map((c) => "label" in c && c.label)).toContain(names.sdk),
    );
    const labels = agent.snapshot().map((c) => "label" in c && c.label);
    await expect(labels).not.toContain(names.stock);

    const sdk = await agent.act({
      steps: [{ ref: names.sdk, action: "setValue", args: ["files"] }],
    });
    await expect(sdk.ok).toBe(true);
    const [, sdkFiles] = canvas.getAllByRole("tab", { name: "Files" });
    await expect(sdkFiles).toHaveAttribute("aria-selected", "true");

    const stock = await agent.act({
      steps: [{ ref: names.stock, action: "setValue", args: ["files"] }],
    });
    await expect(stock.ok).toBe(false);
  },
};
