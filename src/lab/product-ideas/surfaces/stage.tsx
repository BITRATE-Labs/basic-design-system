import type { CSSProperties, ReactNode } from "react";
import "./stage.css";

// Lab scaffolding shared by the product-ideas stories: page backgrounds, and pinning an open
// Dialog or Sheet into a column so several can be compared side by side.

const filler =
  "Sample workspace notes. Placeholder text sits behind the surfaces so the fill and blur are judged against type as well as shapes. ";

export function LabPage({
  busy = false,
  className = "",
  children,
}: {
  busy?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-busy={busy || undefined} className={`lab-page relative ${className}`}>
      {busy && (
        <div className="lab-page-text" aria-hidden>
          {filler.repeat(60)}
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

// A placeholder box in the column. The pinned popup is positioned over it with CSS anchor
// positioning, so it follows the column without measuring.
export function PinSlot({ name, height }: { name: string; height: number }) {
  return <div style={{ anchorName: `--${name}`, height }} />;
}

// Style for a Dialog or Sheet popup pinned over its PinSlot. It overrides the stock centring
// and full-height sheet only through the popup's own style prop; the component is unchanged.
export function pinned(name: string, height?: number): CSSProperties {
  return {
    position: "fixed",
    positionAnchor: `--${name}`,
    top: "anchor(top)",
    left: "anchor(left)",
    right: "auto",
    bottom: "auto",
    width: "anchor-size(width)",
    height: height ?? "auto",
    maxWidth: "none",
    translate: "none",
  };
}

export function ColumnHeading({ title, source }: { title: string; source: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="text-xs text-muted-foreground">{source}</p>
    </div>
  );
}
