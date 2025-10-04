'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookCard from '@/components/BookCard';
import BookFilter from '@/components/BookFilter';
import BookSearch from '@/components/BookSearch';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  genre: string[];
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
}

interface FilterState {
  type: string[];
  genre: string[];
  condition: string[];
  availability: string[];
}

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    genre: [],
    condition: [],
    availability: [],
  });
  const [cursor, setCursor] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Fetch books when the component mounts
  useEffect(() => {
    fetchBooks();
  }, []);

  // Apply filters and search whenever they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [books, searchTerm, filters]);

  // Fetch books from the API
  const fetchBooks = async (reset = true) => {
    try {
      setIsLoading(true);
      
      const url = new URL('/api/books', window.location.origin);
      
      if (!reset && cursor) {
        url.searchParams.append('cursor', cursor);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      
      if (reset) {
        setBooks(data.books);
      } else {
        setBooks((prevBooks) => [...prevBooks, ...data.books]);
      }
      
      setCursor(data.nextCursor || '');
      setHasMore(!!data.nextCursor);
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching books');
      setIsLoading(false);
    }
  };

  // Load more books when the user scrolls to the bottom
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchBooks(false);
    }
  };

  // Apply filters and search to the books
  const applyFiltersAndSearch = () => {
    let result = [...books];

    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search) ||
          (book.description && book.description.toLowerCase().includes(search)) ||
          book.genre.some((g) => g.toLowerCase().includes(search))
      );
    }

    // Apply other filters
    if (filters.type.length > 0) {
      result = result.filter((book) => filters.type.includes(book.type));
    }

    if (filters.genre.length > 0) {
      result = result.filter((book) =>
        book.genre.some((g) => filters.genre.includes(g))
      );
    }

    if (filters.condition.length > 0) {
      result = result.filter((book) => filters.condition.includes(book.condition));
    }

    if (filters.availability.length > 0) {
      result = result.filter((book) => filters.availability.includes(book.availability));
    }

    setFilteredBooks(result);
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

  // Navigate to book details page
  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Books</h1>

      {/* Search and filter section */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-8">
        <div className="w-full md:w-2/3">
          <BookSearch onSearch={handleSearch} />
        </div>
        <div className="w-full md:w-1/3">
          <BookFilter onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && books.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No books found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Books grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard 
            key={book._id} 
            book={book} 
            onClick={() => handleBookClick(book._id)} 
          />
        ))}
      </div>

      {/* Load more button */}
      {!isLoading && hasMore && filteredBooks.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => loadMore()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Load More
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && books.length > 0 && (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
} 