import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  item: Types.ObjectId;
  seller: Types.ObjectId;
  buyer: Types.ObjectId;
  tradedItem?: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  messages: Array<{
    sender: Types.ObjectId;
    message: string;
    timestamp: Date;
  }>;
  meetingDetails?: {
    date: Date;
    location: string;
    notes?: string;
  };
  price?: number;
  isTrade: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tradedItem: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    messages: [{
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    meetingDetails: {
      date: {
        type: Date,
        required: [
          function(this: ITransaction) {
            return this.status === 'accepted';
          },
          'Meeting date is required for accepted transactions',
        ],
      },
      location: {
        type: String,
        required: [
          function(this: ITransaction) {
            return this.status === 'accepted';
          },
          'Meeting location is required for accepted transactions',
        ],
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    price: {
      type: Number,
      min: 0,
      required: [
        function(this: ITransaction) {
          return !this.isTrade;
        },
        'Price is required for non-trade transactions',
      ],
    },
    isTrade: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
TransactionSchema.index({ item: 1, status: 1 });
TransactionSchema.index({ seller: 1, status: 1 });
TransactionSchema.index({ buyer: 1, status: 1 });

// Update item status when transaction is created
TransactionSchema.post('save', async function(doc) {
  const Item = mongoose.model('Item');
  await Item.findByIdAndUpdate(doc.item, { 
    status: doc.status === 'completed' || doc.status === 'cancelled' 
      ? 'available' 
      : doc.status === 'accepted' 
        ? 'pending' 
        : 'available' 
  });

  if (doc.tradedItem) {
    await Item.findByIdAndUpdate(doc.tradedItem, { 
      status: doc.status === 'completed' || doc.status === 'cancelled' 
        ? 'available' 
        : 'pending' 
    });
  }
});

const Transaction: mongoose.Model<ITransaction> = 
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
