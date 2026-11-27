import { ArchiveIcon, EllipsisIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Synthetic review queue. Row 2 is the current (selected) row; rows 2 and 3 start checked.
export const items = [
  {
    id: "SMP-101",
    title: "Sample listing needs a photo",
    from: "name@example.com",
    status: "Open",
  },
  {
    id: "SMP-102",
    title: "Placeholder report about a title",
    from: "user@example.com",
    status: "Open",
  },
  {
    id: "SMP-103",
    title: "Example request to change a price",
    from: "test@example.com",
    status: "Waiting",
  },
  {
    id: "SMP-104",
    title: "Demo question about shipping",
    from: "name@example.org",
    status: "Closed",
  },
];
const selectedId = "SMP-102";
const checkedIds = ["SMP-102", "SMP-103"];

function RowActions({ label }: { label: string }) {
  return (
    <div data-reveal-target className="flex gap-1">
      <Button variant="ghost" size="icon-sm" aria-label={`Archive ${label}`}>
        <ArchiveIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${label}`}>
        <EllipsisIcon />
      </Button>
    </div>
  );
}

/** A stack of stock Cards, one per row: the stock way to list items. */
export function CardRows() {
  return (
    <div role="list" aria-label="Review queue" className="flex flex-col gap-2">
      {items.map((item) => (
        <Card
          key={item.id}
          role="listitem"
          size="sm"
          aria-current={item.id === selectedId ? "true" : undefined}
          className="flex-row items-start"
        >
          <div className="ps-(--card-spacing) pt-0.5">
            <Checkbox
              defaultChecked={checkedIds.includes(item.id)}
              aria-label={`Select ${item.id}`}
            />
          </div>
          <CardHeader className="flex-1 ps-0">
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>
              {item.id} · {item.from} · {item.status}
            </CardDescription>
            <CardAction>
              <RowActions label={item.id} />
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

/** The stock Table with a checkbox column, a selected row and a trailing actions cell. */
export function TableRows() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">
            <span className="sr-only">Select</span>
          </TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} data-state={item.id === selectedId ? "selected" : undefined}>
            <TableCell>
              <Checkbox
                defaultChecked={checkedIds.includes(item.id)}
                aria-label={`Select ${item.id}`}
              />
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Closed" ? "outline" : "secondary"}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end">
                <RowActions label={item.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function Subjects() {
  return (
    <div className="flex flex-col gap-6">
      <CardRows />
      <TableRows />
    </div>
  );
}
