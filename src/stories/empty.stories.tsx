import type { Meta, StoryObj } from "@storybook/react-vite";
import { InboxIcon, PlusIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const meta = {
  title: "Components/Empty",
  component: Empty,
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>No items yet</EmptyTitle>
        <EmptyDescription>Items you create in the sample workspace appear here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>
          <PlusIcon data-icon="inline-start" />
          New item
        </Button>
      </EmptyContent>
    </Empty>
  ),
};

export const Outline: Story = {
  render: () => (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>Nothing matches the sample search. Try fewer words.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Clear search</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const TextOnly: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No comments</EmptyTitle>
        <EmptyDescription>
          Be the first to comment on this sample item. <a href="#sample">Read the guidelines</a>.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};
