'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import BookForm from '@/components/BookForm';

export default function AddBookPage() {
  const { data: session, status } = useSession();
  
  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin?callbackUrl=/books/add');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add a New Book</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Fill in the details below to add a book to your collection.
        </p>
      </div>
      
      {status === 'loading' ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <BookForm />
      )}
    </div>
  );
} 