import type { Meta, StoryObj } from "@storybook/react-vite";
import { EllipsisIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SettingsForm() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Workspace settings</h1>
          <p className="text-sm text-muted-foreground">Sample workspace, for review only.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <EllipsisIcon />
            <span className="sr-only">More actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem>Export settings</DropdownMenuItem>
              <DropdownMenuItem>Copy workspace ID</DropdownMenuItem>
              <DropdownMenuItem disabled>Transfer ownership</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Reset to defaults</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-4">
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <FieldSet>
              <FieldLegend>Profile</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="settings-name">Workspace name</FieldLabel>
                  <Input id="settings-name" defaultValue="Sample Workspace" />
                  <FieldDescription>Shown in the header and in emails.</FieldDescription>
                </Field>
                <Field data-invalid="true">
                  <FieldLabel htmlFor="settings-handle">Handle</FieldLabel>
                  <Input
                    id="settings-handle"
                    defaultValue="Sample Workspace!"
                    aria-invalid
                    aria-describedby="settings-handle-error"
                  />
                  <FieldError id="settings-handle-error">
                    Use lowercase letters, numbers and dashes.
                  </FieldError>
                </Field>
                <Field data-disabled="true">
                  <FieldLabel htmlFor="settings-region">Region</FieldLabel>
                  <Input id="settings-region" defaultValue="Example region" disabled />
                  <FieldDescription>Fixed when the workspace was created.</FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
            <div className="flex justify-end gap-2">
              <Button type="reset" variant="outline">
                Discard
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="notifications" className="pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="settings-digest">Digest email</FieldLabel>
              <Input id="settings-digest" type="email" placeholder="name@example.com" />
              <FieldDescription>One summary a week. Leave empty to turn it off.</FieldDescription>
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="danger" className="pt-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/40 p-4">
            <div>
              <p className="font-medium">Delete workspace</p>
              <p className="text-sm text-muted-foreground">
                Removes every sample item. This cannot be undone.
              </p>
            </div>
            <Dialog>
              <DialogTrigger render={<Button variant="destructive" />}>Delete</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Sample Workspace?</DialogTitle>
                  <DialogDescription>Type the workspace name to confirm.</DialogDescription>
                </DialogHeader>
                <Field>
                  <FieldLabel htmlFor="settings-confirm">Workspace name</FieldLabel>
                  <Input id="settings-confirm" placeholder="Sample Workspace" />
                </Field>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                  <Button variant="destructive">Delete workspace</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const meta = {
  title: "Examples/Settings form",
  component: SettingsForm,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SettingsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
