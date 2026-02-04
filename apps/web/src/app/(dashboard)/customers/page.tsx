'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search, UserPlus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', { search }],
    queryFn: () => api.getCustomers({ pageSize: '100', ...(search && { search }) }),
  });

  const customers = customersData?.data || [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Customers"
        subtitle={`${customers.length} customers`}
        action={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-50 dark:bg-surface-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Devices</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Tickets</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((customer: any) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/customers/${customer.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(customer.firstName, customer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                            <p className="text-sm text-text-secondary">{customer.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{customer.phone}</p>
                        {customer.city && (
                          <p className="text-xs text-text-secondary">{customer.city}, {customer.state}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral">{customer._count?.devices || 0} devices</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{customer._count?.tickets || 0} tickets</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {customer.tags?.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          {formatDate(customer.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
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
