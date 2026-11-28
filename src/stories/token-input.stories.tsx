import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, waitFor } from "storybook/test";
import { Label } from "@/components/ui/label";
import {
  TokenInput,
  TokenInputEditor,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuItem,
  TriggerMenuList,
} from "@/components/ui-sdk/token-input";

const meta = {
  title: "Components/Token input",
  component: TokenInput,
  decorators: [
    (Story) => (
      <div className="flex max-w-md flex-col gap-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  { value: "sample-a", label: "Sample User A" },
  { value: "sample-b", label: "Sample User B" },
  { value: "sample-c", label: "Sample User C" },
];
const tags = [
  { value: "for-sale", label: "for-sale" },
  { value: "wanted", label: "wanted" },
  { value: "trade", label: "trade" },
];

type Value = React.ComponentProps<typeof TokenInput>["defaultValue"];

// The value as the app receives it: text, with each token as [type:value].
const show = (value: Value) =>
  (value ?? [])
    .map((part) => (typeof part === "string" ? part : `[${part.type}:${part.value}]`))
    .join("");

function Composer({ defaultValue, disabled }: { defaultValue?: Value; disabled?: boolean }) {
  const [text, setText] = useState(() => show(defaultValue));
  return (
    <>
      <Label id="sample-message-label">Message</Label>
      <TokenInput
        defaultValue={defaultValue}
        disabled={disabled}
        onValueChange={(value) => setText(show(value))}
      >
        <TokenInputEditor
          aria-labelledby="sample-message-label"
          placeholder="Type @ to mention or # to tag"
        />
        <TriggerMenu
          triggers={[
            { char: "@", type: "mention", items: people },
            { char: "#", type: "tag", items: tags },
          ]}
        >
          <TriggerMenuContent>
            <TriggerMenuEmpty>No matches.</TriggerMenuEmpty>
            <TriggerMenuList>
              {(state) =>
                (state.items as { value: string; label: string }[]).map((item) => (
                  <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                    {item.label}
                  </TriggerMenuItem>
                ))
              }
            </TriggerMenuList>
          </TriggerMenuContent>
        </TriggerMenu>
      </TokenInput>
      <p className="text-sm text-muted-foreground">Value: {text || "empty"}</p>
    </>
  );
}

const sample: Value = [
  "Listing a sample lamp ",
  { type: "tag", value: "for-sale", label: "for-sale" },
  " ask ",
  { type: "mention", value: "sample-a", label: "Sample User A" },
];

export const Empty: Story = { render: () => <Composer /> };

export const WithTokens: Story = { render: () => <Composer defaultValue={sample} /> };

export const Disabled: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Composer defaultValue={sample} disabled />,
};

export const MentionMenuOpen: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Composer />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("textbox", { name: "Message" }));
    await userEvent.keyboard("Hello @Sam");
    const menu = await screen.findByRole("listbox");
    await waitFor(() => expect(menu).toBeVisible());
    await expect(screen.getAllByRole("option")).toHaveLength(3);
  },
};

export const InsertAndRemove: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Composer />,
  play: async ({ canvas, userEvent }) => {
    const editor = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.click(editor);
    await userEvent.keyboard("#tra");
    await screen.findByRole("option", { name: "trade" });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByText(/Value: \[tag:trade\]/)).toBeInTheDocument());
    // One Backspace after the inserted space, then one removes the whole token.
    await userEvent.keyboard("{Backspace}{Backspace}");
    await waitFor(() => expect(canvas.getByText("Value: empty")).toBeInTheDocument());
  },
};
