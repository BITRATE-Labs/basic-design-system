import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, PencilIcon, TrashIcon } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const meta = {
  title: "Components/Dropdown menu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function SampleMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Item</DropdownMenuLabel>
          <DropdownMenuItem>
            <PencilIcon />
            Rename
            <DropdownMenuShortcut>Ctrl+R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyIcon />
            Duplicate
            <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Move to folder
            <DropdownMenuShortcut>Ctrl+M</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>Show details</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Show archived</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <TrashIcon />
          Delete
          <DropdownMenuShortcut>Del</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Default: Story = { render: () => <SampleMenu /> };

// Interaction checks below are tagged !dev and !autodocs: hidden from the sidebar and the
// docs page, still run by the story render check.

export const Open: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SampleMenu />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
  },
};

export const KeyboardNavigation: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SampleMenu />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Rename/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toHaveFocus();
    // Base UI keeps disabled items reachable so screen readers announce them, but marks them disabled.
    await userEvent.keyboard("{ArrowDown}");
    const disabled = screen.getByRole("menuitem", { name: /Move to folder/ });
    await expect(disabled).toHaveFocus();
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{ArrowDown}");
    await expect(screen.getByRole("menuitemcheckbox", { name: "Show details" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  },
};
