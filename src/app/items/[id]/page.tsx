'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookType, BookCondition, BookAvailability } from '@/models/Book';

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
  updatedAt: string;
}

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const bookId = params.id;
  const isOwner = session?.user?.id === book?.owner._id;
  const defaultImage = '/images/book-placeholder.jpg';

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/books/${bookId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found');
          }
          throw new Error('Failed to fetch book details');
        }
        
        const data = await response.json();
        setBook(data);
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching book details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Function to handle book deletion
  const handleDeleteBook = async () => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      router.push('/profile/books?deleted=true');
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the book');
      setIsDeleting(false);
    }
  };

  // Function to handle message button click
  const handleMessageClick = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/books/${bookId}`);
      return;
    }
    
    // Redirect to the conversation page or create a new conversation
    router.push(`/messages?bookId=${bookId}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Books
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Book Not Found</h2>
          <p>The book you are looking for could not be found.</p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* Book Details */}
        <div className="md:flex">
          {/* Book Image */}
          <div className="md:w-1/3 p-4">
            <div className="relative h-80 w-full mb-4">
              <Image
                src={book.images?.length > 0 ? book.images[0] : defaultImage}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain rounded-md"
                priority
              />
            </div>
            {/* Additional Images */}
            {book.images && book.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {book.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative h-16 w-full">
                    <Image
                      src={image}
                      alt={`${book.title} - image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 10vw"
                      className="object-cover rounded-md cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">by {book.author}</p>
              </div>
              <span className={`${getBadgeColor(book.availability)} text-sm font-semibold px-3 py-1 rounded-full`}>
                {book.availability}
              </span>
            </div>

            {book.price !== undefined && book.price > 0 && (
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                ₹{book.price}
              </div>
            )}

            {/* Book Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                <p className="text-base text-gray-900 dark:text-white">{book.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</h3>
                <p className="text-base text-gray-900 dark:text-white">{book.condition}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Added on</h3>
                <p className="text-base text-gray-900 dark:text-white">{formatDate(book.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                <p className="text-base text-gray-900 dark:text-white">{formatDate(book.updatedAt)}</p>
              </div>
            </div>

            {/* Genres */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {book.genre.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-md text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{book.description}</p>
              </div>
            )}

            {/* Owner Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Owner</h3>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold mr-3">
                  {book.owner.profileImage ? (
                    <Image
                      src={book.owner.profileImage}
                      alt={book.owner.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    book.owner.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{book.owner.name}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              {isOwner ? (
                <>
                  <Link
                    href={`/books/edit/${bookId}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Edit Book
                  </Link>
                  <button
                    onClick={handleDeleteBook}
                    disabled={isDeleting}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Book'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleMessageClick}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Message Owner
                  </button>
                </>
              )}
              <Link
                href="/books"
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 