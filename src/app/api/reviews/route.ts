import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

// GET /api/reviews - Get reviews for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query = { reviewee: userId };
    
    const reviews = await Review.find(query)
      .populate('reviewer', 'name profileImage')
      .populate('item', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(query);
    const averageRating = await Review.aggregate([
      { $match: { reviewee: userId } },
      { $group: { _id: null, average: { $avg: '$rating' } } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating: averageRating[0]?.average?.toFixed(1) || 0,
        total,
      },
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { transactionId, rating, comment } = await request.json();

    // Validate input
    if (!transactionId || !rating) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      $or: [
        { buyer: user._id },
        { seller: user._id },
      ],
      status: 'completed',
    });

    if (!transaction) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Transaction not found, not authorized, or not completed' 
        },
        { status: 404 }
      );
    }

    // Determine who is being reviewed (the other party in the transaction)
    const isBuyer = transaction.buyer.toString() === user._id.toString();
    const reviewee = isBuyer ? transaction.seller : transaction.buyer;
    const item = transaction.item;

    // Check if review already exists for this transaction and reviewer
    const existingReview = await Review.findOne({
      transaction: transactionId,
      reviewer: user._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this transaction' },
        { status: 400 }
      );
    }

    // Create new review
    const review = new Review({
      rating,
      comment,
      reviewer: user._id,
      reviewee,
      item,
      transaction: transactionId,
    });

    const savedReview = await review.save();

    // Add review to user's reviews array
    await User.findByIdAndUpdate(reviewee, {
      $push: { reviews: savedReview._id },
    });

    return NextResponse.json({
      success: true,
      data: savedReview,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
