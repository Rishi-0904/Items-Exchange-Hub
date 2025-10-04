import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IItem } from './Item';

export interface IConversation extends Document {
  participants: (mongoose.Types.ObjectId | IUser)[];
  item: mongoose.Types.ObjectId | IItem;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Conversation must have participants'],
      validate: [
        {
          validator: function(participants: mongoose.Types.ObjectId[]) {
            return participants.length === 2; // Only allow conversations between 2 users
          },
          message: 'Conversation must have exactly 2 participants',
        },
      ],
    }],
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Conversation must be about an item'],
    },
    lastMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot be longer than 500 characters'],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure a conversation is unique between participants about a specific item
ConversationSchema.index({ participants: 1, item: 1 }, { unique: true });

// Index for sorting conversations by last message time
ConversationSchema.index({ lastMessageAt: -1 });

// Virtual for messages
ConversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation',
  options: { sort: { createdAt: -1 } },
});

// Populate participants and item by default
ConversationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'participants',
    select: 'name email profileImage',
  }).populate({
    path: 'item',
    select: 'title images price type availability',
  });
  next();
});

// Update lastMessage and lastMessageAt when a new message is added
ConversationSchema.statics.updateLastMessage = async function(conversationId: string, message: string) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: message,
      lastMessageAt: Date.now(),
      $inc: { unreadCount: 1 },
    },
    { new: true }
  );
};

// Mark messages as read
ConversationSchema.statics.markAsRead = async function(conversationId: string, userId: string) {
  await this.model('Message').updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      read: false,
    },
    { $set: { read: true, readAt: Date.now() } }
  );

  return this.findByIdAndUpdate(
    conversationId,
    { $set: { unreadCount: 0 } },
    { new: true }
  );
};

const Conversation: Model<IConversation> = 
  mongoose.models.Conversation || 
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;