import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IConversation } from './Conversation';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId | IConversation;
  sender: mongoose.Types.ObjectId | IUser;
  content: string;
  readBy: (mongoose.Types.ObjectId | IUser)[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Message must belong to a conversation'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    content: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

// Create index on conversation for faster queries
MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message; 