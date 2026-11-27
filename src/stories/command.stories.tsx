import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarIcon, FileTextIcon, FolderPlusIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { expect, screen, waitFor } from "storybook/test";
import {
  Command,
  CommandDialog,
  CommandDialogTrigger,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const meta = {
  title: "Components/Command",
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

function SampleCommands() {
  return (
    <>
      <CommandInput aria-label="Search commands" placeholder="Type a command or search" />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          <CommandGroupLabel>Suggestions</CommandGroupLabel>
          <CommandItem value="new-note">
            <FileTextIcon />
            New sample note
          </CommandItem>
          <CommandItem value="new-folder">
            <FolderPlusIcon />
            New folder
          </CommandItem>
          <CommandItem value="schedule" disabled>
            <CalendarIcon />
            Schedule (unavailable)
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandGroupLabel>Settings</CommandGroupLabel>
          <CommandItem value="profile" shortcut="mod+p">
            <UserIcon />
            Profile
            <CommandShortcut />
          </CommandItem>
          <CommandItem value="billing" shortcut="mod+b">
            <SettingsIcon />
            Billing
            <CommandShortcut />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

function InlineCommand() {
  const [ran, setRan] = useState("nothing yet");
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Command className="ring-1 ring-foreground/10" onAction={(value) => setRan(value)}>
        <SampleCommands />
      </Command>
      <p className="text-sm text-muted-foreground">Ran: {ran}</p>
    </div>
  );
}

export const Default: Story = { render: () => <InlineCommand /> };

export const KeyboardRun: Story = {
  render: () => <InlineCommand />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await userEvent.click(input);
    // The first command starts highlighted; ArrowDown moves on and skips the disabled one.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(canvas.getByRole("option", { name: /Profile/ })).toHaveAttribute(
      "data-highlighted",
    );
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Ran: profile")).toBeInTheDocument();
  },
};

export const Filtered: Story = {
  render: () => <InlineCommand />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Search commands" }), "bil");
    await waitFor(() => expect(canvas.getAllByRole("option")).toHaveLength(1));
    await expect(canvas.getByRole("option", { name: /Billing/ })).toHaveAttribute(
      "data-highlighted",
    );
  },
};

export const NoResults: Story = {
  render: () => <InlineCommand />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Search commands" }), "zzqx");
    await expect(await canvas.findByText("No results found.")).toBeVisible();
  },
};

function Palette() {
  const [open, setOpen] = useState(false);
  const [ran, setRan] = useState("nothing yet");
  return (
    <div className="flex flex-col items-start gap-2">
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        trigger={<CommandDialogTrigger shortcut="mod+k">Search commands</CommandDialogTrigger>}
      >
        <Command
          onAction={(value) => {
            setRan(value);
            setOpen(false);
          }}
        >
          <SampleCommands />
        </Command>
      </CommandDialog>
      <p className="text-sm text-muted-foreground">Ran: {ran}</p>
    </div>
  );
}

export const PaletteClosed: Story = { render: () => <Palette /> };

export const PaletteOpen: Story = {
  render: () => <Palette />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search commands" }));
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Search commands" })).toHaveFocus(),
    );
  },
};

export const PaletteRunAndReturnFocus: Story = {
  render: () => <Palette />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Search commands" });
    await userEvent.click(trigger);
    const input = await screen.findByRole("combobox", { name: "Search commands" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("folder{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByText("Ran: new-folder")).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
