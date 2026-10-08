import express from 'express';
import {
  getRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
} from '../controllers/registrationController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// All registration management endpoints require Admin privileges
router.use(authenticateUser, requireAdmin);

router.get('/', getRegistrations);
router.get('/:id', getRegistrationById);
router.patch('/:id/approve', approveRegistration);
router.patch('/:id/reject', rejectRegistration);

export default router;
