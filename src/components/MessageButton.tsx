'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface MessageButtonProps {
  bookId: string;
  ownerId: string;
  bookTitle: string;
  ownerName: string;
}

export default function MessageButton({ bookId, ownerId, bookTitle, ownerName }: MessageButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleMessage = async () => {
    if (!session?.user) {
      alert('Please sign in to send messages');
      return;
    }

    if (session.user.id === ownerId) {
      alert('You cannot message yourself');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          recipientId: ownerId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to messaging page with the conversation
        window.location.href = `/messages?conversation=${data.conversation._id}`;
      } else {
        console.error('Failed to create conversation:', data.error);
        alert('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.id === ownerId) {
    return null; // Don't show message button for own books
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Starting conversation...' : `Message ${ownerName} about this book`}
    </button>
  );
}
