'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FileText } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@fixly/core';

export default function InvoicesPage() {
  const [search, setSearch] = useState('');

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', { search }],
    queryFn: () => api.getInvoices({ pageSize: '100', ...(search && { search }) }),
  });

  const invoices = invoicesData?.data || [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Invoices"
        subtitle={`${invoices.length} invoices`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search invoices..."
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice: any) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/invoices/${invoice.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-500" />
                          </div>
                          <span className="font-mono text-sm text-primary-500">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">
                          {invoice.customer?.firstName} {invoice.customer?.lastName}
                        </p>
                        <p className="text-xs text-text-secondary">{invoice.customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-sm text-text-secondary">{invoice.ticket?.code}</code>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(Number(invoice.total))}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(Number(invoice.paidAmount))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          style={{
                            backgroundColor: `${PAYMENT_STATUS_COLORS[invoice.paymentStatus.toLowerCase() as keyof typeof PAYMENT_STATUS_COLORS]}20`,
                            color: PAYMENT_STATUS_COLORS[invoice.paymentStatus.toLowerCase() as keyof typeof PAYMENT_STATUS_COLORS],
                          }}
                        >
                          {PAYMENT_STATUS_LABELS[invoice.paymentStatus.toLowerCase() as keyof typeof PAYMENT_STATUS_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {formatDate(invoice.issuedAt)}
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
