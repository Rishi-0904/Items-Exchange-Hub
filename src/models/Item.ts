import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[];
  seller: Types.ObjectId;
  status: 'available' | 'pending' | 'sold' | 'traded';
  tradeOptions: {
    acceptTrades: boolean;
    preferredItems: string[];
  };
  location: {
    hostel: string;
    roomNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'electronics',
        'furniture',
        'books',
        'clothing',
        'sports',
        'stationery',
        'other',
      ],
    },
    condition: {
      type: String,
      required: true,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    images: [{
      type: String,
      required: [true, 'Please upload at least one image'],
    }],
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'sold', 'traded'],
      default: 'available',
    },
    tradeOptions: {
      acceptTrades: {
        type: Boolean,
        default: false,
      },
      preferredItems: [{
        type: String,
      }],
    },
    location: {
      hostel: {
        type: String,
        enum: ['BH-1', 'BH-2', 'BH-3', 'GH-1', 'GH-2', 'GH-3', 'off-campus'],
        required: true,
      },
      roomNumber: String,
    },
  },
  { timestamps: true }
);

// Add text index for search functionality
ItemSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
});

// Delete the model if it's already defined to prevent overwrite errors during development
const Item: mongoose.Model<IItem> = mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
