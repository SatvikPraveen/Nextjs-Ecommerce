// components/ui/select.tsx

'use client';

import * as React from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

// @ts-ignore - Radix UI type definitions compatibility (.mts module resolution issue)
import * as SelectPrimitive from '@radix-ui/react-select';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = SelectPrimitive.Trigger;
const SelectContent = SelectPrimitive.Content;
const SelectItem = SelectPrimitive.Item;
const SelectItemText = SelectPrimitive.ItemText;
const SelectItemIndicator = SelectPrimitive.ItemIndicator;
const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;
const SelectSeparator = SelectPrimitive.Separator;
const SelectPortal = SelectPrimitive.Portal;
const SelectIcon = SelectPrimitive.Icon;
const SelectViewport = SelectPrimitive.Viewport;

const Root = Select;

const Group = SelectGroup;

const Value = SelectValue;

const Trigger = React.forwardRef<any, any>(
  ({ className, children, ...props }, ref) =>
    React.createElement(
      SelectTrigger,
      {
        ref,
        className: cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className
        ),
        ...props,
      },
      children,
      React.createElement(
        SelectIcon,
        { asChild: true },
        React.createElement(ChevronDown, { className: 'h-4 w-4 opacity-50' })
      )
    )
);
Trigger.displayName = SelectTrigger.displayName;

const ScrollUpButton = React.forwardRef<any, any>(
  ({ className, ...props }, ref) =>
    React.createElement(
      SelectScrollUpButton,
      {
        ref,
        className: cn(
          'flex cursor-pointer items-center justify-center py-1',
          className
        ),
        ...props,
      },
      React.createElement(ChevronUp, { className: 'h-4 w-4' })
    )
);
ScrollUpButton.displayName = SelectScrollUpButton.displayName;

const ScrollDownButton = React.forwardRef<any, any>(
  ({ className, ...props }, ref) =>
    React.createElement(
      SelectScrollDownButton,
      {
        ref,
        className: cn(
          'flex cursor-pointer items-center justify-center py-1',
          className
        ),
        ...props,
      },
      React.createElement(ChevronDown, { className: 'h-4 w-4' })
    )
);
ScrollDownButton.displayName = SelectScrollDownButton.displayName;

const Content = React.forwardRef<any, any>(
  ({ className, children, position = 'popper', ...props }, ref) =>
    React.createElement(
      SelectPortal,
      {},
      React.createElement(
        SelectContent,
        {
          ref,
          className: cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            position === 'popper' &&
              'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          ),
          position,
          ...props,
        },
        React.createElement(ScrollUpButton),
        React.createElement(
          SelectViewport,
          {
            className: cn(
              'p-1',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            ),
          },
          children
        ),
        React.createElement(ScrollDownButton)
      )
    )
);
Content.displayName = SelectContent.displayName;

const Item = React.forwardRef<any, any>(
  ({ className, children, ...props }, ref) =>
    React.createElement(
      SelectItem as any,
      {
        ref,
        className: cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        ),
        ...props,
      } as any,
      React.createElement(
        'span',
        {
          className:
            'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        },
        React.createElement(
          SelectItemIndicator,
          {},
          React.createElement(Check, { className: 'h-4 w-4' })
        )
      ),
      React.createElement(SelectItemText, {}, children)
    )
);
Item.displayName = SelectItem.displayName;

const Separator = React.forwardRef<any, any>(({ className, ...props }, ref) =>
  React.createElement(SelectSeparator, {
    ref,
    className: cn('-mx-1 my-1 h-px bg-muted', className),
    ...props,
  })
);
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
