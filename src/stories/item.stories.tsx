import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileTextIcon, ImageIcon, MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

// The ruled list is the stock Item with <ItemGroup data-variant="ruled">, styled by theme CSS
// (tokens/css/ruled-list.css). ItemGroup is role="list", so each Item is a listitem.
const meta = {
  title: "Components/Item",
  component: ItemGroup,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ItemGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const queue = [
  { id: "SMP-101", title: "Sample listing needs a photo", from: "name@example.com" },
  { id: "SMP-102", title: "Placeholder report about a title", from: "user@example.com" },
  { id: "SMP-103", title: "Example request to change a price", from: "test@example.com" },
  { id: "SMP-104", title: "Demo question about shipping", from: "name@example.org" },
];

export const Ruled: Story = {
  render: () => (
    <ItemGroup data-variant="ruled" aria-label="Review queue">
      {queue.map((row) => (
        <Item key={row.id} role="listitem">
          <ItemContent>
            <ItemTitle>{row.title}</ItemTitle>
            <ItemDescription>
              {row.id} · {row.from}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
};

// The current row is the one whose link has aria-current: it gets the rail and a step of ink.
// The checkboxes are batch selection, a separate wash. Each title link covers its row.
function SelectableList() {
  const [current, setCurrent] = useState("SMP-102");
  return (
    <ItemGroup data-variant="ruled" aria-label="Review queue">
      {queue.map((row) => (
        <Item key={row.id} role="listitem" className="relative">
          <ItemMedia className="relative z-10">
            <Checkbox
              defaultChecked={row.id === "SMP-102" || row.id === "SMP-103"}
              aria-label={`Select ${row.id}`}
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              <a
                href={`#${row.id}`}
                aria-current={row.id === current ? "true" : undefined}
                className="after:absolute after:inset-0"
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(row.id);
                }}
              >
                {row.title}
              </a>
            </ItemTitle>
            <ItemDescription>
              {row.id} · {row.from}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}

export const Selectable: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SelectableList />,
  play: async ({ canvas, userEvent }) => {
    const second = canvas.getByRole("link", { name: queue[1].title });
    await expect(second).toHaveAttribute("aria-current", "true");
    await userEvent.click(canvas.getByRole("link", { name: queue[0].title }));
    await expect(canvas.getByRole("link", { name: queue[0].title })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(second).not.toHaveAttribute("aria-current");
    await userEvent.click(second);
  },
};

const files = [
  { icon: FileTextIcon, title: "Sample terms draft", meta: "2 min ago" },
  { icon: ImageIcon, title: "Placeholder cover image", meta: "1 h ago" },
  { icon: MessageSquareIcon, title: "Example thread about a delivery", meta: "Yesterday" },
  { icon: FileTextIcon, title: "Demo price sheet", meta: "3 days ago" },
];

export const IconAndMeta: Story = {
  name: "Icon and meta",
  render: () => (
    <ItemGroup data-variant="ruled" aria-label="Recent files">
      {files.map(({ icon: Icon, title, meta }) => (
        <Item key={title} role="listitem">
          <ItemMedia variant="icon">
            <Icon aria-hidden />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{title}</ItemTitle>
          </ItemContent>
          <ItemActions className="text-sm text-muted-foreground">{meta}</ItemActions>
        </Item>
      ))}
    </ItemGroup>
  ),
};

const activity = Array.from({ length: 12 }, (_, i) => ({
  id: `SMP-${201 + i}`,
  title: `Sample update number ${i + 1}`,
  detail: i % 3 === 0 ? "Placeholder price change" : "Example status change",
}));

// A long list inside a Card: the card is the one surface (data-fill="uniform", the even fill
// for long lists), and the list sits flush inside it with no box of its own.
export const LongListInCard: Story = {
  name: "Long list in a card",
  render: () => (
    <Card data-fill="uniform" className="pb-0">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Twelve sample updates.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ItemGroup data-variant="ruled" aria-label="Recent activity">
          {activity.map((row) => (
            <Item key={row.id} role="listitem" size="sm">
              <ItemContent>
                <ItemTitle>{row.title}</ItemTitle>
                <ItemDescription>{row.detail}</ItemDescription>
              </ItemContent>
              <ItemActions className="text-sm text-muted-foreground">{row.id}</ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  ),
};

// The selectable list without the click check, for reading.
export const SelectableRows: Story = {
  ...Selectable,
  name: "Selectable",
  tags: [],
  play: undefined,
};
