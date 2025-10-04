'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import MessagingInterface from '@/components/MessagingInterface';
import MessageList from '@/components/MessageList';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to access your messages.</p>
          <a
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">Connect with other book enthusiasts</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-200px)]">
            {conversationId ? (
              <MessageList conversationId={conversationId} />
            ) : (
              <MessagingInterface />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
