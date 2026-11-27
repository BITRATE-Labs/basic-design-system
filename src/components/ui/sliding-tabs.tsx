"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"

// One indicator for both components. It reads Base UI's --active-tab-* variables:
// Tabs.Indicator sets them for tabs, SlidingNav measures and sets the same ones for
// links. Both stay hidden until measured, so the first paint never slides in from zero.
const indicatorClassName =
  "pointer-events-none absolute top-0 left-0 rounded-full bg-primary transition-[translate,width,height] duration-(--duration-indicator) ease-indicator motion-reduce:transition-none " +
  "h-[3px] w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-[calc(var(--active-tab-top)+var(--active-tab-height)-3px)] " +
  "group-data-vertical/tabs:h-(--active-tab-height) group-data-vertical/tabs:w-[3px] group-data-vertical/tabs:translate-x-0 group-data-vertical/tabs:translate-y-(--active-tab-top)"

// The selected item is semibold. Hidden copies in both weights keep the item at the
// wider of the two (hinted text is not always wider when bolder), so selection never
// shifts its neighbours.
function ItemLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid *:col-start-1 *:row-start-1 *:inline-flex *:items-center *:justify-center *:gap-1.5">
      <span aria-hidden="true" className="invisible font-medium">
        {children}
      </span>
      <span aria-hidden="true" className="invisible font-semibold">
        {children}
      </span>
      <span>{children}</span>
    </span>
  )
}

function SlidingTabsList({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TabsList>, "variant">) {
  return (
    <TabsList
      variant="line"
      className={cn(
        "relative max-w-full justify-start overflow-x-auto overflow-y-hidden [scrollbar-width:none] *:data-[slot=tabs-trigger]:after:hidden",
        className
      )}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator data-slot="tabs-indicator" className={indicatorClassName} />
    </TabsList>
  )
}

function SlidingTabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn("flex-none data-active:font-semibold", className)}
      {...props}
    >
      <ItemLabel>{children}</ItemLabel>
    </TabsTrigger>
  )
}

type IndicatorBox = Record<`--active-tab-${string}`, string>

function SlidingNav({ className, children, ...props }: React.ComponentProps<"nav">) {
  const ref = React.useRef<HTMLElement>(null)
  const [box, setBox] = React.useState<IndicatorBox | null>(null)

  React.useLayoutEffect(() => {
    const nav = ref.current
    if (!nav) return
    // Same geometry as Base UI's Tabs.Indicator: relative to the nav's scrolled
    // content, so the indicator scrolls with the links and works in RTL.
    const measure = () => {
      nav.querySelectorAll("a, [aria-current]").forEach((item) => resize.observe(item))
      const current = nav.querySelector('[aria-current="page"]')
      const rect = current?.getBoundingClientRect()
      const frame = nav.getBoundingClientRect()
      // Rects are in screen pixels; divide out any ancestor scale or zoom (a dialog's
      // zoom-in, CSS zoom) to get the nav's own layout pixels.
      const style = getComputedStyle(nav)
      const sx = frame.width / parseFloat(style.width) || 1
      const sy = frame.height / parseFloat(style.height) || 1
      const next =
        rect && rect.width > 0
          ? {
              "--active-tab-left": `${(rect.left - frame.left) / sx + nav.scrollLeft - nav.clientLeft}px`,
              "--active-tab-top": `${(rect.top - frame.top) / sy + nav.scrollTop - nav.clientTop}px`,
              "--active-tab-width": `${rect.width / sx}px`,
              "--active-tab-height": `${rect.height / sy}px`,
            }
          : null
      setBox((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    const resize = new ResizeObserver(measure)
    const mutation = new MutationObserver(measure)
    resize.observe(nav)
    mutation.observe(nav, { subtree: true, childList: true, attributeFilter: ["aria-current"] })
    measure()
    return () => {
      resize.disconnect()
      mutation.disconnect()
    }
  }, [])

  return (
    <nav
      ref={ref}
      data-slot="sliding-nav"
      className={cn(
        "relative flex max-w-full items-stretch gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none]",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        data-slot="sliding-nav-indicator"
        hidden={!box}
        className={indicatorClassName}
        style={box ?? undefined}
      />
    </nav>
  )
}

function SlidingNavLink({
  active = false,
  className,
  children,
  render,
  ...props
}: useRender.ComponentProps<"a"> & { active?: boolean }) {
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        "aria-current": active ? "page" : undefined,
        // Colours match the stock tabs trigger: hover only brightens the label.
        className: cn(
          "relative inline-flex min-h-11 shrink-0 items-center justify-center rounded-md px-3 text-sm whitespace-nowrap no-underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary font-medium text-foreground/60 transition-colors hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground dark:text-muted-foreground dark:hover:text-foreground dark:aria-[current=page]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        ),
        children: <ItemLabel>{children}</ItemLabel>,
      },
      props
    ),
  })
}

export { SlidingTabsList, SlidingTabsTrigger, SlidingNav, SlidingNavLink }
