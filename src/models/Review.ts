import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  rating: number;
  comment?: string;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  item: Types.ObjectId;
  transaction: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews
ReviewSchema.index(
  { reviewer: 1, transaction: 1 },
  { unique: true }
);

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function(userId: string) {
  const obj = await this.aggregate([
    {
      $match: { reviewee: userId },
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('User').findByIdAndUpdate(userId, {
      rating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function() {
  // @ts-ignore
  await this.constructor.getAverageRating(this.reviewee);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', async function() {
  // @ts-ignore
  await this.constructor.getAverageRating(this.reviewee);
});

const Review: mongoose.Model<IReview> = 
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
