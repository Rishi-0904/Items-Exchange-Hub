import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/transactions - Get user's transactions
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'buying', 'selling', or 'trading'
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: any = {
      $or: [
        { buyer: user._id },
        { seller: user._id },
      ],
    };

    if (status) query.status = status;
    if (type === 'buying') {
      query.buyer = user._id;
      delete query.$or;
    } else if (type === 'selling') {
      query.seller = user._id;
      delete query.$or;
    } else if (type === 'trading') {
      query.isTrade = true;
    }

    const transactions = await Transaction.find(query)
      .populate('item', 'title price images')
      .populate('buyer', 'name email profileImage')
      .populate('seller', 'name email profileImage')
      .populate('tradedItem', 'title price images')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: transactions,
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

// POST /api/transactions - Create a new transaction (initiate exchange)
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

    const { itemId, message, isTrade, tradedItemId, price } = await request.json();

    // Validate input
    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get the item being requested
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if user is not the seller
    if (item.seller.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Cannot create transaction for your own item' },
        { status: 400 }
      );
    }

    // For trades, validate the traded item
    let tradedItem = null;
    if (isTrade && tradedItemId) {
      tradedItem = await Item.findOne({ _id: tradedItemId, seller: user._id });
      if (!tradedItem) {
        return NextResponse.json(
          { success: false, message: 'Traded item not found or not owned by you' },
          { status: 400 }
        );
      }
    } else if (isTrade) {
      return NextResponse.json(
        { success: false, message: 'Traded item ID is required for trade' },
        { status: 400 }
      );
    } else if (!price && !isTrade) {
      return NextResponse.json(
        { success: false, message: 'Price is required for non-trade transactions' },
        { status: 400 }
      );
    }

    // Check for existing pending transaction
    const existingTransaction = await Transaction.findOne({
      item: itemId,
      buyer: user._id,
      status: 'pending',
    });

    if (existingTransaction) {
      return NextResponse.json(
        { success: false, message: 'A pending transaction already exists for this item' },
        { status: 400 }
      );
    }

    // Create new transaction
    const transaction = new Transaction({
      item: itemId,
      seller: item.seller,
      buyer: user._id,
      tradedItem: isTrade ? tradedItemId : null,
      status: 'pending',
      isTrade,
      price: isTrade ? null : price,
      messages: [
        {
          sender: user._id,
          message: message || 'I\'m interested in this item' + (isTrade ? ' and would like to trade.' : ''),
        },
      ],
    });

    const savedTransaction = await transaction.save();

    // Update item status to pending
    await Item.findByIdAndUpdate(itemId, { status: 'pending' });
    if (tradedItem) {
      await Item.findByIdAndUpdate(tradedItemId, { status: 'pending' });
    }

    return NextResponse.json({
      success: true,
      data: savedTransaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
