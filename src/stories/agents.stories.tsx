import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ui-sdk/react/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";

// The bridge sees only ui-sdk parts, so these stories use them directly, styled with the
// same role tokens as the stock components. tests/agent drives each one through window.agent.
const meta = { title: "Agents" } satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const field = "grid gap-2 text-sm";
const label = "font-medium";
const input =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";
const tabsList = "inline-flex w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground";
// aria-selected, not data-selected: shadcn/tailwind.css redefines data-selected: as
// [data-selected="true"], and ui-sdk writes data-selected="".
const tab =
  "rounded-md px-2 py-1 text-sm font-medium aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-sm";
const status = "text-sm text-muted-foreground";

function WorkspaceSettings() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string | null>("general");
  const [name, setName] = useState("Sample Workspace");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState<string>();

  return (
    <div className="grid justify-items-start gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={buttonVariants({ variant: "outline" })}>
          Edit workspace
        </DialogTrigger>
        <DialogBackdrop className="fixed inset-0 bg-foreground/10" />
        <DialogContent className="fixed top-1/2 left-1/2 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(`${name}, digest to ${email || "nobody"}`);
              setOpen(false);
            }}
          >
            <div className="grid gap-2">
              <DialogTitle className="font-heading text-base font-medium">
                Workspace settings
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Changes apply to the sample workspace only.
              </DialogDescription>
            </div>
            <Tabs value={section} onValueChange={setSection} className="grid gap-3">
              <TabsList aria-label="Workspace sections" className={tabsList}>
                <TabsTab value="general" className={tab}>
                  General
                </TabsTab>
                <TabsTab value="notifications" className={tab}>
                  Notifications
                </TabsTab>
              </TabsList>
              <TabsPanel value="general">
                <Field className={field}>
                  <FieldLabel className={label}>Workspace name</FieldLabel>
                  <Input value={name} onValueChange={setName} className={input} />
                </Field>
              </TabsPanel>
              <TabsPanel value="notifications">
                <Field className={field}>
                  <FieldLabel className={label}>Digest email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onValueChange={setEmail}
                    className={input}
                  />
                </Field>
              </TabsPanel>
            </Tabs>
            <div className="flex justify-end gap-2">
              <DialogClose className={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
              <Button type="submit" className={buttonVariants()}>
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <p role="status" className={status}>
        {saved ? `Saved: ${saved}` : "Nothing saved yet."}
      </p>
    </div>
  );
}

/** An agent opens the dialog, switches its tab, fills both fields and submits. */
export const WorkspaceDialog: Story = { render: () => <WorkspaceSettings /> };

function DeleteWorkspace() {
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="grid justify-items-start gap-4">
      <Button
        className={buttonVariants({ variant: "destructive" })}
        data-agent-confirm="Deletes the sample workspace"
        onClick={() => setDeleted(true)}
      >
        Delete workspace
      </Button>
      <p role="status" className={status}>
        {deleted ? "Workspace deleted." : "Workspace exists."}
      </p>
    </div>
  );
}

/** data-agent-confirm: the press waits for the person and runs only when they allow it. */
export const ConfirmRequired: Story = { render: () => <DeleteWorkspace /> };

/** data-agent-hidden: the recovery code is out of every snapshot, query and step. */
export const HiddenRegion: Story = {
  render: () => (
    <div className="grid max-w-sm gap-4">
      <Field className={field}>
        <FieldLabel className={label}>Backup email</FieldLabel>
        <Input type="email" placeholder="name@example.com" className={input} />
      </Field>
      <section
        data-agent-hidden
        aria-label="Recovery"
        className="grid gap-2 rounded-lg border border-border p-3"
      >
        <Field className={field}>
          <FieldLabel className={label}>Recovery code</FieldLabel>
          <Input defaultValue="SAMPLE-0000-0000" readOnly className={input} />
        </Field>
        <p className={status}>Only the person sees this section.</p>
      </section>
    </div>
  ),
};

function SettingsSections() {
  const [section, setSection] = useState<string | null>("profile");
  const [log, setLog] = useState("No changes yet.");
  return (
    <div className="grid justify-items-start gap-4">
      <Tabs
        value={section}
        onValueChange={(next, details) => {
          const who = details.source === "agent" ? "an agent" : "a person";
          if (details.source === "agent" && next === "billing") {
            details.cancel();
            setLog("Refused: only a person opens Billing.");
            return;
          }
          setSection(next);
          setLog(`${next} opened by ${who}.`);
        }}
        className="grid gap-3"
      >
        <TabsList aria-label="Settings sections" className={tabsList}>
          <TabsTab value="profile" className={tab}>
            Profile
          </TabsTab>
          <TabsTab value="notifications" className={tab}>
            Notifications
          </TabsTab>
          <TabsTab value="billing" className={tab}>
            Billing
          </TabsTab>
        </TabsList>
        <TabsPanel value="profile" className={status}>
          Profile settings for the sample account.
        </TabsPanel>
        <TabsPanel value="notifications" className={status}>
          Notification settings for the sample account.
        </TabsPanel>
        <TabsPanel value="billing" className={status}>
          Billing settings for the sample account.
        </TabsPanel>
      </Tabs>
      <p role="status" className={status}>
        {log}
      </p>
    </div>
  );
}

/** details.source tells an agent's change from a person's; details.cancel() refuses it. */
export const AgentChanges: Story = { render: () => <SettingsSections /> };
