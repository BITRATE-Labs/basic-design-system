import * as React from "react";

// Measures rendered colour pairs inside its children and lists the WCAG 2.1 ratios.
// Mark an element with data-contrast="<label>" and data-contrast-kind:
//   text    - the element's text colour on the surface behind it (AA 4.5:1)
//   border  - its inline-start border on the surface behind it (3:1 for a cue line)
//   surface - its own background on the surface behind it (no threshold: how visible a wash is)
//   focus   - its focus indicator (outline, else the widest box-shadow ring) on the surface behind it (3:1)
// Ratios are re-measured when the brand or light/dark changes and when colour transitions end.

type Kind = "text" | "border" | "surface" | "focus";
type Row = { label: string; kind: Kind; ratio: number };

const thresholds: Record<Kind, number | null> = { text: 4.5, border: 3, surface: null, focus: 3 };

type Rgba = [number, number, number, number];

// Let the browser resolve any CSS colour (oklch, color-mix results, system colours) to sRGB.
const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
function parse(css: string): Rgba {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255, a / 255];
}

// Alpha-composite `top` over the opaque `bottom` in sRGB, as the browser paints it.
const over = (top: Rgba, bottom: Rgba): Rgba => [
  top[0] * top[3] + bottom[0] * (1 - top[3]),
  top[1] * top[3] + bottom[1] * (1 - top[3]),
  top[2] * top[3] + bottom[2] * (1 - top[3]),
  1,
];

// WCAG 2.1 relative luminance and contrast ratio.
const luminance = ([r, g, b]: Rgba) =>
  [r, g, b]
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
function contrast(a: Rgba, b: Rgba) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// The opaque colour painted behind `el`: its own and its ancestors' backgrounds, composited.
function surface(el: Element | null): Rgba {
  const layers: Rgba[] = [];
  for (let node = el; node; node = node.parentElement) {
    const bg = parse(getComputedStyle(node).backgroundColor);
    if (bg[3] > 0) layers.push(bg);
    if (bg[3] >= 1) break;
  }
  return layers.reduceRight((below, layer) => over(layer, below), [1, 1, 1, 1]);
}

// Split a computed box-shadow list on top-level commas.
const shadows = (value: string) => value.split(/,(?![^(]*\))/).map((s) => s.trim());

function focusColour(el: Element): string | null {
  const style = getComputedStyle(el);
  if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0)
    return style.outlineColor;
  let best: { spread: number; colour: string } | null = null;
  for (const shadow of style.boxShadow === "none" ? [] : shadows(style.boxShadow)) {
    const colour = shadow.match(/^[a-z-]+\([^)]*\)|^#\w+/i)?.[0];
    const lengths = shadow.replace(colour ?? "", "").match(/-?[\d.]+px/g) ?? [];
    const spread = parseFloat(lengths[3] ?? "0");
    if (colour && spread > (best?.spread ?? 0) && parse(colour)[3] > 0) {
      best = { spread, colour };
    }
  }
  return best?.colour ?? null;
}

function measure(el: HTMLElement): Row | null {
  const kind = (el.dataset.contrastKind ?? "text") as Kind;
  // An inset outline (negative offset) is painted over the element's own background.
  const inset = kind === "focus" && parseFloat(getComputedStyle(el).outlineOffset) < 0;
  const behind = surface(kind === "text" || inset ? el : el.parentElement);
  let front: Rgba | null = null;
  if (kind === "text") front = parse(getComputedStyle(el).color);
  if (kind === "border") front = parse(getComputedStyle(el).borderInlineStartColor);
  if (kind === "surface") front = surface(el);
  if (kind === "focus") {
    const colour = focusColour(el);
    front = colour ? parse(colour) : null;
  }
  if (!front) return { label: el.dataset.contrast ?? "", kind, ratio: 1 };
  return {
    label: el.dataset.contrast ?? "",
    kind,
    ratio: contrast(over(front, behind), behind),
  };
}

export function ContrastReadout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      // Two frames: let the brand and theme classes apply before reading styles.
      frame = requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setRows(
            [...root.querySelectorAll<HTMLElement>("[data-contrast]")]
              .map(measure)
              .filter((r): r is Row => !!r),
          ),
        ),
      );
    };
    const observer = new MutationObserver(run);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-brand"],
    });
    // Stock components transition their colours, so a theme switch is only settled
    // once those transitions end; measure again then.
    root.addEventListener("transitionend", run);
    run();
    return () => {
      root.removeEventListener("transitionend", run);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
      <dl
        data-slot="contrast-readout"
        className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-t pt-2 text-xs text-muted-foreground"
      >
        {rows.map((row, i) => {
          const min = thresholds[row.kind];
          const short = min !== null && row.ratio < min;
          return (
            <React.Fragment key={i}>
              <dt>{row.label}</dt>
              <dd
                className={short ? "font-semibold text-destructive tabular-nums" : "tabular-nums"}
              >
                {row.ratio.toFixed(2)}:1
                {min === null ? "" : short ? `, below ${min}` : `, meets ${min}`}
              </dd>
            </React.Fragment>
          );
        })}
      </dl>
    </div>
  );
}
