import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { sku: "SMP-001", item: "Sample lamp", status: "In stock", qty: 12, price: 24 },
  { sku: "SMP-002", item: "Placeholder mug", status: "Low stock", qty: 3, price: 9 },
  { sku: "SMP-003", item: "Example notebook", status: "In stock", qty: 40, price: 6 },
  { sku: "SMP-004", item: "Demo poster", status: "Sold out", qty: 0, price: 15 },
];

const money = (n: number) => `$${n.toFixed(2)}`;

function Head() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>SKU</TableHead>
        <TableHead>Item</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Qty</TableHead>
        <TableHead className="text-right">Price</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function Body({ selected }: { selected?: string }) {
  return (
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.sku} data-state={r.sku === selected ? "selected" : undefined}>
          <TableCell className="font-medium">{r.sku}</TableCell>
          <TableCell>{r.item}</TableCell>
          <TableCell>{r.status}</TableCell>
          <TableCell className="text-right">{r.qty}</TableCell>
          <TableCell className="text-right">{money(r.price)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Sample inventory.</TableCaption>
      <Head />
      <Body />
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <Head />
      <Body />
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">{rows.reduce((n, r) => n + r.qty, 0)}</TableCell>
          <TableCell className="text-right">
            {money(rows.reduce((n, r) => n + r.qty * r.price, 0))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const SelectedRow: Story = {
  render: () => (
    <Table>
      <Head />
      <Body selected="SMP-002" />
    </Table>
  ),
};

export const Empty: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Table>
      <Head />
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
            No sample items.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Cells do not wrap, so a narrow container scrolls the table sideways.
export const Overflow: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="w-80 rounded-md border">
      <Table>
        <Head />
        <Body />
      </Table>
    </div>
  ),
};
