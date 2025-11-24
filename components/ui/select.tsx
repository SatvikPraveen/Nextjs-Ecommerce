// components/ui/select.tsx

'use client';

import * as React from 'react';
// @ts-ignore - Radix UI type definitions compatibility
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

// @ts-ignore - Radix UI type definitions have compatibility issues with .mts
const Select = SelectPrimitive.Root;
// @ts-ignore
const SelectGroup = SelectPrimitive.Group;
// @ts-ignore
const SelectValue = SelectPrimitive.Value;
// @ts-ignore
const SelectTrigger = SelectPrimitive.Trigger;
// @ts-ignore
const SelectContent = SelectPrimitive.Content;
// @ts-ignore
const SelectItem = SelectPrimitive.Item;
// @ts-ignore
const SelectItemText = SelectPrimitive.ItemText;
// @ts-ignore
const SelectItemIndicator = SelectPrimitive.ItemIndicator;
// @ts-ignore
const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
// @ts-ignore
const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;
// @ts-ignore
const SelectSeparator = SelectPrimitive.Separator;
// @ts-ignore
const SelectPortal = SelectPrimitive.Portal;
// @ts-ignore
const SelectIcon = SelectPrimitive.Icon;
// @ts-ignore
const SelectViewport = SelectPrimitive.Viewport;

const Root = Select;

const Group = SelectGroup;

const Value = SelectValue;

const Trigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, children, ...props }, ref) => (
  <SelectTrigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectIcon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
));
Trigger.displayName = SelectTrigger.displayName;

const ScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectScrollUpButton>
));
ScrollUpButton.displayName = SelectScrollUpButton.displayName;

const ScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectScrollDownButton>
));
ScrollDownButton.displayName = SelectScrollDownButton.displayName;

const Content = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPortal>
    <SelectContent
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <ScrollUpButton />
      <SelectViewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectViewport>
      <ScrollDownButton />
    </SelectContent>
  </SelectPortal>
));
Content.displayName = SelectContent.displayName;

const Item = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, children, ...props }, ref) => (
  <SelectItem
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check className="h-4 w-4" />
      </SelectItemIndicator>
    </span>

    <SelectItemText>{children}</SelectItemText>
  </SelectItem>
));
Item.displayName = SelectItem.displayName;

const Separator = React.forwardRef<
  React.ElementRef<typeof SelectSeparator>,
  React.ComponentPropsWithoutRef<typeof SelectSeparator>
>(({ className, ...props }, ref) => (
  <SelectSeparator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
Separator.displayName = SelectSeparator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  Trigger as SelectTrigger,
  Content as SelectContent,
  Item as SelectItem,
  Separator as SelectSeparator,
  ScrollUpButton as SelectScrollUpButton,
  ScrollDownButton as SelectScrollDownButton,
};
