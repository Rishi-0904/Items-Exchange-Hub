import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/items - Get all items with optional filters
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const status = searchParams.get('status') || 'available';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: any = { status };
    
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const items = await Item.find(query)
      .populate('seller', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Item.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
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

    const data = await request.json();
    
    // Basic validation
    if (!data.title || !data.description || data.price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and price are required' },
        { status: 400 }
      );
    }

    // Create new item
    const item = new Item({
      ...data,
      seller: user._id,
      status: 'available',
    });

    const savedItem = await item.save();
    
    // Add item to user's items array
    await User.findByIdAndUpdate(user._id, {
      $push: { items: savedItem._id }
    });

    return NextResponse.json({
      success: true,
      data: savedItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
