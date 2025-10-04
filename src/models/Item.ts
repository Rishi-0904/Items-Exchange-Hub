import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export enum ItemCondition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  VERY_GOOD = 'Very Good',
  GOOD = 'Good',
  FAIR = 'Fair',
  ACCEPTABLE = 'Acceptable',
}

export enum ItemAvailability {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  SOLD = 'Sold',
}

export enum ItemType {
  SELL = 'Sell',
  LEND = 'Lend',
  EXCHANGE = 'Exchange',
}

export interface IItem extends Document {
  title: string;
  description: string;
  category: string[];
  condition: ItemCondition;
  type: ItemType;
  availability: ItemAvailability;
  price?: number;
  images: string[];
  owner: mongoose.Types.ObjectId | IUser;
  location?: {
    type: string;
    coordinates: number[];
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the item'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    category: {
      type: [String],
      required: [true, 'Please select at least one category'],
      enum: [
        'electronics',
        'furniture',
        'clothing',
        'sports',
        'stationery',
        'home-appliances',
        'vehicles',
        'books',
        'other',
      ],
    },
    condition: {
      type: String,
      enum: Object.values(ItemCondition),
      required: [true, 'Please specify the condition of the item'],
    },
    type: {
      type: String,
      enum: Object.values(ItemType),
      required: [true, 'Please specify if the item is for sale, lending, or exchange'],
    },
    availability: {
      type: String,
      enum: Object.values(ItemAvailability),
      default: ItemAvailability.AVAILABLE,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      required: function() {
        return this.type === ItemType.SELL;
      },
    },
    images: [
      {
        type: String,
        required: [true, 'Please provide at least one image'],
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must have an owner'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Please provide location coordinates'],
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, 'Tag cannot be more than 20 characters'],
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for search functionality
ItemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Create geospatial index for location-based queries
ItemSchema.index({ location: '2dsphere' });

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
