import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, SearchIcon } from "lucide-react";
import { expect } from "storybook/test";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Components/Input Group",
  component: InputGroup,
  decorators: [
    (Story) => (
      <div className="flex max-w-sm flex-col gap-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InlineAddons: Story = {
  render: () => (
    <>
      <InputGroup>
        <InputGroupInput placeholder="Search items" aria-label="Search items" />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="example" aria-label="Site name" />
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupText>.example.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Search items" aria-label="Search with shortcut" />
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </>
  ),
};

export const WithButtons: Story = {
  render: () => (
    <>
      <InputGroup>
        <InputGroupInput readOnly defaultValue="https://example.com/s/sample" aria-label="Link" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Copy link">
            <CopyIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="name@example.com" aria-label="Email" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </>
  ),
};

export const Textarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea placeholder="Write a sample note" aria-label="Note" />
      <InputGroupAddon align="block-end">
        <InputGroupText>0 / 280</InputGroupText>
        <InputGroupButton variant="default" size="sm" className="ml-auto">
          Post
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const BlockStartLabel: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput id="input-group-title" defaultValue="Sample item" />
      <InputGroupAddon align="block-start">
        <Label htmlFor="input-group-title">Title</Label>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput disabled defaultValue="Locked value" aria-label="Locked value" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Invalid: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-invalid defaultValue="not-an-email" aria-label="Email" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@example.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

// The focus ring is drawn on the group, not the input, once the control has keyboard focus.
export const KeyboardFocus: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Search items" aria-label="Search items" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Search items" })).toHaveFocus();
  },
};
