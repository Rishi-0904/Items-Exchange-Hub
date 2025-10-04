'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface UserStats {
  totalBooks: number;
  booksAvailable: number;
  booksReserved: number;
  booksSold: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState<UserStats>({
    totalBooks: 0,
    booksAvailable: 0,
    booksReserved: 0,
    booksSold: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/profile/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user statistics');
        }
        
        const data = await response.json();
        setUserStats(data);
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching user statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User Avatar'}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                session?.user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
              <p className="text-white/80">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 m-6 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Books</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Books</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalBooks}</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg shadow-sm">
                <p className="text-green-600 dark:text-green-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{userStats.booksAvailable}</p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg shadow-sm">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">Reserved</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{userStats.booksReserved}</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg shadow-sm">
                <p className="text-red-600 dark:text-red-400 text-sm">Sold</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{userStats.booksSold}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/books/add"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add New Book
            </Link>
            
            <Link
              href="/profile/books"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Manage Books
            </Link>
            
            <Link
              href="/messages"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Messages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 