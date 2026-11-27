"use client"

// Calendar on UI SDK (beta, pinned exactly), styled like shadcn's base-nova calendar.
// Values are ISO date strings ("2026-10-16"); no date library. UI SDK sets each part's
// data-slot itself (calendar, calendar-day...).
import * as React from "react"
import {
  Calendar as CalendarPrimitive,
  CalendarDay as CalendarDayPrimitive,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday as CalendarWeekdayPrimitive,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar"
import { cn } from "cn"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

const navButton = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-(--cell-size) p-0 select-none data-disabled:pointer-events-none data-disabled:opacity-50"
)

// One month: previous / heading / next, then the grid. Also the default content of
// Calendar and DatePickerContent.
function CalendarMonth() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-(--cell-size) items-center justify-between gap-1">
        <CalendarPrevious className={navButton}>
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </CalendarPrevious>
        <CalendarHeading className="text-sm font-medium select-none" />
        <CalendarNext className={navButton}>
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </CalendarNext>
      </div>
      <CalendarGrid className="border-separate border-spacing-0">
        <CalendarWeekdays>{(index) => <CalendarWeekday index={index} />}</CalendarWeekdays>
        <CalendarWeeks>{(cell) => <CalendarDay value={cell.date} />}</CalendarWeeks>
      </CalendarGrid>
    </div>
  )
}

// The cell variables the month reads; Calendar and DatePickerContent both set them.
const calendarVars = "[--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]"

function Calendar({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CalendarPrimitive>, "className"> & { className?: string }) {
  return (
    <CalendarPrimitive
      className={cn("w-fit bg-background p-2", calendarVars, className)}
      {...props}
    >
      {children ?? <CalendarMonth />}
    </CalendarPrimitive>
  )
}

function CalendarWeekday({
  className,
  ...props
}: Omit<React.ComponentProps<typeof CalendarWeekdayPrimitive>, "className"> & {
  className?: string
}) {
  return (
    <CalendarWeekdayPrimitive
      className={cn(
        "size-(--cell-size) pb-2 text-[0.8rem] font-normal text-muted-foreground select-none",
        className
      )}
      {...props}
    />
  )
}

function CalendarDay({
  className,
  ...props
}: Omit<React.ComponentProps<typeof CalendarDayPrimitive>, "className"> & {
  className?: string
}) {
  return (
    <CalendarDayPrimitive
      className={cn(
        "relative size-(--cell-size) cursor-default rounded-(--cell-radius) p-0 text-center text-sm leading-none select-none outline-none hover:bg-muted focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 data-today:not-data-[selected]:bg-muted data-outside:text-muted-foreground data-unavailable:text-muted-foreground data-unavailable:line-through data-disabled:pointer-events-none data-disabled:text-muted-foreground data-disabled:opacity-50 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-range-middle:rounded-none data-range-middle:data-[selected]:bg-muted data-range-middle:data-[selected]:text-foreground data-range-start:rounded-r-none data-range-end:rounded-l-none data-range-start:data-range-end:rounded-(--cell-radius) data-preview:not-data-[selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDay, CalendarMonth, CalendarWeekday, calendarVars }
