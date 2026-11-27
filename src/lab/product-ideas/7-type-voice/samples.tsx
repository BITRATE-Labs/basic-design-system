import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// The eyebrow is in the markup everywhere; only the eyebrow-display scope shows it.
function Eyebrow({ children }: { children: string }) {
  return <span data-type-role="eyebrow">{children}</span>;
}

// The heading classes are the stock repository's own (Examples / Settings form), so the stock
// column shows what a product gets today; the option scopes override them.
export function PageHeader() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <Eyebrow>Workspace</Eyebrow>
        <h1 className="font-display text-2xl font-semibold">Sample workspace settings</h1>
        <p className="text-sm text-muted-foreground">
          Sample workspace, for review only. Changes apply to every member.
        </p>
      </div>
      <Button variant="outline">Export</Button>
    </header>
  );
}

export function UsageCard() {
  return (
    <Card>
      <CardHeader>
        <Eyebrow>Plan</Eyebrow>
        <CardTitle>Usage this month</CardTitle>
        <CardDescription>Placeholder figures for the sample workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          The sample workspace has used 1,240 of 5,000 messages. The count resets on the first of
          each month.
        </p>
      </CardContent>
    </Card>
  );
}

export function FormSection() {
  const id = useId();
  return (
    <FieldSet>
      {/* A legend renders first in its fieldset wherever it sits, so the eyebrow goes inside it. */}
      <FieldLegend>
        <Eyebrow>Notifications</Eyebrow>
        Email digest
      </FieldLegend>
      <FieldDescription>Choose where the weekly summary goes.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>Digest address</FieldLabel>
          <Input id={`${id}-email`} type="email" defaultValue="name@example.com" />
          <FieldDescription>
            One address. Members can opt out from the email itself.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

const activity = [
  { item: "Sample lamp", change: "Price updated", when: "2 hours ago" },
  { item: "Placeholder mug", change: "Listing published", when: "Yesterday" },
];

export function ActivityTable() {
  return (
    <section className="flex flex-col gap-2">
      <div>
        <Eyebrow>Activity</Eyebrow>
        <h2 className="text-base font-medium">Recent changes</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Change</TableHead>
            <TableHead className="text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activity.map((a) => (
            <TableRow key={a.item}>
              <TableCell className="font-medium">{a.item}</TableCell>
              <TableCell>{a.change}</TableCell>
              <TableCell className="text-right">{a.when}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

export function Samples() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader />
      <UsageCard />
      <FormSection />
      <ActivityTable />
    </div>
  );
}
