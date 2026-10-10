import Post from '../models/Post.js';
import { notifyActiveMembers } from '../utils/engagement.js';

const isAdmin = (user) => ['admin', 'super_admin'].includes(user.role);

export const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 25);
    const [posts, count] = await Promise.all([
      Post.find()
        .populate('authorId', 'name profilePhoto role')
        .populate('comments.userId', 'name profilePhoto role')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);
    res.json({ success: true, count, page, limit, data: posts });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    const body = req.body.body?.trim();
    if (!title || !body) return res.status(400).json({ success: false, message: 'Title and body are required.' });
    const post = await Post.create({ title, body, authorId: req.user.id, isPinned: Boolean(req.body.isPinned) });
    await post.populate('authorId', 'name profilePhoto role');
    await notifyActiveMembers({
      type: 'post',
      title: `New community post: ${title}`,
      message: body.length > 180 ? `${body.slice(0, 177)}...` : body,
      link: '/posts',
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const body = req.body.body?.trim();
    if (!body) return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    post.comments.push({ userId: req.user.id, body });
    await post.save();
    await post.populate('comments.userId', 'name profilePhoto role');
    res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: 'Administrator privileges required.' });
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    next(error);
  }
};
