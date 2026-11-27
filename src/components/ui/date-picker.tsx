"use client"

// Date picker on UI SDK (beta, pinned exactly): a typed date field plus a calendar popup.
// Values are ISO date strings. Lay it out as DatePickerGroup > DatePickerInput +
// DatePickerTrigger, then DatePickerContent; the group draws the field like Input.
// The popup is in the top layer, so it needs no z-index.
import * as React from "react"
import {
  DatePicker,
  DatePickerContent as DatePickerContentPrimitive,
  DatePickerInput as DatePickerInputPrimitive,
  DatePickerTrigger as DatePickerTriggerPrimitive,
} from "@ui-sdk/react/date-picker"
import { cn } from "cn"
import { CalendarIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { CalendarMonth, calendarVars } from "@/components/ui/calendar"

type Styled<T extends React.ElementType> = Omit<React.ComponentProps<T>, "className"> & {
  className?: string
}

function DatePickerGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="date-picker-group"
      className={cn(
        "flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-data-disabled:pointer-events-none has-data-disabled:cursor-not-allowed has-data-disabled:bg-input/50 has-data-disabled:opacity-50 has-data-invalid:border-destructive has-data-invalid:ring-3 has-data-invalid:ring-destructive/20 dark:bg-input/30 dark:has-data-invalid:border-destructive/50 dark:has-data-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function DatePickerInput({ className, ...props }: Styled<typeof DatePickerInputPrimitive>) {
  return (
    <DatePickerInputPrimitive
      className={cn(
        "h-full w-full min-w-0 flex-1 bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm",
        className
      )}
      {...props}
    />
  )
}

function DatePickerTrigger({
  className,
  children,
  ...props
}: Styled<typeof DatePickerTriggerPrimitive>) {
  return (
    <DatePickerTriggerPrimitive
      className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "mr-1", className)}
      {...props}
    >
      {children ?? <CalendarIcon aria-hidden="true" />}
    </DatePickerTriggerPrimitive>
  )
}

// Without children it shows one month. Date Picker content keeps the browser's popover
// border, padding and background unless they are set, so they are set here.
function DatePickerContent({
  className,
  children,
  sideOffset = 4,
  align = "start",
  ...props
}: Styled<typeof DatePickerContentPrimitive>) {
  return (
    <DatePickerContentPrimitive
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "m-0 origin-(--transform-origin) rounded-lg border-0 bg-popover p-2 text-popover-foreground shadow-md ring-1 ring-foreground/10 transition-[opacity,scale] duration-100 outline-hidden data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
        calendarVars,
        className
      )}
      {...props}
    >
      {children ?? <CalendarMonth />}
    </DatePickerContentPrimitive>
  )
}

export { DatePicker, DatePickerContent, DatePickerGroup, DatePickerInput, DatePickerTrigger }
