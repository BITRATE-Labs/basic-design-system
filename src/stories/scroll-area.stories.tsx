import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { coverImage } from "./placeholder-images";

const meta = {
  title: "Components/Scroll Area",
  component: ScrollArea,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 30 }, (_, i) => `sample-tag-${String(i + 1).padStart(2, "0")}`);

function TagList() {
  return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

const viewport = (root: HTMLElement) =>
  root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

export const Vertical: Story = { render: () => <TagList /> };

export const Scrolled: Story = {
  render: () => <TagList />,
  play: async ({ canvasElement }) => {
    const el = viewport(canvasElement);
    el.scrollTop = 400;
    await waitFor(() => expect(el.scrollTop).toBeGreaterThan(0));
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-md border whitespace-nowrap">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 6 }, (_, i) => (
          <figure key={i} className="shrink-0">
            <img
              src={coverImage}
              alt={`Placeholder image ${i + 1}`}
              className="aspect-2/1 w-40 rounded-md object-cover"
            />
            <figcaption className="pt-2 text-xs text-muted-foreground">
              Sample image {i + 1}
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

// The viewport takes keyboard focus, so arrow keys and Page Down scroll it, and shows a ring.
export const KeyboardFocus: Story = {
  render: () => <TagList />,
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.tab();
    await expect(viewport(canvasElement)).toHaveFocus();
  },
};
