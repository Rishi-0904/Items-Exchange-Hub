import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Item, { ItemType, ItemCondition, ItemAvailability } from '@/models/Item';
import User from '@/models/User';

interface ItemQueryParams {
  category?: string | string[];
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: ItemCondition | ItemCondition[];
  type?: ItemType | ItemType[];
  availability?: ItemAvailability;
  limit?: string;
  page?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
}

interface ItemResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  field?: string;
  fields?: string[];
  code?: string;
  error?: string;
}

// GET /api/items - Get all items with optional filters
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const params: ItemQueryParams = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      condition: searchParams.get('condition') as ItemCondition || undefined,
      type: searchParams.get('type') as ItemType || undefined,
      availability: (searchParams.get('availability') as ItemAvailability) || ItemAvailability.AVAILABLE,
      limit: searchParams.get('limit') || '20',
      page: searchParams.get('page') || '1',
      sortBy: (searchParams.get('sortBy') as 'newest' | 'price_asc' | 'price_desc') || 'newest'
    };

    const limit = parseInt(params.limit || '20');
    const page = parseInt(params.page || '1');
    const skip = (page - 1) * limit;

    // Build the query
    const query: any = { availability: params.availability };
    
    // Category filter (can be array or single value)
    if (params.category) {
      query.category = Array.isArray(params.category) 
        ? { $in: params.category } 
        : params.category;
    }

    // Condition filter
    if (params.condition) {
      query.condition = Array.isArray(params.condition)
        ? { $in: params.condition }
        : params.condition;
    }

    // Type filter
    if (params.type) {
      query.type = Array.isArray(params.type)
        ? { $in: params.type }
        : params.type;
    }

    // Price range filter
    if (params.minPrice || params.maxPrice) {
      query.price = {};
      if (params.minPrice) query.price.$gte = parseFloat(params.minPrice);
      if (params.maxPrice) query.price.$lte = parseFloat(params.maxPrice);
    }

    // Text search
    if (params.search) {
      query.$text = { $search: params.search };
    }

    // Sorting
    const sortOptions: Record<string, any> = {};
    switch (params.sortBy) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'newest':
      default:
        sortOptions.createdAt = -1;
        break;
    }

    // Execute query with pagination and sorting
    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('owner', 'name email profileImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query)
    ]);

    const response: ItemResponse<typeof items> = {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching items:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to fetch items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/items - Create a new item
export async function POST(request: Request) {
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

    const data = await request.json();
    
    // Input validation
    const requiredFields = ['title', 'description', 'category', 'condition', 'type'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          fields: missingFields
        },
        { status: 400 }
      );
    }

    // Price is required for items being sold
    if (data.type === ItemType.SELL && (data.price === undefined || data.price < 0)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'A valid price is required for items being sold',
          field: 'price'
        },
        { status: 400 }
      );
    }

    // Validate category values
    const validCategories = [
      'electronics', 'furniture', 'clothing', 'sports', 
      'stationery', 'home-appliances', 'vehicles', 'books', 'other'
    ];
    
    const invalidCategories = data.category.filter(
      (cat: string) => !validCategories.includes(cat)
    );
    
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid categories: ${invalidCategories.join(', ')}`,
          field: 'category'
        },
        { status: 400 }
      );
    }

    // Create new item
    const itemData = {
      ...data,
      owner: user._id,
      availability: ItemAvailability.AVAILABLE,
      // Ensure price is only set for items being sold
      price: data.type === ItemType.SELL ? parseFloat(data.price) : undefined,
      // Ensure images is always an array
      images: Array.isArray(data.images) ? data.images : [],
    };

    const item = new Item(itemData);
    const savedItem = await item.save();
    
    // Add item to user's items array
    await User.findByIdAndUpdate(user._id, {
      $push: { items: savedItem._id }
    });

    const response: ItemResponse<typeof savedItem> = {
      success: true,
      data: savedItem
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Validation failed',
        fields: Object.keys(error.errors),
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Failed to create item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
