import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getMemberProfile,
  getMembers,
  completeTour,
  resetTour,
  uploadProfilePhoto,
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticateUser, getMyProfile);
router.patch('/me', authenticateUser, updateMyProfile);
router.post('/me/profile-photo', authenticateUser, uploadProfilePhoto);
router.patch('/complete-tour', authenticateUser, completeTour);
router.patch('/reset-tour', authenticateUser, resetTour);
router.get('/', getMembers);
router.get('/:id', getMemberProfile);

export default router;
