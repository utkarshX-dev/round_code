import express from 'express';
import {
  getCurrentPOTW,
  getAllPOTWs,
  getPOTWById,
  createPOTW,
  updatePOTW,
  deletePOTW,
} from '../controllers/potwController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Public / Semi-public routes (or authenticated members)
router.get('/current', getCurrentPOTW);
router.get('/', getAllPOTWs);
router.get('/:id', getPOTWById);

// Admin-only management routes
router.post('/', authenticateUser, requireAdmin, createPOTW);
router.patch('/:id', authenticateUser, requireAdmin, updatePOTW);
router.delete('/:id', authenticateUser, requireAdmin, deletePOTW);

export default router;
