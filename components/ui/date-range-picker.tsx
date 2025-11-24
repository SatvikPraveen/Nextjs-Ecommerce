// components/ui/date-range-picker.tsx

'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">From</label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={e => {
              if (e.target.value) {
                onStartDateChange?.(new Date(e.target.value));
              } else {
                onStartDateChange?.(undefined);
              }
            }}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">To</label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
            onChange={e => {
              if (e.target.value) {
                onEndDateChange?.(new Date(e.target.value));
              } else {
                onEndDateChange?.(undefined);
              }
            }}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
}

// Alias for compatibility
export const DatePickerWithRange = DateRangePicker;
