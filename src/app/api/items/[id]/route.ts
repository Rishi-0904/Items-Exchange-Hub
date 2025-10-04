import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Item, { ItemType, ItemCondition, ItemAvailability } from '@/models/Item';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// GET /api/items/[id] - Get a single item by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid item ID' },
        { status: 400 }
      );
    }
    
    const item = await Item.findById(params.id)
      .populate('owner', 'name email profileImage')
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
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to fetch item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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
        { success: false, message: 'Authentication required' },
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

    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Find the item and verify ownership
    const item = await Item.findOne({ _id: params.id, owner: user._id });
    if (!item) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Item not found or you do not have permission to update it',
          code: 'NOT_FOUND_OR_UNAUTHORIZED'
        },
        { status: 404 }
      );
    }

    // Prevent changing the owner
    if (data.owner && data.owner.toString() !== user._id.toString()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot change item ownership',
          code: 'OWNERSHIP_CHANGE_NOT_ALLOWED'
        },
        { status: 403 }
      );
    }

    // Update only allowed fields
    const allowedUpdates = [
      'title', 'description', 'category', 'condition', 
      'type', 'availability', 'price', 'images', 'location', 'tags'
    ];
    
    const updates = Object.keys(data)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as Record<string, any>);

    // Special handling for price when type changes
    if (updates.type === ItemType.SELL && !updates.price && !item.price) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Price is required when changing type to SELL',
          field: 'price'
        },
        { status: 400 }
      );
    }

    // Apply updates
    Object.assign(item, updates);
    
    // If type is not SELL, remove price
    if (item.type !== ItemType.SELL) {
      item.price = undefined;
    }

    const updatedItem = await item.save();
    
    // Populate owner data in the response
    await updatedItem.populate('owner', 'name email profileImage');

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to update item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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
        { success: false, message: 'Authentication required' },
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

    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid item ID' },
        { status: 400 }
      );
    }

    // Find the item and verify ownership
    const item = await Item.findOne({ _id: params.id, owner: user._id });
    if (!item) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Item not found or you do not have permission to delete it',
          code: 'NOT_FOUND_OR_UNAUTHORIZED'
        },
        { status: 404 }
      );
    }

    // Delete the item
    await Item.deleteOne({ _id: item._id });
    
    // Remove item from user's items array
    await User.findByIdAndUpdate(user._id, {
      $pull: { items: item._id }
    });

    // TODO: Consider adding a transaction here to ensure data consistency
    // TODO: Add cleanup for any associated images in storage

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
      data: { id: item._id.toString() }
    });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to delete item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
