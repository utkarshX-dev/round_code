import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 10000 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: { type: [commentSchema], default: [] },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ isPinned: -1, createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
