'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// Dynamically import components to enable code splitting
const ItemCard = dynamic(() => import('@/components/items/ItemCard'), {
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>,
});

const ItemFilter = dynamic(() => import('@/components/items/ItemFilter'), {
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>,
});

const ItemSearch = dynamic(() => import('@/components/items/ItemSearch'), {
  loading: () => <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>,
});

interface Item {
  _id: string;
  title: string;
  description?: string;
  category: string[];
  condition: string;
  type: string;
  availability: string;
  price?: number;
  images: string[];
  owner: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface FilterState {
  type: string[];
  category: string[];
  condition: string[];
  availability: string[];
}

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    category: [],
    condition: [],
    availability: [],
  });
  const [cursor, setCursor] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Fetch items when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // Apply filters and search whenever they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [items, searchTerm, filters]);

  // Fetch items from the API
  const fetchItems = async (reset = true) => {
    try {
      setIsLoading(true);
      
      const url = new URL('/api/items', window.location.origin);
      
      if (!reset && cursor) {
        url.searchParams.append('cursor', cursor);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      
      if (reset) {
        setItems(data.items || []);
      } else {
        setItems((prevItems: Item[]) => [...prevItems, ...(data.items || [])]);
      }
      
      setCursor(data.nextCursor || '');
      setHasMore(!!data.nextCursor);
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching items');
      setIsLoading(false);
    }
  };

  // Load more items when the user scrolls to the bottom
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchItems(false);
    }
  };

  // Apply filters and search to the items
  const applyFiltersAndSearch = () => {
    let result = [...items];

    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          item.category.some((c) => c.toLowerCase().includes(search))
      );
    }

    // Apply other filters
    if (filters.type.length > 0) {
      result = result.filter((item) => filters.type.includes(item.type));
    }

    if (filters.category.length > 0) {
      result = result.filter((item) =>
        item.category.some((c) => filters.category.includes(c))
      );
    }

    if (filters.condition.length > 0) {
      result = result.filter((item) => filters.condition.includes(item.condition));
    }

    if (filters.availability.length > 0) {
      result = result.filter((item) => filters.availability.includes(item.availability));
    }

    setFilteredItems(result);
  };

  // Handle search input change
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Handle filter changes
  const handleFilterChange = (filterName: string, values: string[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: values,
    }));
  };

  // Navigate to item details page
  const handleItemClick = (itemId: string) => {
    router.push(`/items/${itemId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Items</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Find items to exchange, buy, or sell in your community
          </p>
        </div>
        <button
          onClick={() => router.push('/items/add')}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Search and filter section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full lg:w-1/4">
          <ItemFilter onFilterChange={handleFilterChange} />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6">
            <ItemSearch 
              onSearch={handleSearch} 
              placeholder="Search items by name, category, or description..."
              className="w-full"
            />
          </div>

          {/* Loading state */}
          {isLoading && items.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
              <h3 className="font-medium">Error loading items</h3>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => fetchItems(true)}
                className="mt-2 text-sm text-red-700 dark:text-red-300 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No items found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || Object.values(filters).some(arr => arr.length > 0) 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Be the first to add an item to the marketplace!'
                }
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/items/add')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Item
                </button>
              </div>
            </div>
          )}

          {/* Items grid */}
          {!isLoading && filteredItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    onClick={() => handleItemClick(item._id)}
                  />
                ))}
              </div>

              {/* Load more button */}
              {!isLoading && hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 