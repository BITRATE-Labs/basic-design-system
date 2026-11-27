import { useId, useState, type ReactNode } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import "./selection-indicators.css";

// Lab port of Perkcord's SlidingRadioGroup (sliding-radio-group.tsx).
// The thumb's place and width come from the checked index and the option weights alone:
// no DOM measurement. Each segment is the stock RadioGroupItem stretched invisibly over
// it, so arrow keys, focus and form submission are the stock RadioGroup's.

export type SegmentedOption = {
  value: string;
  label: ReactNode;
  /** Share of the track, as a grid fr (default 1). A long label next to a short one. */
  weight?: number;
  disabled?: boolean;
};

export function SegmentedControl({
  legend,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  compact = false,
  className,
}: {
  legend: string;
  options: readonly SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const id = useId();
  const [own, setOwn] = useState(defaultValue);
  const current = value ?? own;
  const weights = options.map(({ weight = 1 }) => weight);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const index = options.findIndex((option) => option.value === current);
  const start = weights.slice(0, Math.max(0, index)).reduce((sum, weight) => sum + weight, 0);
  return (
    <div
      data-slot="segmented-control"
      data-size={compact ? "compact" : "default"}
      data-disabled={disabled ? "" : undefined}
      className={className}
    >
      <span id={`${id}-legend`} data-slot="segmented-control-legend">
        {legend}
      </span>
      <div data-slot="segmented-control-track">
        <RadioGroup
          aria-labelledby={`${id}-legend`}
          name={name}
          disabled={disabled}
          value={current ?? null}
          onValueChange={(next) => {
            setOwn(next as string);
            onValueChange?.(next as string);
          }}
          style={{ gridTemplateColumns: weights.map((w) => `minmax(0,${w}fr)`).join(" ") }}
        >
          <span
            aria-hidden="true"
            data-slot="segmented-control-thumb"
            style={{
              insetInlineStart: `${(100 * start) / total}%`,
              width: `${(100 * (weights[index] ?? 0)) / total}%`,
            }}
          />
          {options.map((option) => (
            <div key={option.value} data-slot="segmented-control-segment">
              <RadioGroupItem
                value={option.value}
                disabled={option.disabled}
                aria-labelledby={`${id}-${option.value}`}
                className="absolute inset-0 z-10 m-0 size-full rounded-md border-0 opacity-0 after:inset-0"
              />
              <span id={`${id}-${option.value}`} data-slot="segmented-control-label">
                {option.label}
              </span>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
