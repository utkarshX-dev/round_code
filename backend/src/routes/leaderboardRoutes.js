import express from 'express';
import {
  getAllTimeLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
} from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/all-time', getAllTimeLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/monthly', getMonthlyLeaderboard);

export default router;
