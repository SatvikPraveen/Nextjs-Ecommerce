// components/filter-sidebar.tsx

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSidebarProps {
  categories?: FilterOption[];
  priceRanges?: FilterOption[];
  onCategoryChange?: (value: string) => void;
  onPriceChange?: (value: string) => void;
}

export function FilterSidebar({
  categories = [],
  priceRanges = [],
  onCategoryChange,
  onPriceChange,
}: FilterSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === selectedCategory ? null : value);
    onCategoryChange?.(value);
  };

  const handlePriceChange = (value: string) => {
    setSelectedPrice(value === selectedPrice ? null : value);
    onPriceChange?.(value);
  };

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Categories</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <label
                key={category.value}
                className="flex cursor-pointer items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={selectedCategory === category.value}
                  onChange={() => handleCategoryChange(category.value)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  {category.label}
                  {category.count && (
                    <span className="ml-1 text-gray-500">
                      ({category.count})
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {priceRanges.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Price Range</h3>
          <div className="space-y-2">
            {priceRanges.map(range => (
              <label
                key={range.value}
                className="flex cursor-pointer items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={selectedPrice === range.value}
                  onChange={() => handlePriceChange(range.value)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {(selectedCategory || selectedPrice) && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setSelectedCategory(null);
            setSelectedPrice(null);
            onCategoryChange?.('');
            onPriceChange?.('');
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
