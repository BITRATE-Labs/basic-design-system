import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Label } from "@/components/ui/label";
import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@/components/ui/otp-input";

const meta = {
  title: "Components/OTPInput",
  component: OTPInput,
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OTPInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function SixDigits(props: React.ComponentProps<typeof OTPInput>) {
  return (
    <>
      <Label htmlFor="sample-code">Verification code</Label>
      <OTPInput id="sample-code" maxLength={6} {...props}>
        <OTPInputGroup>
          <OTPInputSlot index={0} />
          <OTPInputSlot index={1} />
          <OTPInputSlot index={2} />
        </OTPInputGroup>
        <OTPInputSeparator />
        <OTPInputGroup>
          <OTPInputSlot index={3} />
          <OTPInputSlot index={4} />
          <OTPInputSlot index={5} />
        </OTPInputGroup>
      </OTPInput>
    </>
  );
}

export const Empty: Story = { render: () => <SixDigits /> };

export const Filled: Story = { render: () => <SixDigits defaultValue="482913" /> };

export const Disabled: Story = { render: () => <SixDigits defaultValue="482" disabled /> };

export const Invalid: Story = {
  render: () => (
    <>
      <SixDigits defaultValue="000000" aria-invalid aria-describedby="sample-code-error" />
      <p id="sample-code-error" className="text-sm text-destructive">
        That code has expired. Request a new one.
      </p>
    </>
  ),
};

export const FocusedEmpty: Story = {
  render: () => <SixDigits />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText("Verification code"));
    await expect(canvas.getByLabelText("Verification code")).toHaveFocus();
  },
};

function Verify() {
  const [done, setDone] = useState("");
  return (
    <>
      <SixDigits onValueCommit={(value) => setDone(value)} />
      <p className="text-sm text-muted-foreground">Submitted: {done || "nothing yet"}</p>
    </>
  );
}

export const TypeAndPaste: Story = {
  render: () => <Verify />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("Verification code");
    await userEvent.click(input);
    // Letters are refused by the digits pattern.
    await userEvent.keyboard("12ab3");
    await expect(input).toHaveValue("123");
    await userEvent.clear(input);
    await userEvent.paste("482-913");
    await expect(input).toHaveValue("482913");
    await expect(canvas.getByText("Submitted: 482913")).toBeInTheDocument();
  },
};
