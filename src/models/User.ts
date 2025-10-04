import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  phone?: string;
  hostel?: string;
  roomNumber?: string;
  items: Types.ObjectId[];
  wishlist: Types.ObjectId[];
  rating?: number;
  reviews: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^[\w-\.]+@mnnit\.ac\.in$/, 'Please provide a valid MNNIT email'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password should be at least 6 characters long'],
    },
    profileImage: {
      type: String,
      default: '/default-avatar.png',
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    hostel: {
      type: String,
      enum: ['BH-1', 'BH-2', 'BH-3', 'GH-1', 'GH-2', 'GH-3'],
    },
    roomNumber: String,
    items: [{
      type: Schema.Types.ObjectId,
      ref: 'Item',
    }],
    wishlist: [{
      type: Schema.Types.ObjectId,
      ref: 'Item',
    }],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Delete the User model if it's already defined to prevent overwrite errors during development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 