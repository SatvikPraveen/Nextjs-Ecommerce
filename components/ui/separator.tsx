'use client';

import * as React from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={`shrink-0 bg-border ${
        orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full'
      } ${className || ''}`}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';

export { Separator };
