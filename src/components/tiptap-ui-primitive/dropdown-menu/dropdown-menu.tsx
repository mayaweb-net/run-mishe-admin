"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "@/lib/tiptap-utils"
import { CheckIcon } from "@/components/tiptap-icons/check-icon"

import "@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss"

function DropdownMenu({
  modal = false,
  ...props
}: MenuPrimitive.Root.Props) {
  return (
    <MenuPrimitive.Root data-slot="tiptap-dropdown-menu" modal={modal} {...props} />
  )
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return (
    <MenuPrimitive.Portal
      data-slot="tiptap-dropdown-menu-portal"
      {...props}
    />
  )
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="tiptap-dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="tiptap-dropdown-menu-content"
          className={cn("tiptap-dropdown-menu-content", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return (
    <MenuPrimitive.Group
      data-slot="tiptap-dropdown-menu-group"
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="tiptap-dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("tiptap-dropdown-menu-item", className)}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="tiptap-dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn("tiptap-dropdown-menu-checkbox-item", className)}
      checked={checked}
      {...props}
    >
      <span
        className="tiptap-dropdown-menu-item-indicator"
        data-slot="tiptap-dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="tiptap-dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="tiptap-dropdown-menu-radio-item"
      data-inset={inset}
      className={cn("tiptap-dropdown-menu-radio-item", className)}
      {...props}
    >
      <span
        className="tiptap-dropdown-menu-item-indicator"
        data-slot="tiptap-dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="tiptap-dropdown-menu-label"
      data-inset={inset}
      className={cn("tiptap-dropdown-menu-label", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="tiptap-dropdown-menu-separator"
      className={cn("tiptap-dropdown-menu-separator", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tiptap-dropdown-menu-shortcut"
      className={cn("tiptap-dropdown-menu-shortcut", className)}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return (
    <MenuPrimitive.SubmenuRoot
      data-slot="tiptap-dropdown-menu-sub"
      {...props}
    />
  )
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="tiptap-dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn("tiptap-dropdown-menu-sub-trigger", className)}
      {...props}
    >
      {children}
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="tiptap-dropdown-menu-sub-content"
      className={cn("tiptap-dropdown-menu-sub-content", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
