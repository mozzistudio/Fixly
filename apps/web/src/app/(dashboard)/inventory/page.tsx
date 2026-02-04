'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, AlertTriangle, Package } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function InventoryPage() {
  const [search, setSearch] = useState('');

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', { search }],
    queryFn: () => api.getInventory({ pageSize: '100', ...(search && { search }) }),
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => api.getLowStockItems(),
  });

  const items = inventoryData?.data || [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Inventory"
        subtitle={`${items.length} items in stock`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Low Stock Alert */}
        {(lowStockItems?.length || 0) > 0 && (
          <Card className="border-warning-DEFAULT bg-warning-light/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-warning-dark">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockItems?.map((item: any) => (
                  <Badge key={item.id} variant="warning">
                    {item.name} ({item.quantity} left)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-50 dark:bg-surface-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item: any) => {
                    const isLowStock = item.quantity <= item.reorderLevel;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/inventory/${item.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                              <Package className="h-5 w-5 text-text-secondary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.brand && (
                                <p className="text-xs text-text-secondary">{item.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-sm text-primary-500">{item.sku}</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="neutral">{item.category || 'Uncategorized'}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(Number(item.cost))}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatCurrency(Number(item.price))}</td>
                        <td className="px-4 py-3">
                          <Badge variant={isLowStock ? 'danger' : 'success'}>
                            {item.quantity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {item.location || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
