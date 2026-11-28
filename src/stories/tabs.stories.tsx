import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const panels = [
  { value: "overview", label: "Overview", body: "A short summary of the sample item." },
  { value: "activity", label: "Activity", body: "Three updates in the last week." },
  { value: "files", label: "Files", body: "Two attachments, both placeholders." },
  { value: "settings", label: "Settings", body: "Visibility and notification options." },
];

function SampleTabs({
  variant,
  orientation,
  disabled,
}: {
  variant?: "default" | "line";
  orientation?: "horizontal" | "vertical";
  disabled?: string;
}) {
  return (
    <Tabs defaultValue="overview" orientation={orientation} className="max-w-md">
      <TabsList variant={variant}>
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

export const Default: Story = { render: () => <SampleTabs /> };

export const Line: Story = { render: () => <SampleTabs variant="line" /> };

export const Vertical: Story = { render: () => <SampleTabs orientation="vertical" /> };

export const DisabledTab: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SampleTabs disabled="files" />,
};

export const KeyboardNavigation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SampleTabs />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    const activity = canvas.getByRole("tab", { name: "Activity" });
    await expect(activity).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("Three updates in the last week.")).toBeVisible();
  },
};
