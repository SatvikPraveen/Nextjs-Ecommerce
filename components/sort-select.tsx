// components/sort-select.tsx

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function SortSelect({
  value = 'newest',
  onValueChange,
}: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="rating">Top Rated</SelectItem>
      </SelectContent>
    </Select>
  );
}
