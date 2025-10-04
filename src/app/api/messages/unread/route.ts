import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// Get unread message count for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    
    const userId = session.user.id;
    await connect();
    
    // Get all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).select('_id');
    
    const conversationIds = conversations.map(conv => conv._id);
    
    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      readBy: { $ne: userId }
    });
    
    return NextResponse.json({ count: unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
