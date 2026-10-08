import express from 'express';
import {
  submitPOTW,
  getMySubmissions,
  getPendingSubmissions,
  getSubmissionById,
  reviewSubmission,
  reopenSubmission,
} from '../controllers/submissionController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Member submissions
router.post('/', authenticateUser, submitPOTW);
router.get('/my', authenticateUser, getMySubmissions);

// Admin review endpoints
router.get('/pending', authenticateUser, requireAdmin, getPendingSubmissions);
router.patch('/:id/review', authenticateUser, requireAdmin, reviewSubmission);
router.patch('/:id/reopen', authenticateUser, requireAdmin, reopenSubmission);

// Submission details (User own, or Admin all)
router.get('/:id', authenticateUser, getSubmissionById);

export default router;
