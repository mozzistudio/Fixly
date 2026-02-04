'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    {
      title: 'Revenue Report',
      description: 'View revenue trends and financial performance',
      icon: TrendingUp,
      href: '/reports/revenue',
    },
    {
      title: 'Technician Performance',
      description: 'Track technician productivity and completed repairs',
      icon: Users,
      href: '/reports/technicians',
    },
    {
      title: 'Ticket Analytics',
      description: 'Analyze ticket volume, categories, and trends',
      icon: BarChart3,
      href: '/reports/tickets',
    },
    {
      title: 'Inventory Report',
      description: 'Monitor stock levels and inventory turnover',
      icon: Package,
      href: '/reports/inventory',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports"
        subtitle="Analytics and insights for your repair shop"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {reports.map((report) => (
            <Card
              key={report.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => window.location.href = report.href}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <report.icon className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <p className="text-sm text-text-secondary">{report.description}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
