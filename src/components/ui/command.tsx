"use client"

// Command list and palette on UI SDK (beta, pinned exactly), styled like shadcn's base-nova
// command. UI SDK sets each part's data-slot itself (command, command-item...), so these
// wrappers do not pass one.
import * as React from "react"
import {
  Command as CommandPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandGroupLabel as CommandGroupLabelPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
  CommandShortcut as CommandShortcutPrimitive,
} from "@ui-sdk/react/command"
import {
  Dialog as DialogPrimitive,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { SearchIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

type Styled<T extends React.ElementType> = Omit<React.ComponentProps<T>, "className"> & {
  className?: string
}

function Command({ className, ...props }: Styled<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

// A modal palette. Render the opener as `trigger`, usually a CommandDialogTrigger with
// shortcut="mod+k"; the dialog returns focus to it. UI SDK puts the dialog in the top layer.
function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run.",
  trigger,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive>, "children"> & {
  title?: string
  description?: string
  trigger?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive {...props}>
      {trigger}
      <DialogBackdrop className="fixed inset-0 bg-black/10 transition-opacity duration-100 supports-backdrop-filter:backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogContent
        // UI SDK closes the palette on Escape but lets the key bubble, so an enclosing Base UI
        // Dialog would close too. Keys reach this element only while the palette is open.
        onKeyDown={(event) => {
          if (event.key === "Escape") event.stopPropagation()
        }}
        className={cn(
          "fixed top-1/3 left-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-hidden rounded-xl bg-popover p-0 text-sm text-popover-foreground ring-1 ring-foreground/10 transition-[opacity,scale] duration-100 outline-none sm:max-w-sm data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          className
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        {children}
      </DialogContent>
    </DialogPrimitive>
  )
}

// Looks like Button, outline by default. Put shortcut="mod+k" on it to open the palette.
function CommandDialogTrigger({
  className,
  variant = "outline",
  size = "default",
  ...props
}: Styled<typeof DialogTrigger> & VariantProps<typeof buttonVariants>) {
  return <DialogTrigger className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

function CommandInput({ className, ...props }: Styled<typeof CommandInputPrimitive>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <div className="flex h-8 items-center gap-2 rounded-lg border border-input/30 bg-input/30 px-2">
        <SearchIcon aria-hidden="true" className="size-4 shrink-0 opacity-50" />
        <CommandInputPrimitive
          className={cn(
            "w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
}

function CommandList({ className, ...props }: Styled<typeof CommandListPrimitive>) {
  return (
    <CommandListPrimitive
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: Styled<typeof CommandEmptyPrimitive>) {
  return (
    <CommandEmptyPrimitive
      // Stays in the page as a live region; it only has content while nothing matches.
      className={cn("py-6 text-center text-sm not-data-empty:not-data-loading:p-0", className)}
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: Styled<typeof CommandGroupPrimitive>) {
  return (
    <CommandGroupPrimitive
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    />
  )
}

function CommandGroupLabel({
  className,
  ...props
}: Styled<typeof CommandGroupLabelPrimitive>) {
  return (
    <CommandGroupLabelPrimitive
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: Styled<typeof CommandSeparatorPrimitive>) {
  return (
    <CommandSeparatorPrimitive
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: Styled<typeof CommandItemPrimitive>) {
  return (
    <CommandItemPrimitive
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted data-highlighted:text-foreground data-pending:opacity-70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

// Shows the item's `shortcut`, formatted for the platform (Ctrl+P, or ⌘P on Apple).
function CommandShortcut({ className, ...props }: Styled<typeof CommandShortcutPrimitive>) {
  return (
    <CommandShortcutPrimitive
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandDialogTrigger,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
