'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { formatRelativeTime, getInitials, cn } from '@/lib/utils';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
} from '@fixly/core';

type ViewMode = 'list' | 'kanban';

const statusFilters = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'diagnosing', label: 'Diagnosing' },
  { value: 'waiting_approval', label: 'Waiting Approval' },
  { value: 'waiting_parts', label: 'Waiting Parts' },
  { value: 'in_repair', label: 'In Repair' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'ready_pickup', label: 'Ready for Pickup' },
];

const priorityFilters = [
  { value: '', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function TicketsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['tickets', { search, status: statusFilter, priority: priorityFilter }],
    queryFn: () =>
      api.getTickets({
        pageSize: '100',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      }),
  });

  const tickets = ticketsData?.data || [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tickets"
        subtitle={`${tickets.length} tickets found`}
        action={
          <Link href="/tickets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter
                  ? statusFilters.find((s) => s.value === statusFilter)?.label
                  : 'Status'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statusFilters.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                {priorityFilter
                  ? priorityFilters.find((p) => p.value === priorityFilter)?.label
                  : 'Priority'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {priorityFilters.map((priority) => (
                <DropdownMenuItem
                  key={priority.value}
                  onClick={() => setPriorityFilter(priority.value)}
                >
                  {priority.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-surface-100 text-primary-500 dark:bg-surface-700'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'rounded p-1.5 transition-colors',
                viewMode === 'kanban'
                  ? 'bg-surface-100 text-primary-500 dark:bg-surface-700'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface-50 dark:bg-surface-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Ticket
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Device
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tickets.map((ticket: any) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/tickets/${ticket.id}`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-mono text-sm text-primary-500">
                              {ticket.code}
                            </span>
                            <p className="text-xs text-text-secondary truncate max-w-[200px]">
                              {ticket.issueDescription}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar size="sm">
                              <AvatarFallback>
                                {getInitials(
                                  ticket.customer?.firstName,
                                  ticket.customer?.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {ticket.customer?.firstName} {ticket.customer?.lastName}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {ticket.customer?.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">
                            {ticket.device?.brand} {ticket.device?.model}
                          </p>
                          <p className="text-xs text-text-secondary capitalize">
                            {ticket.device?.type?.toLowerCase().replace('_', ' ')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            style={{
                              backgroundColor: `${TICKET_STATUS_COLORS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS]}20`,
                              color: TICKET_STATUS_COLORS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_COLORS],
                            }}
                          >
                            {TICKET_STATUS_LABELS[ticket.status.toLowerCase() as keyof typeof TICKET_STATUS_LABELS]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: TICKET_PRIORITY_COLORS[ticket.priority.toLowerCase() as keyof typeof TICKET_PRIORITY_COLORS],
                              color: TICKET_PRIORITY_COLORS[ticket.priority.toLowerCase() as keyof typeof TICKET_PRIORITY_COLORS],
                            }}
                          >
                            {TICKET_PRIORITY_LABELS[ticket.priority.toLowerCase() as keyof typeof TICKET_PRIORITY_LABELS]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar size="sm">
                                <AvatarImage src={ticket.assignedTo.avatar} />
                                <AvatarFallback>
                                  {getInitials(
                                    ticket.assignedTo.firstName,
                                    ticket.assignedTo.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {ticket.assignedTo.firstName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-text-secondary">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary">
                            {formatRelativeTime(ticket.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statusFilters.slice(1).map((status) => {
              const statusTickets = tickets.filter(
                (t: any) => t.status.toLowerCase() === status.value
              );
              return (
                <div key={status.value} className="flex-shrink-0 w-80">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          TICKET_STATUS_COLORS[status.value as keyof typeof TICKET_STATUS_COLORS],
                      }}
                    />
                    <h3 className="font-medium text-sm">{status.label}</h3>
                    <Badge variant="neutral" className="ml-auto">
                      {statusTickets.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {statusTickets.map((ticket: any) => (
                      <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
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
                              />
                            </div>
                            <p className="text-sm font-medium">
                              {ticket.device?.brand} {ticket.device?.model}
                            </p>
                            <p className="text-xs text-text-secondary mt-1 truncate-2">
                              {ticket.issueDescription}
                            </p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              <span className="text-xs text-text-secondary">
                                {ticket.customer?.firstName} {ticket.customer?.lastName?.[0]}.
                              </span>
                              {ticket.assignedTo && (
                                <Avatar size="xs">
                                  <AvatarImage src={ticket.assignedTo.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(
                                      ticket.assignedTo.firstName,
                                      ticket.assignedTo.lastName
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {statusTickets.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center">
                        <p className="text-sm text-text-secondary">No tickets</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
