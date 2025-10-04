import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET(req: NextRequest) {
  try {
    // Get authentication token and verify
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { message: 'Unauthorized - You must be signed in to view your books' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get all books owned by the current user
    const books = await Book.find({ owner: token.id })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ books });
  } catch (error: any) {
    console.error('Error fetching user books:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch your books' },
      { status: 500 }
    );
  }
} 