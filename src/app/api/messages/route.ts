import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    await connect();
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).populate({
      path: 'participants',
      select: 'name image email'
    }).populate('book').sort({ updatedAt: -1 });
    
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
} 