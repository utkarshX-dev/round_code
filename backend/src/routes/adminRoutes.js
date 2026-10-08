import express from 'express';
import {
  getAdminDashboardStats,
  getAdmins,
  createAdmin,
  removeAdmin,
  modifyMemberRating,
  removeMember,
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticateUser);

// Admin & Super Admin routes
router.get('/dashboard', requireAdmin, getAdminDashboardStats);
router.delete('/members/:id', requireAdmin, removeMember);

// Super Admin only routes
router.get('/admins', requireSuperAdmin, getAdmins);
router.post('/admins', requireSuperAdmin, createAdmin);
router.delete('/admins/:id', requireSuperAdmin, removeAdmin);
router.patch('/ratings/:id', requireSuperAdmin, modifyMemberRating);

export default router;
