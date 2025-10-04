import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import mongoose from 'mongoose';

// Create a new conversation or get existing one
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookId, recipientId } = await req.json();
    
    if (!bookId || !recipientId) {
      return NextResponse.json({ error: 'Book ID and recipient ID are required' }, { status: 400 });
    }
    
    await connect();
    
    const userId = session.user.id;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      book: bookId
    }).populate('participants', 'name image email').populate('book');
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, recipientId],
        book: bookId
      });
      
      await conversation.save();
      await conversation.populate('participants', 'name image email');
      await conversation.populate('book');
    }
    
    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error('Error creating/finding conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

// Get messages for a specific conversation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    await connect();
    
    const userId = session.user.id;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get messages for the conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name image email')
      .sort({ createdAt: 1 });
    
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
