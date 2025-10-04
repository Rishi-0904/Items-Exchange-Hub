import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get all books with owner information
    const books = await Book.find()
      .populate('owner', 'name email profileImage')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ books });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get authentication token and verify
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - You must be signed in to add a book' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.author || !data.genre || !data.condition || !data.type) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Create new book
    const newBook = new Book({
      ...data,
      owner: token.id,
    });
    
    // Save the book
    await newBook.save();
    
    // Return the new book with populated owner
    const savedBook = await Book.findById(newBook._id)
      .populate('owner', 'name email profileImage')
      .lean();
    
    return NextResponse.json(savedBook, { status: 201 });
  } catch (error: any) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create book' },
      { status: 500 }
    );
  }
} 