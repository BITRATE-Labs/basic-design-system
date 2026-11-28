import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpRightIcon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "12" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "**When to use.** A badge is for counts and compact status in dense tables and lists, where a short label has to fit in a cell. Elsewhere, prefer inline text: write the status in the sentence or next to the heading, not in a pill.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">
        <CheckIcon data-icon="inline-start" />
        Paid
      </Badge>
      <Badge variant="outline">
        Open
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
    </div>
  ),
};

export const AsLink: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Badge render={<a href="#sample" />} variant="outline">
      3 new
    </Badge>
  ),
};

const rows = [
  { item: "Sample order 1001", comments: 4, status: "Open" },
  { item: "Sample order 1002", comments: 0, status: "Closed" },
  { item: "Sample order 1003", comments: 12, status: "Overdue" },
];

// The use the docs note allows: counts and compact status in a dense table.
export const InTable: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="w-full max-w-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.item}>
              <TableCell>{row.item}</TableCell>
              <TableCell>
                <Badge variant="secondary">{row.comments}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={row.status === "Overdue" ? "destructive" : "outline"}>
                  {row.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};
