"use client"

// Text field that holds tokens (mentions, tags, files) on UI SDK (beta, pinned exactly).
// The editor is styled like Textarea, tokens like shadcn's combobox chips, and the
// suggestion menu (a UI SDK Trigger Menu opened by @, # or another character) like
// DropdownMenu. TokenInput itself renders no element. UI SDK sets each part's data-slot.
import * as React from "react"
import {
  TokenInput as TokenInputPrimitive,
  TokenInputEditor as TokenInputEditorPrimitive,
  TokenInputToken,
  TokenInputTokenRemove,
} from "@ui-sdk/react/token-input"
import {
  TriggerMenu,
  TriggerMenuContent as TriggerMenuContentPrimitive,
  TriggerMenuEmpty as TriggerMenuEmptyPrimitive,
  TriggerMenuItem as TriggerMenuItemPrimitive,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import { cn } from "cn"
import { XIcon } from "lucide-react"

type Styled<T extends React.ElementType> = Omit<React.ComponentProps<T>, "className"> & {
  className?: string
}

// Each token renders as a chip with a remove button unless `renderToken` says otherwise.
function TokenInput({
  renderToken = (token) => (
    <TokenInputToken className="mx-0.5 inline-flex h-[calc(--spacing(5.25))] items-center gap-1 rounded-sm bg-muted px-1.5 align-middle text-xs font-medium whitespace-nowrap text-foreground data-[selected]:ring-2 data-[selected]:ring-ring/50 data-unresolved:text-muted-foreground data-readonly:pr-1.5">
      {token.label}
      <TokenInputTokenRemove className="-mr-1 inline-flex size-4 items-center justify-center rounded-sm opacity-50 hover:bg-background/60 hover:opacity-100 data-disabled:hidden data-readonly:hidden">
        <XIcon aria-hidden="true" className="size-3" />
      </TokenInputTokenRemove>
    </TokenInputToken>
  ),
  ...props
}: React.ComponentProps<typeof TokenInputPrimitive>) {
  return <TokenInputPrimitive renderToken={renderToken} {...props} />
}

function TokenInputEditor({ className, ...props }: Styled<typeof TokenInputEditorPrimitive>) {
  return (
    <TokenInputEditorPrimitive
      className={cn(
        "min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base leading-6 whitespace-pre-wrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50 data-empty:before:pointer-events-none data-empty:before:text-muted-foreground data-empty:before:content-[attr(aria-placeholder)] md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

// Trigger Menu keeps the browser's popover border, padding and background unless set.
function TriggerMenuContent({
  className,
  sideOffset = 4,
  ...props
}: Styled<typeof TriggerMenuContentPrimitive>) {
  return (
    <TriggerMenuContentPrimitive
      sideOffset={sideOffset}
      className={cn(
        "m-0 max-h-(--available-height) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border-0 bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 transition-[opacity,scale] duration-100 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function TriggerMenuItem({ className, ...props }: Styled<typeof TriggerMenuItemPrimitive>) {
  return (
    <TriggerMenuItemPrimitive
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TriggerMenuEmpty({ className, ...props }: Styled<typeof TriggerMenuEmptyPrimitive>) {
  return (
    <TriggerMenuEmptyPrimitive
      className={cn("px-1.5 py-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuItem,
  TriggerMenuList,
}
