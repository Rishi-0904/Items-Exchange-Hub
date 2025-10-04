import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/transactions/[id] - Get a single transaction by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const transaction = await Transaction.findOne({
      _id: params.id,
      $or: [
        { buyer: user._id },
        { seller: user._id },
      ],
    })
      .populate('item', 'title price images')
      .populate('buyer', 'name email profileImage')
      .populate('seller', 'name email profileImage')
      .populate('tradedItem', 'title price images')
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction (e.g., accept, reject, complete, cancel, add message)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { action, message, meetingDetails } = await request.json();
    
    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: params.id,
      $or: [
        { buyer: user._id },
        { seller: user._id },
      ],
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found or not authorized' },
        { status: 404 }
      );
    }

    // Add message if provided
    if (message) {
      transaction.messages.push({
        sender: user._id,
        message,
      });
    }

    // Handle different actions
    if (action) {
      const isSeller = transaction.seller.toString() === user._id.toString();
      const isBuyer = transaction.buyer.toString() === user._id.toString();

      switch (action) {
        case 'accept':
          if (!isSeller) {
            return NextResponse.json(
              { success: false, message: 'Only the seller can accept the transaction' },
              { status: 403 }
            );
          }
          transaction.status = 'accepted';
          if (meetingDetails) {
            transaction.meetingDetails = meetingDetails;
          }
          break;

        case 'reject':
          if (!isSeller) {
            return NextResponse.json(
              { success: false, message: 'Only the seller can reject the transaction' },
              { status: 403 }
            );
          }
          transaction.status = 'rejected';
          // Make items available again
          await Item.updateMany(
            { _id: { $in: [transaction.item, transaction.tradedItem].filter(Boolean) } },
            { status: 'available' }
          );
          break;

        case 'complete':
          if (!isSeller) {
            return NextResponse.json(
              { success: false, message: 'Only the seller can complete the transaction' },
              { status: 403 }
            );
          }
          transaction.status = 'completed';
          // Mark items as sold/traded
          await Item.updateMany(
            { _id: { $in: [transaction.item, transaction.tradedItem].filter(Boolean) } },
            { status: 'sold' }
          );
          break;

        case 'cancel':
          if (!isBuyer) {
            return NextResponse.json(
              { success: false, message: 'Only the buyer can cancel the transaction' },
              { status: 403 }
            );
          }
          transaction.status = 'cancelled';
          // Make items available again
          await Item.updateMany(
            { _id: { $in: [transaction.item, transaction.tradedItem].filter(Boolean) } },
            { status: 'available' }
          );
          break;

        default:
          return NextResponse.json(
            { success: false, message: 'Invalid action' },
            { status: 400 }
          );
      }
    }

    const updatedTransaction = await transaction.save();

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
