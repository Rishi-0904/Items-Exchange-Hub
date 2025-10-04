import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { conversationId, content } = await req.json();
    
    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Conversation ID and content are required' }, { status: 400 });
    }
    
    await connect();
    
    const userId = session.user.id;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      readBy: [userId] // Mark as read by sender
    });
    
    await message.save();
    
    // Update conversation's last message and timestamp
    conversation.lastMessage = content.trim();
    conversation.updatedAt = new Date();
    await conversation.save();
    
    // Populate sender info for response
    await message.populate('sender', 'name image email');
    
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// Mark messages as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { conversationId } = await req.json();
    
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
    
    // Mark all unread messages in this conversation as read by this user
    await Message.updateMany(
      { 
        conversation: conversationId,
        readBy: { $ne: userId }
      },
      { 
        $addToSet: { readBy: userId }
      }
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
