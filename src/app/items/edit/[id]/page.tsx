'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BookForm from '@/components/BookForm';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditBookPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const bookId = params.id;
  
  // Fetch book data
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
        
        // Check if the logged-in user is the owner of the book
        if (session?.user?.id !== data.owner._id) {
          throw new Error('You do not have permission to edit this book');
        }
        
        setBookData(data);
      } catch (error: any) {
        setError(error.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated' && bookId) {
      fetchBook();
    } else if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/books/edit/${bookId}`);
    }
  }, [bookId, session, status, router]);
  
  if (status === 'loading' || isLoading) {
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
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Book</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Make changes to your book listing below.
        </p>
      </div>
      
      {bookData && (
        <BookForm
          initialData={bookData}
          bookId={bookId}
          isEditing={true}
        />
      )}
    </div>
  );
} 