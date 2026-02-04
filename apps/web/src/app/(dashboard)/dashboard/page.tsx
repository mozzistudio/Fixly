'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Ticket,
  CheckCircle2,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_COLORS } from '@fixly/core';
import Link from 'next/link';

const statusColumns = ['NEW', 'CHECKED_IN', 'DIAGNOSING', 'IN_REPAIR', 'READY_PICKUP'];

export default function DashboardPage() {
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets', { pageSize: '50' }],
    queryFn: () => api.getTickets({ pageSize: '50' }),
  });

  // Calculate stats
  const openTickets = tickets?.data?.filter(
    (t: any) => !['CLOSED', 'CANCELLED', 'PICKED_UP'].includes(t.status)
  ).length || 0;

  const completedToday = tickets?.data?.filter((t: any) => {
    if (!t.completedAt) return false;
    const today = new Date().toDateString();
    return new Date(t.completedAt).toDateString() === today;
  }).length || 0;

  const stats = [
    {
      title: 'Open Tickets',
      value: openTickets,
      icon: Ticket,
      color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    },
    {
      title: 'Completed Today',
      value: completedToday,
      icon: CheckCircle2,
      color: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
    },
    {
      title: 'Revenue Today',
      value: formatCurrency(1250.00),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      title: 'Avg Repair Time',
      value: '4.2h',
      icon: Clock,
      color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
    },
  ];

  // Group tickets by status for kanban
  const ticketsByStatus = statusColumns.reduce((acc, status) => {
    acc[status] = tickets?.data?.filter((t: any) => t.status === status) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        action={
          <Link href="/tickets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ticket Pipeline</CardTitle>
            <Link href="/tickets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {statusColumns.map((status) => (
                <div key={status} className="flex-shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: TICKET_STATUS_COLORS[status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS] }}
                    />
                    <h3 className="font-medium text-sm">
                      {TICKET_STATUS_LABELS[status.toLowerCase() as keyof typeof TICKET_STATUS_LABELS]}
                    </h3>
                    <Badge variant="neutral" className="ml-auto">
                      {ticketsByStatus[status]?.length || 0}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {ticketsByStatus[status]?.slice(0, 4).map((ticket: any) => (
                      <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs text-primary-500">
                                {ticket.code}
                              </span>
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    TICKET_PRIORITY_COLORS[ticket.priority.toLowerCase() as keyof typeof TICKET_PRIORITY_COLORS],
                                }}
                                title={ticket.priority}
                              />
                            </div>
                            <p className="text-sm font-medium truncate">
                              {ticket.device?.brand} {ticket.device?.model}
                            </p>
                            <p className="text-xs text-text-secondary truncate mt-1">
                              {ticket.issueDescription}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-text-secondary">
                                {ticket.customer?.firstName} {ticket.customer?.lastName?.[0]}.
                              </span>
                              {ticket.assignedTo && (
                                <Avatar size="xs">
                                  <AvatarImage src={ticket.assignedTo.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(ticket.assignedTo.firstName, ticket.assignedTo.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {(ticketsByStatus[status]?.length || 0) > 4 && (
                      <p className="text-xs text-center text-text-secondary py-2">
                        +{ticketsByStatus[status].length - 4} more
                      </p>
                    )}
                    {(ticketsByStatus[status]?.length || 0) === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center">
                        <p className="text-xs text-text-secondary">No tickets</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets?.data?.slice(0, 5).map((ticket: any) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${TICKET_STATUS_COLORS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS]}20`,
                          color: TICKET_STATUS_COLORS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS],
                        }}
                      >
                        <Ticket className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-primary-500">
                            {ticket.code}
                          </span>
                          <Badge
                            variant="neutral"
                            className="text-[10px]"
                            style={{
                              backgroundColor: `${TICKET_STATUS_COLORS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS]}20`,
                              color: TICKET_STATUS_COLORS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS],
                            }}
                          >
                            {TICKET_STATUS_LABELS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_LABELS]}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary truncate">
                          {ticket.device?.brand} {ticket.device?.model} - {ticket.customer?.firstName} {ticket.customer?.lastName}
                        </p>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {formatRelativeTime(ticket.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">This Week</p>
                      <p className="text-xs text-text-secondary">Revenue</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(5420.00)}</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tickets Completed</p>
                      <p className="text-xs text-text-secondary">This Week</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">24</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-accent-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg. Turnaround</p>
                      <p className="text-xs text-text-secondary">This Month</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">3.8h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
