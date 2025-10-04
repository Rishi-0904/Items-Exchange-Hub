import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export enum BookCondition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  VERY_GOOD = 'Very Good',
  GOOD = 'Good',
  ACCEPTABLE = 'Acceptable',
}

export enum BookAvailability {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  SOLD = 'Sold',
}

export enum BookType {
  SELL = 'Sell',
  LEND = 'Lend',
  EXCHANGE = 'Exchange',
}

export interface IBook extends Document {
  title: string;
  author: string;
  description?: string;
  genre: string[];
  condition: BookCondition;
  type: BookType;
  availability: BookAvailability;
  price?: number;
  images: string[];
  owner: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide an author'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'Please provide at least one genre'],
    },
    condition: {
      type: String,
      enum: Object.values(BookCondition),
      required: [true, 'Please specify the condition of the book'],
    },
    type: {
      type: String,
      enum: Object.values(BookType),
      required: [true, 'Please specify if the book is for sale, lending, or exchange'],
    },
    availability: {
      type: String,
      enum: Object.values(BookAvailability),
      default: BookAvailability.AVAILABLE,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Book must have an owner'],
    },
  },
  { timestamps: true }
);

// Create indexes for search functionality
BookSchema.index({ title: 'text', author: 'text', description: 'text' });

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book; 