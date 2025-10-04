'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookAvailability } from '@/models/Book';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string[];
  condition: string;
  type: string;
  availability: string;
  price?: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin?callbackUrl=/profile/books');
  }
  
  // Check for status messages from URL
  useEffect(() => {
    const deleted = searchParams.get('deleted');
    if (deleted === 'true') {
      setSuccessMessage('Book deleted successfully');
    }
  }, [searchParams]);
  
  // Fetch user's books
  useEffect(() => {
    const fetchUserBooks = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/profile/books');
        
        if (!response.ok) {
          throw new Error('Failed to fetch your books');
        }
        
        const data = await response.json();
        setBooks(data.books);
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching your books');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserBooks();
  }, [status]);
  
  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      // Remove book from state
      setBooks(books.filter(book => book._id !== bookId));
      setSuccessMessage('Book deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the book');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get badge color based on availability
  const getBadgeColor = (availability: string) => {
    switch (availability) {
      case BookAvailability.AVAILABLE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case BookAvailability.RESERVED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case BookAvailability.SOLD:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Your Books</h1>
        <Link
          href="/books/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add New Book
        </Link>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Books Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't added any books yet. Add your first book to get started.
          </p>
          <Link
            href="/books/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Your First Book
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Book
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            src={book.images.length > 0 ? book.images[0] : '/images/book-placeholder.jpg'}
                            alt={book.title}
                            fill
                            sizes="40px"
                            className="rounded object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            by {book.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {book.type} • {book.condition}
                      </div>
                      {book.price !== undefined && book.price > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ₹{book.price}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(book.availability)}`}>
                        {book.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(book.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/books/${book._id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          View
                        </Link>
                        <Link
                          href={`/books/edit/${book._id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 