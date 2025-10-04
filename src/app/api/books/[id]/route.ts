import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';
import mongoose from 'mongoose';

// Get a specific book by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid book ID' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Find book by ID and populate owner details
    const book = await Book.findById(id)
      .populate('owner', 'name email profileImage')
      .lean();
    
    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    
    return NextResponse.json(book);
  } catch (error: any) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// Update a book
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - You must be signed in to update a book' },
        { status: 401 }
      );
    }
    
    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid book ID' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Find the book
    const book = await Book.findById(id);
    
    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    
    // Verify that the user is the owner of the book
    if (book.owner.toString() !== token.id) {
      return NextResponse.json(
        { message: 'Forbidden - You can only update your own books' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const updateData = await req.json();
    
    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('owner', 'name email profileImage');
    
    return NextResponse.json(updatedBook);
  } catch (error: any) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update book' },
      { status: 500 }
    );
  }
}

// Delete a book
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - You must be signed in to delete a book' },
        { status: 401 }
      );
    }
    
    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid book ID' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Find the book
    const book = await Book.findById(id);
    
    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    
    // Verify that the user is the owner of the book
    if (book.owner.toString() !== token.id) {
      return NextResponse.json(
        { message: 'Forbidden - You can only delete your own books' },
        { status: 403 }
      );
    }
    
    // Delete the book
    await Book.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Book deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete book' },
      { status: 500 }
    );
  }
} 