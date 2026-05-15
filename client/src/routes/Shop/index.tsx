import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { PRODUCT_CATEGORIES } from '@guruapp/shared';
import type { Product } from '@guruapp/shared';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const;

type SortBy = 'newest' | 'popular' | 'price_asc' | 'price_desc';

export default function Shop() {
  const [q, setQ] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [category, setCategory] = useState('');
  const [isDigital, setIsDigital] = useState<boolean | undefined>(undefined);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const params = {
    q: submittedQ || undefined,
    category: category || undefined,
    isDigital,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy,
    status: 'ACTIVE' as const,
    page,
    limit: 20,
  };

  const { data, isLoading } = useProductSearch(params);
  const products: Product[] = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQ(q);
    setPage(1);
  }, [q]);

  const clearFilters = () => {
    setQ(''); setSubmittedQ(''); setCategory('');
    setIsDigital(undefined); setMinPrice(''); setMaxPrice('');
    setSortBy('newest'); setPage(1);
  };

  const hasActiveFilters = submittedQ || category || isDigital !== undefined || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-[#202124] mb-1">
          <span className="text-[#4285f4]">G</span>
          <span className="text-[#ea4335]">u</span>
          <span className="text-[#fbbc05]">r</span>
          <span className="text-[#4285f4]">u</span>
          <span className="text-[#34a853]"> </span>
          Shop
        </h1>
        <p className="text-[#5f6368]">Discover products, courses, and digital resources from expert gurus</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-white border border-[#dfe1e5] rounded-full px-5 py-3 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow">
          <Search className="w-5 h-5 text-[#9aa0a6] shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="flex-1 outline-none text-[#202124] text-sm placeholder:text-[#9aa0a6] bg-transparent"
          />
          {q && (
            <button type="button" onClick={() => { setQ(''); setSubmittedQ(''); setPage(1); }}>
              <X className="w-4 h-4 text-[#9aa0a6] hover:text-[#202124]" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[#1a73e8] text-white rounded-full text-sm font-medium hover:bg-[#1557b0] transition-colors shadow-sm"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((f) => !f)}
          className={`p-3 rounded-full border transition-colors ${showFilters ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]' : 'bg-white border-[#dfe1e5] text-[#5f6368] hover:bg-[#f1f3f4]'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-[#e8eaed] rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full border border-[#e8eaed] rounded-lg px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8]"
            >
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">Type</label>
            <select
              value={isDigital === undefined ? '' : String(isDigital)}
              onChange={(e) => { setIsDigital(e.target.value === '' ? undefined : e.target.value === 'true'); setPage(1); }}
              className="w-full border border-[#e8eaed] rounded-lg px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8]"
            >
              <option value="">All types</option>
              <option value="false">Physical</option>
              <option value="true">Digital</option>
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">Min price</label>
            <input
              type="number" min="0" value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              placeholder="0"
              className="w-full border border-[#e8eaed] rounded-lg px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">Max price</label>
            <input
              type="number" min="0" value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              placeholder="Any"
              className="w-full border border-[#e8eaed] rounded-lg px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8]"
            />
          </div>

          {hasActiveFilters && (
            <div className="col-span-2 sm:col-span-4 flex justify-end">
              <button onClick={clearFilters} className="text-xs text-[#ea4335] hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#5f6368]">
          {isLoading ? 'Loading…' : meta ? `${meta.total} product${meta.total !== 1 ? 's' : ''}` : ''}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5f6368]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortBy); setPage(1); }}
            className="border border-[#e8eaed] rounded-lg px-3 py-1.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8]"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden animate-pulse">
              <div className="aspect-square bg-[#f1f3f4]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[#f1f3f4] rounded w-1/2" />
                <div className="h-4 bg-[#f1f3f4] rounded w-3/4" />
                <div className="h-3 bg-[#f1f3f4] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-[#5f6368]">
          <p className="text-lg mb-1">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-full border border-[#e8eaed] text-sm text-[#5f6368] disabled:opacity-40 hover:bg-[#f1f3f4] transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-[#5f6368]">Page {page} of {meta.totalPages}</span>
          <button
            disabled={page === meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-full border border-[#e8eaed] text-sm text-[#5f6368] disabled:opacity-40 hover:bg-[#f1f3f4] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
