import mongoose from 'mongoose';

const ratingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    potwId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'POTW',
      default: null,
    },
    previousRating: {
      type: Number,
      required: true,
      min: 0,
    },
    potwScore: {
      type: Number,
      default: 0,
    },
    penalty: {
      type: Number,
      default: 0,
    },
    ratingChange: {
      type: Number,
      required: true,
    },
    newRating: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ratingHistorySchema.index({ userId: 1, createdAt: -1 });

const RatingHistory = mongoose.model('RatingHistory', ratingHistorySchema);
export default RatingHistory;
