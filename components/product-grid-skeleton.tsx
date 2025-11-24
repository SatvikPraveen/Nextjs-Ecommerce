// components/product-grid-skeleton.tsx

import { Card } from '@/components/ui/card';

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square animate-pulse bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </Card>
      ))}
    </div>
  );
}
