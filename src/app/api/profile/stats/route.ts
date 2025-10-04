import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';
import { BookAvailability } from '@/models/Book';

export async function GET(req: NextRequest) {
  try {
    // Get authentication token and verify
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { message: 'Unauthorized - You must be signed in to view your statistics' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get user book statistics
    const userId = token.id;
    
    // Get total number of books
    const totalBooks = await Book.countDocuments({ owner: userId });
    
    // Get number of available books
    const booksAvailable = await Book.countDocuments({ 
      owner: userId,
      availability: BookAvailability.AVAILABLE
    });
    
    // Get number of reserved books
    const booksReserved = await Book.countDocuments({ 
      owner: userId,
      availability: BookAvailability.RESERVED
    });
    
    // Get number of sold books
    const booksSold = await Book.countDocuments({ 
      owner: userId,
      availability: BookAvailability.SOLD
    });
    
    // Return the statistics
    return NextResponse.json({
      totalBooks,
      booksAvailable,
      booksReserved,
      booksSold
    });
  } catch (error: any) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch your statistics' },
      { status: 500 }
    );
  }
} 