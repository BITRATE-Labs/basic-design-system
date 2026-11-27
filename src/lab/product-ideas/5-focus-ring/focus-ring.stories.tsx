import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsForm from "@/stories/settings-form.stories";
import { ContrastReadout } from "../4-state-and-status-colour/contrast";
import "./focus-ring.css";

// Group 5 of the product-ideas lab. Notes: focus-ring.mdx in this folder.
// In Compare, [data-lab-state="focus"] plus the stock focus-visible classes draws focus
// at rest so both options show at once; the other stories focus the real element by
// keyboard in a play function.

const meta = {
  title: "Lab/Product ideas/5. Focus ring",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Idea = "stock" | "focus-outline";
const labels: Record<Idea, string> = {
  stock: "Stock: 3px ring at 50% of --ring",
  "focus-outline":
    "Loominist: solid 2px brand outline, 3px out, inset in menus, lists and tab bars",
};
const scope = (idea: Idea) => (idea === "stock" ? {} : { "data-idea": idea });

// Focus-visible classes copied from the stock components, for drawing focus at rest.
const stockFocus = {
  control: "border-ring ring-3 ring-ring/50",
  tab: "border-ring ring-[3px] ring-ring/50 outline-1 outline-ring",
  menuItem: "bg-accent text-accent-foreground",
};

// Spread on the one element per subject that shows focus in Compare; `base` is the
// element's own className, kept either way.
const forced = (on: boolean | undefined, className: string, label: string, base = "") =>
  on
    ? {
        "data-lab-state": "focus",
        className: `${base} ${className}`.trim(),
        "data-contrast": label,
        "data-contrast-kind": "focus",
      }
    : { className: base || undefined };

function SampleButton({ show }: { show?: boolean }) {
  return (
    <Button {...forced(show, stockFocus.control, "Button ring", "self-start")}>Save changes</Button>
  );
}

function SampleInput({ show }: { show?: boolean }) {
  return (
    <Field>
      <FieldLabel htmlFor={show ? undefined : "lab-focus-name"}>Display name</FieldLabel>
      <Input
        id={show ? undefined : "lab-focus-name"}
        defaultValue="Sample Workspace"
        {...forced(show, stockFocus.control, "Input ring")}
      />
    </Field>
  );
}

function SampleCheckbox({ show }: { show?: boolean }) {
  return (
    <Field orientation="horizontal">
      <Checkbox
        aria-label="Email me a weekly summary"
        defaultChecked
        {...forced(show, stockFocus.control, "Checkbox ring")}
      />
      <span className="text-sm">Email me a weekly summary</span>
    </Field>
  );
}

function SampleTabs({ show }: { show?: boolean }) {
  return (
    <Tabs defaultValue="general">
      <TabsList aria-label="Settings sections">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="members" {...forced(show, stockFocus.tab, "Tab ring")}>
          Members
        </TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function SampleLink() {
  return (
    <p className="text-sm">
      Read the{" "}
      <a href="#sample-guide" className="text-primary underline underline-offset-4">
        sample guide
      </a>{" "}
      before inviting members.
    </p>
  );
}

const rows = ["Sample lamp", "Placeholder mug", "Example notebook", "Demo poster", "Test plant"];

function SampleList({ show }: { show?: boolean }) {
  return (
    <ScrollArea className="h-36 rounded-lg border">
      <div className="flex flex-col p-1">
        {rows.map((row, i) => (
          <Button
            key={row}
            variant="ghost"
            {...forced(show && i === 1, stockFocus.control, "List row ring", "justify-start")}
          >
            {row}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}

function SampleMenu({ open }: { open?: boolean }) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer}>
      {/* The content portals into this element, so the idea scope reaches it. */}
      <DropdownMenu open={open} modal={open ? false : undefined}>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger>
        {container && (
          <DropdownMenuContent container={container} className="w-56">
            <DropdownMenuItem {...forced(open, stockFocus.menuItem, "Menu item ring")}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}

function Column({ idea, children }: { idea: Idea; children: React.ReactNode }) {
  return (
    <section
      {...scope(idea)}
      className="min-w-0 rounded-lg border bg-background p-4 text-foreground"
    >
      <h3 className="mb-3 text-sm font-semibold">{labels[idea]}</h3>
      <ContrastReadout>{children}</ContrastReadout>
    </section>
  );
}

export const Compare: Story = {
  render: () => (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        One element per row is drawn focused at rest: the button, the input, the checkbox, the
        Members tab, the second list row and the first menu item. Stock menu items show focus only
        as the highlight. Press Tab to see the link and the real states. The ratios compare each
        indicator with the surface behind it (WCAG 2.2 asks for 3:1).
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(labels) as Idea[]).map((idea) => (
          <Column key={idea} idea={idea}>
            <div className="flex flex-col gap-5">
              <SampleButton show />
              <SampleInput show />
              <SampleCheckbox show />
              <SampleTabs show />
              <SampleLink />
              <SampleList show />
              <SampleMenu open />
              <div className="h-28" />
            </div>
          </Column>
        ))}
      </div>
    </div>
  ),
};

// Press Tab until `target` has focus, so the browser treats it as keyboard focus.
async function tabTo(userEvent: { tab: () => Promise<void> }, target: () => HTMLElement) {
  for (let i = 0; i < 20 && document.activeElement !== target(); i++) await userEvent.tab();
  await expect(target()).toHaveFocus();
}

type Subject = {
  name: string;
  render: () => React.ReactNode;
  focus: (
    canvas: HTMLElement,
    userEvent: { tab: () => Promise<void>; keyboard: (keys: string) => Promise<void> },
  ) => Promise<void>;
};

const q = (root: HTMLElement, selector: string) => root.querySelector<HTMLElement>(selector)!;

const subjects: Subject[] = [
  {
    name: "Button",
    render: () => <SampleButton />,
    focus: (c, u) => tabTo(u, () => q(c, '[data-slot="button"]')),
  },
  {
    name: "Input",
    render: () => <SampleInput />,
    focus: (c, u) => tabTo(u, () => q(c, '[data-slot="input"]')),
  },
  {
    name: "Checkbox",
    render: () => <SampleCheckbox />,
    focus: (c, u) => tabTo(u, () => q(c, '[data-slot="checkbox"]')),
  },
  {
    name: "Tab",
    render: () => <SampleTabs />,
    focus: async (c, u) => {
      await tabTo(u, () => q(c, '[data-slot="tabs-trigger"]'));
      await u.keyboard("{ArrowRight}");
      await expect(q(c, '[data-slot="tabs-trigger"]:nth-child(2)')).toHaveFocus();
    },
  },
  {
    name: "Menu item",
    render: () => (
      <div className="pb-36">
        <SampleMenu />
      </div>
    ),
    focus: async (c, u) => {
      await tabTo(u, () => q(c, '[data-slot="dropdown-menu-trigger"]'));
      await u.keyboard("{ArrowDown}");
      await waitFor(() => expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus());
      await u.keyboard("{ArrowDown}");
      await expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    },
  },
  {
    name: "List row",
    render: () => <SampleList />,
    focus: (c, u) => tabTo(u, () => c.querySelectorAll<HTMLElement>('[data-slot="button"]')[1]),
  },
  {
    name: "Link",
    render: () => <SampleLink />,
    focus: (c, u) => tabTo(u, () => q(c, "a")),
  },
];

function focusStory(subject: Subject, idea: Idea): Story {
  return {
    name: `${subject.name}, ${idea === "stock" ? "stock" : "Loominist outline"}`,
    render: () => (
      <div {...scope(idea)} className="max-w-sm p-2">
        {subject.render()}
      </div>
    ),
    play: ({ canvasElement, userEvent }) => subject.focus(canvasElement, userEvent),
  };
}

const [button, input, checkbox, tab, menuItem, listRow, link] = subjects;
export const ButtonStock = focusStory(button, "stock");
export const ButtonOutline = focusStory(button, "focus-outline");
export const InputStock = focusStory(input, "stock");
export const InputOutline = focusStory(input, "focus-outline");
export const CheckboxStock = focusStory(checkbox, "stock");
export const CheckboxOutline = focusStory(checkbox, "focus-outline");
export const TabStock = focusStory(tab, "stock");
export const TabOutline = focusStory(tab, "focus-outline");
export const MenuItemStock = focusStory(menuItem, "stock");
export const MenuItemOutline = focusStory(menuItem, "focus-outline");
export const ListRowStock = focusStory(listRow, "stock");
export const ListRowOutline = focusStory(listRow, "focus-outline");
export const LinkStock = focusStory(link, "stock");
export const LinkOutline = focusStory(link, "focus-outline");

// The composed settings form example (its ids are fixed, so one copy per story). The play
// function puts keyboard focus on its first field; Tab on from there by hand.
function settingsForm(idea: Idea): Story {
  return {
    name: `Settings form, ${idea === "stock" ? "stock" : "Loominist outline"}`,
    render: () => {
      const Form = SettingsForm.component;
      return (
        <div {...scope(idea)}>
          <Form />
        </div>
      );
    },
    play: ({ canvasElement, userEvent }) =>
      tabTo(userEvent, () => q(canvasElement, '[data-slot="input"]')),
  };
}

export const SettingsFormStock = settingsForm("stock");
export const SettingsFormOutline = settingsForm("focus-outline");
