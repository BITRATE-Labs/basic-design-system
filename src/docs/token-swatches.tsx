import { useLayoutEffect, useRef, useState } from "react";
import { brands, colorRoles, scales } from "../../dist/tokens";

// Reads the computed value of each custom property on the element, so the page
// shows what the built CSS really gives, not a copy of the token files.
function useComputedVars(names: readonly string[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    setValues(Object.fromEntries(names.map((n) => [n, style.getPropertyValue(n).trim()])));
  }, [names]);
  return [ref, values] as const;
}

const roleVars = colorRoles.map((r) => `--${r}`);

function RolePanel({ brand, mode }: { brand: string; mode: "light" | "dark" }) {
  const [ref, values] = useComputedVars(roleVars);
  return (
    <div
      ref={ref}
      data-brand={brand}
      className={`${mode === "dark" ? "dark " : ""}rounded-xl border bg-background p-4 text-foreground`}
    >
      <div className="mb-3 text-sm font-medium">
        {brand}, {mode}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {colorRoles.map((role) => (
          <div key={role} className="flex items-center gap-2">
            <span
              className="size-8 shrink-0 rounded-md border"
              style={{ background: `var(--${role})` }}
            />
            <span className="min-w-0 text-xs">
              <span className="block font-mono">--{role}</span>
              <span className="block truncate text-muted-foreground">{values[`--${role}`]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoleSwatches() {
  return (
    <div className="not-prose flex flex-col gap-4">
      {brands.map((brand) => (
        <div key={brand} className="grid gap-4 lg:grid-cols-2">
          <RolePanel brand={brand} mode="light" />
          <RolePanel brand={brand} mode="dark" />
        </div>
      ))}
    </div>
  );
}

function scaleEntries(prefix: string) {
  return Object.entries(scales).filter(([k]) => k.startsWith(prefix) && !k.endsWith("line-height"));
}

export function TypeScale() {
  return (
    <div className="not-prose flex flex-col gap-2">
      {scaleEntries("--text-").map(([name, size]) => (
        <div key={name} className="flex items-baseline gap-4">
          <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
            {name} {size}
          </span>
          <span style={{ fontSize: `var(${name})`, lineHeight: `var(${name}--line-height)` }}>
            The quick sample sentence
          </span>
        </div>
      ))}
    </div>
  );
}

const spacingSteps = [1, 2, 3, 4, 6, 8, 12, 16];

export function SpacingScale() {
  return (
    <div className="not-prose flex flex-col gap-2">
      <div className="text-xs text-muted-foreground">
        One unit, --spacing = {scales["--spacing"]}. Utilities multiply it: p-4 is 4 units.
      </div>
      {spacingSteps.map((n) => (
        <div key={n} className="flex items-center gap-4">
          <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{n} units</span>
          <span
            className="h-3 rounded-sm bg-primary"
            style={{ width: `calc(var(--spacing) * ${n})` }}
          />
        </div>
      ))}
    </div>
  );
}

// Radius steps exist only in theme.css (@theme inline), so they are shown through their utilities.
const radiusSteps = [
  ["sm", "rounded-sm"],
  ["md", "rounded-md"],
  ["lg", "rounded-lg"],
  ["xl", "rounded-xl"],
  ["2xl", "rounded-2xl"],
  ["3xl", "rounded-3xl"],
  ["4xl", "rounded-4xl"],
];

export function RadiusScale() {
  return (
    <div className="not-prose flex flex-wrap gap-4">
      {radiusSteps.map(([step, utility]) => (
        <div key={step} className="flex flex-col items-center gap-1">
          <span className={`size-16 border-2 border-primary bg-muted ${utility}`} />
          <span className="font-mono text-xs text-muted-foreground">{utility}</span>
        </div>
      ))}
    </div>
  );
}

export function ShadowScale() {
  return (
    <div className="not-prose flex flex-wrap gap-6">
      {scaleEntries("--shadow-").map(([name]) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <span className="size-16 rounded-lg bg-card" style={{ boxShadow: `var(${name})` }} />
          <span className="font-mono text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
