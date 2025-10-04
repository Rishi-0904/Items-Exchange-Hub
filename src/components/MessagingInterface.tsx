'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import MessageList from './MessageList';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
    email: string;
  }>;
  book: {
    _id: string;
    title: string;
    author: string;
    images: string[];
  };
  lastMessage?: string;
  updatedAt: string;
}

export default function MessagingInterface() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations);
      } else {
        console.error('Failed to fetch conversations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== session?.user?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        </div>
        
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet. Start a conversation by messaging someone about a book!
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversation === conversation._id;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {otherParticipant?.image ? (
                        <img
                          src={otherParticipant.image}
                          alt={otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {otherParticipant?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant?.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        About: {conversation.book.title}
                      </p>
                      
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <MessageList 
            conversationId={selectedConversation} 
            onMessageSent={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
