'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Filter, Loader2, CheckCircle } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: number;
  isVerified: boolean;
  specialties: { category: string }[];
  _count: {
    repairRequests: number;
    reviews: number;
  };
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'SMARTPHONE', label: 'Smartphone' },
  { value: 'LAPTOP', label: 'Laptop' },
  { value: 'TABLET', label: 'Tablet' },
  { value: 'DESKTOP', label: 'Desktop' },
  { value: 'TV', label: 'TV' },
  { value: 'APPLIANCE', label: 'Appliance' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
];

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    async function fetchShops() {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (category) params.set('category', category);
        if (verifiedOnly) params.set('verified', 'true');

        const response = await fetch(`/api/shops?${params}`);
        if (response.ok) {
          const data = await response.json();
          setShops(data);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(fetchShops, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, category, verifiedOnly]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Repair Shops</h1>
          <p className="text-gray-600 mt-1">Discover trusted repair shops near you</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, city, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input w-full sm:w-auto"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Shops List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : shops.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {shop.name}
                      {shop.isVerified && (
                        <CheckCircle className="h-4 w-4 text-primary-600" />
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      {shop.city}, {shop.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-yellow-700">
                      {shop.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {shop.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {shop.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {shop.specialties.slice(0, 3).map((specialty, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {specialty.category.toLowerCase()}
                    </span>
                  ))}
                  {shop.specialties.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{shop.specialties.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                  <span>{shop._count.repairRequests} repairs</span>
                  <span>{shop._count.reviews} reviews</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
