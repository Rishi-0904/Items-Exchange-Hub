import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IBook } from './Book';

export interface IConversation extends Document {
  participants: (mongoose.Types.ObjectId | IUser)[];
  book: mongoose.Types.ObjectId | IBook;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Conversation must have participants'],
    }],
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Conversation must be about a book'],
    },
    lastMessage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure a conversation is unique between participants about a specific book
ConversationSchema.index({ participants: 1, book: 1 }, { unique: true });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation; 