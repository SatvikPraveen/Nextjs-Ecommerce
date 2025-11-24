// components/inventory-data-table.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface InventoryDataTableProps {
  data: InventoryItem[];
  isLoading?: boolean;
}

export function InventoryDataTable({ data, isLoading }: InventoryDataTableProps) {
  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
    },
    {
      accessorKey: 'reorderLevel',
      header: 'Reorder Level',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.getValue('status') as string;
        const statusStyles = {
          'in-stock': 'bg-green-100 text-green-800',
          'low-stock': 'bg-yellow-100 text-yellow-800',
          'out-of-stock': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[value as keyof typeof statusStyles]}`}>
            {value.replace('-', ' ')}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return <DataTable columns={columns} data={data} />;
}
