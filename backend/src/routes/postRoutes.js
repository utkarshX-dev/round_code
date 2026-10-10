import express from 'express';
import { addComment, createPost, deletePost, getPosts } from '../controllers/postController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();
router.use(authenticateUser);
router.get('/', getPosts);
router.post('/', requireAdmin, createPost);
router.post('/:id/comments', addComment);
router.delete('/:id', requireAdmin, deletePost);
export default router;
