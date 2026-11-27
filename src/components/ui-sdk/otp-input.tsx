"use client"

// One-time code input on UI SDK (beta, pinned exactly), styled like shadcn's base-nova
// input-otp. One native input holds the code (autocomplete="one-time-code"); the slots only
// draw it. Name it with a Field label or aria-label. UI SDK sets each part's data-slot.
import * as React from "react"
import {
  OTPInput as OTPInputPrimitive,
  OTPInputGroup as OTPInputGroupPrimitive,
  OTPInputSeparator as OTPInputSeparatorPrimitive,
  OTPInputSlot as OTPInputSlotPrimitive,
} from "@ui-sdk/react/otp-input"
import { cn } from "cn"
import { MinusIcon } from "lucide-react"

type Styled<T extends React.ElementType> = Omit<React.ComponentProps<T>, "className"> & {
  className?: string
}

function OTPInput({ className, ...props }: Styled<typeof OTPInputPrimitive>) {
  return (
    <OTPInputPrimitive
      className={cn(
        "group/otp-input flex w-fit items-center gap-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function OTPInputGroup({ className, ...props }: Styled<typeof OTPInputGroupPrimitive>) {
  return (
    <OTPInputGroupPrimitive
      className={cn(
        "flex items-center rounded-lg group-has-aria-invalid/otp-input:ring-3 group-has-aria-invalid/otp-input:ring-destructive/20 dark:group-has-aria-invalid/otp-input:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

// The invalid state is read from the input (aria-invalid, set by a Field or by hand).
function OTPInputSlot({ className, ...props }: Styled<typeof OTPInputSlotPrimitive>) {
  return (
    <OTPInputSlotPrimitive
      className={cn(
        "relative flex size-8 items-center justify-center border-y border-r border-input text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg group-has-aria-invalid/otp-input:border-destructive data-active:z-10 data-active:border-ring data-active:ring-3 data-active:ring-ring/50 group-has-aria-invalid/otp-input:data-active:border-destructive group-has-aria-invalid/otp-input:data-active:ring-destructive/20 dark:bg-input/30 dark:group-has-aria-invalid/otp-input:data-active:ring-destructive/40 data-fake-caret:after:h-4 data-fake-caret:after:w-px data-fake-caret:after:animate-caret-blink data-fake-caret:after:bg-foreground data-fake-caret:after:duration-1000 data-fake-caret:after:content-[''] motion-reduce:data-fake-caret:after:animate-none",
        className
      )}
      {...props}
    />
  )
}

function OTPInputSeparator({
  className,
  children,
  ...props
}: Styled<typeof OTPInputSeparatorPrimitive>) {
  return (
    <OTPInputSeparatorPrimitive
      className={cn("flex items-center [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children ?? <MinusIcon aria-hidden="true" />}
    </OTPInputSeparatorPrimitive>
  )
}

export { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot }
