import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { coverImage } from "./placeholder-images";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Sample project</CardTitle>
        <CardDescription>Last edited three days ago.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Placeholder summary of the sample project. It has two drafts and one published page.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Open</Button>
        <Button size="sm" variant="outline">
          Duplicate
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = { tags: ["!dev", "!autodocs"], ...Default, args: { size: "sm" } };

export const WithAction: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Weekly digest</CardTitle>
        <CardDescription>Sent every Monday.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Includes new sample items and a short summary of changes.</p>
      </CardContent>
    </Card>
  ),
};

export const HeaderOnly: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>No items yet</CardTitle>
        <CardDescription>Items you add to this sample list appear here.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card>
      <img src={coverImage} alt="Placeholder landscape" className="aspect-2/1 object-cover" />
      <CardHeader>
        <CardTitle>Sample gallery</CardTitle>
        <CardDescription>Twelve placeholder images.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button size="sm" className="w-full">
          View gallery
        </Button>
      </CardFooter>
    </Card>
  ),
};
