'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Loader2, Filter, Search } from 'lucide-react';

interface RepairRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  urgency: string;
  estimatedCost: number | null;
  createdAt: string;
  shop: { id: string; name: string } | null;
}

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  PENDING: { class: 'badge-pending', label: 'Pending' },
  AI_DIAGNOSED: { class: 'bg-purple-100 text-purple-800', label: 'Diagnosed' },
  QUOTED: { class: 'bg-indigo-100 text-indigo-800', label: 'Quoted' },
  ACCEPTED: { class: 'bg-blue-100 text-blue-800', label: 'Accepted' },
  IN_PROGRESS: { class: 'badge-in-progress', label: 'In Progress' },
  COMPLETED: { class: 'badge-completed', label: 'Completed' },
  CANCELLED: { class: 'badge-cancelled', label: 'Cancelled' },
};

export default function RepairsPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/repairs');
    }
  }, [authStatus, router]);

  useEffect(() => {
    async function fetchRepairs() {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') {
          params.set('status', filter);
        }
        const response = await fetch(`/api/repair-requests?${params}`);
        if (response.ok) {
          const data = await response.json();
          setRepairs(data);
        }
      } catch (error) {
        console.error('Error fetching repairs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchRepairs();
    }
  }, [session, filter]);

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const filteredRepairs = repairs.filter(
    (repair) =>
      repair.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Repairs</h1>
            <p className="text-gray-600 mt-1">Track and manage your repair requests</p>
          </div>
          <Link href="/repairs/new" className="btn-primary mt-4 sm:mt-0 flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            New Repair Request
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search repairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="AI_DIAGNOSED">Diagnosed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repairs List */}
        {filteredRepairs.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repairs found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : "You haven't created any repair requests yet"}
            </p>
            {!searchQuery && (
              <Link href="/repairs/new" className="btn-primary inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Repair Request
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRepairs.map((repair) => (
              <Link
                key={repair.id}
                href={`/repairs/${repair.id}`}
                className="card block hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{repair.title}</h3>
                      <span className={`badge ${STATUS_BADGES[repair.status]?.class}`}>
                        {STATUS_BADGES[repair.status]?.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {repair.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="capitalize">{repair.category.toLowerCase()}</span>
                      <span>
                        {formatDistanceToNow(new Date(repair.createdAt), { addSuffix: true })}
                      </span>
                      {repair.shop && <span>Shop: {repair.shop.name}</span>}
                    </div>
                  </div>
                  {repair.estimatedCost && (
                    <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
                      <span className="text-sm text-gray-500">Est. Cost</span>
                      <p className="text-xl font-bold text-primary-600">
                        ${repair.estimatedCost.toFixed(0)}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
