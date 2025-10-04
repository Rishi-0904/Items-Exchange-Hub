import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@mnnit\.ac\.in$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please use a valid MNNIT email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Save user (password hashing happens in the model pre-save hook)
    await newUser.save();

    // Return success response
    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Return appropriate error message
    return NextResponse.json(
      { message: error.message || 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 