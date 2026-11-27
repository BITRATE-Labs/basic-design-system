import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Alert",
  component: Alert,
  args: { variant: "default" },
  argTypes: { variant: { control: "select", options: ["default", "destructive"] } },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon />
      <AlertTitle>Sync paused</AlertTitle>
      <AlertDescription>
        Changes to the sample workspace sync again in a few minutes.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args}>
      <CircleAlertIcon />
      <AlertTitle>Upload failed</AlertTitle>
      <AlertDescription>
        The sample file is larger than 10 MB. Choose a smaller file.
      </AlertDescription>
    </Alert>
  ),
};

// Stock Alert has no success, warning or info variant; theme CSS draws them from
// data-tone with the status soft, soft-foreground and line roles. The title names the
// status, because forced colours draw every line in the same colour.
export const Tones: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert data-tone="success">
        <CircleCheckIcon />
        <AlertTitle>Success: sample export finished</AlertTitle>
        <AlertDescription>The sample report is ready to download.</AlertDescription>
      </Alert>
      <Alert data-tone="warning">
        <TriangleAlertIcon />
        <AlertTitle>Warning: storage almost full</AlertTitle>
        <AlertDescription>The sample workspace has used 92% of its space.</AlertDescription>
      </Alert>
      <Alert data-tone="info">
        <InfoIcon />
        <AlertTitle>Info: maintenance on Sunday</AlertTitle>
        <AlertDescription>Sample services pause for ten minutes at 02:00.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Error: upload failed</AlertTitle>
        <AlertDescription>The sample file is larger than 10 MB.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithoutIcon: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Read-only item</AlertTitle>
      <AlertDescription>Only the owner of the sample item can edit it.</AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon />
      <AlertTitle>Draft saved</AlertTitle>
    </Alert>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon />
      <AlertTitle>New version available</AlertTitle>
      <AlertDescription>Reload to get the latest sample data.</AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline">
          Reload
        </Button>
      </AlertAction>
    </Alert>
  ),
};
