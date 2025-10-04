import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/items/[id] - Get a single item by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const item = await Item.findById(params.id)
      .populate('seller', 'name email profileImage')
      .lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update an item
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

    const data = await request.json();
    
    // Find the item and verify ownership
    const item = await Item.findOne({ _id: params.id, seller: user._id });
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found or not authorized' },
        { status: 404 }
      );
    }

    // Update item
    Object.assign(item, data);
    const updatedItem = await item.save();

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(
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

    // Find and delete the item if user is the owner
    const result = await Item.deleteOne({ _id: params.id, seller: user._id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Item not found or not authorized' },
        { status: 404 }
      );
    }

    // Remove item from user's items array
    await User.findByIdAndUpdate(user._id, {
      $pull: { items: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
