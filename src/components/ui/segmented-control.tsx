"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// A single choice drawn as one track with a thumb behind the checked option. Each option
// takes a share of the width by weight, and the thumb's place and width come from the
// checked index and the weights alone, with no measuring. Every segment is a stock
// RadioGroupItem stretched invisibly over it, so keyboard, focus and form behaviour are
// the stock RadioGroup's. Labels keep one weight, so selection never shifts the layout.

type SegmentedControlOption = {
  value: string
  label: React.ReactNode
  /** Share of the track, as a grid fr (default 1), for a long label beside a short one. */
  weight?: number
  disabled?: boolean
}

const segmentedControlLabelVariants = cva(
  "flex items-center justify-center gap-1 rounded-lg px-1 text-center font-semibold text-muted-foreground peer-data-checked:text-foreground peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-primary peer-[:hover:not([data-disabled])]:bg-primary/10 peer-data-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "min-h-11 text-sm sm:px-2",
        sm: "min-h-7 text-xs whitespace-nowrap",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function SegmentedControl({
  legend,
  options,
  size = "default",
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
  ...props
}: Omit<
  RadioGroupPrimitive.Props<string>,
  "children" | "className" | "aria-label" | "aria-labelledby"
> &
  VariantProps<typeof segmentedControlLabelVariants> & {
    /** The visible group label; the small size keeps it for screen readers only. */
    legend: React.ReactNode
    options: readonly SegmentedControlOption[]
    className?: string
  }) {
  const id = React.useId()
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value !== undefined ? value : uncontrolled
  const weights = options.map(({ weight = 1 }) => weight)
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const index = options.findIndex((option) => option.value === current)
  const start = weights.slice(0, Math.max(0, index)).reduce((sum, weight) => sum + weight, 0)

  return (
    <div
      data-slot="segmented-control"
      data-size={size}
      data-disabled={disabled ? "" : undefined}
      className={cn("min-w-0 data-disabled:opacity-75", className)}
    >
      <span
        id={`${id}-legend`}
        data-slot="segmented-control-legend"
        className={
          size === "sm" ? "sr-only" : "mb-2 block text-sm font-medium text-muted-foreground"
        }
      >
        {legend}
      </span>
      <div
        data-slot="segmented-control-track"
        className="rounded-lg border border-border bg-muted/50 p-0.5"
      >
        <RadioGroup
          {...props}
          aria-labelledby={`${id}-legend`}
          disabled={disabled}
          value={current ?? null}
          onValueChange={(next: string, details) => {
            setUncontrolled(next)
            onValueChange?.(next, details)
          }}
          className="relative isolate grid gap-0"
          style={{
            gridTemplateColumns: weights.map((weight) => `minmax(0,${weight}fr)`).join(" "),
          }}
        >
          <span
            aria-hidden="true"
            data-slot="segmented-control-thumb"
            hidden={index < 0}
            className="pointer-events-none absolute inset-y-0 -z-10 rounded-lg bg-primary/15 ring-1 ring-primary/30 motion-safe:transition-[inset-inline-start,width] motion-safe:duration-200 motion-safe:ease-out contrast-more:ring-primary forced-colors:border-2 forced-colors:border-[Highlight] forced-colors:bg-transparent forced-colors:forced-color-adjust-none"
            style={{
              insetInlineStart: `${(100 * start) / total}%`,
              width: `${(100 * (weights[index] ?? 0)) / total}%`,
            }}
          />
          {options.map((option, i) => (
            <div
              key={option.value}
              data-slot="segmented-control-segment"
              className="relative min-w-0"
            >
              <RadioGroupItem
                value={option.value}
                disabled={option.disabled}
                aria-labelledby={`${id}-${i}`}
                className="absolute inset-0 z-10 m-0 size-full cursor-pointer rounded-lg border-0 opacity-0 after:inset-0 data-disabled:cursor-not-allowed"
              />
              <span
                id={`${id}-${i}`}
                data-slot="segmented-control-label"
                className={segmentedControlLabelVariants({ size })}
              >
                {option.label}
              </span>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

export { SegmentedControl, segmentedControlLabelVariants, type SegmentedControlOption }
