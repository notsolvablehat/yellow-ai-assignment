"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Select({ ...props }: SelectPrimitive.Root.Props<string>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-8 items-center justify-between rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs gap-1.5",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />} />
    </SelectPrimitive.Trigger>
  )
}

function SelectValue({ ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectPortal({ ...props }: SelectPrimitive.Portal.Props) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />
}

function SelectPositioner({ className, ...props }: SelectPrimitive.Positioner.Props) {
  return <SelectPrimitive.Positioner data-slot="select-positioner" sideOffset={4} className={cn("z-[100]", className)} {...props} />
}

function SelectContent({
  className,
  children,
  align = "end",
  sideOffset = 4,
  ...props
}: SelectPrimitive.Popup.Props & {
  align?: SelectPrimitive.Positioner.Props["align"]
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"]
}) {
  return (
    <SelectPortal>
      <SelectPositioner align={align} sideOffset={sideOffset}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative z-[100] min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 p-1 outline-none",
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPositioner>
    </SelectPortal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-1.5 px-2 text-xs font-medium outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-accent/60 transition-colors",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
