// components/orders-data-table.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { formatCurrency } from '@/lib/utils';

export interface OrderItem {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

interface OrdersDataTableProps {
  data: OrderItem[];
  isLoading?: boolean;
}

export function OrdersDataTable({ data, isLoading }: OrdersDataTableProps) {
  const columns: ColumnDef<OrderItem>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.getValue('total')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.getValue('status') as string;
        const statusStyles = {
          pending: 'bg-gray-100 text-gray-800',
          processing: 'bg-blue-100 text-blue-800',
          shipped: 'bg-purple-100 text-purple-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[value as keyof typeof statusStyles]}`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return <div className="py-8 text-center">Loading orders...</div>;
  }

  return <DataTable columns={columns} data={data} />;
}
