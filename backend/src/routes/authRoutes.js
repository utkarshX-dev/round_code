import express from 'express';
import { adminLogin, firebaseLogin, getMe, logout } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/firebase', firebaseLogin);
router.post('/admin-login', adminLogin);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

export default router;
