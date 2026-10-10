import User from '../models/User.js';
import Submission from '../models/Submission.js';
import POTW from '../models/POTW.js';
import { getOrSetCache } from '../utils/cache.js';

const addDenseRanks = (entries, getScore) => {
  let previousScore;
  let rank = 0;

  return entries.map((entry, index) => {
    const score = getScore(entry);
    if (index === 0 || score !== previousScore) {
      rank += 1;
      previousScore = score;
    }

    return { ...entry, rank };
  });
};

// GET /api/leaderboard/all-time
export const getAllTimeLeaderboard = async (req, res, next) => {
  try {
    const response = await getOrSetCache('leaderboard:all-time', async () => {
      const members = await User.find({
        role: 'member',
        accountStatus: 'active',
      })
        .select('name dtuEmail branch batch profilePhoto rating potwsCompleted currentStreak longestStreak skills createdAt')
        .sort({ rating: -1, potwsCompleted: -1, createdAt: 1 })
        .lean();

      const leaderboard = addDenseRanks(
        members.map((member) => ({ ...member })),
        (member) => member.rating
      );

      return {
        success: true,
        count: leaderboard.length,
        data: leaderboard,
      };
    }, 30);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/leaderboard/weekly (Based on current active or latest reviewed POTW)
export const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    const response = await getOrSetCache('leaderboard:weekly', async () => {
      // Find active POTW, or latest closed POTW if none active
      let potw = await POTW.findOne({ status: 'active' });
      if (!potw) {
        potw = await POTW.findOne({ status: 'closed' }).sort({ weekNumber: -1 });
      }

      if (!potw) {
        return {
          success: true,
          message: 'No weekly POTW data available yet.',
          data: [],
          potw: null,
        };
      }

      const submissions = await Submission.find({ potwId: potw._id, status: 'reviewed' })
        .populate('userId', 'name dtuEmail branch batch profilePhoto rating potwsCompleted createdAt')
        .sort({ totalScore: -1, submittedAt: 1 })
        .lean();

      const leaderboard = addDenseRanks(
        submissions.map((sub) => ({
        score: sub.totalScore,
        submittedAt: sub.submittedAt,
        problems: sub.problems.map((p) => ({
          difficulty: p.maxScore === 1 ? 'Easy' : p.maxScore === 2 ? 'Medium' : 'Hard',
          score: p.score,
          status: p.status,
        })),
        user: sub.userId,
        })),
        (entry) => entry.score
      );

      return {
        success: true,
        potw: {
          id: potw._id,
          weekNumber: potw.weekNumber,
          title: potw.title,
          deadline: potw.deadline,
        },
        count: leaderboard.length,
        data: leaderboard,
      };
    }, 30);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/leaderboard/monthly (Total POTW points earned during the current month)
export const getMonthlyLeaderboard = async (req, res, next) => {
  try {
    const now = new Date();
    const cacheKey = `leaderboard:monthly:${now.getFullYear()}-${now.getMonth() + 1}`;

    const response = await getOrSetCache(cacheKey, async () => {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthlyAggregation = await Submission.aggregate([
      {
        $match: {
          status: 'reviewed',
          reviewedAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$userId',
          monthlyScore: { $sum: '$totalScore' },
          potwsSolvedInMonth: { $sum: 1 },
          lastReviewedAt: { $max: '$reviewedAt' },
        },
      },
      {
        $sort: { monthlyScore: -1, potwsSolvedInMonth: -1, lastReviewedAt: 1 },
      },
      ]);

      // Populate user info
      const userIds = monthlyAggregation.map((item) => item._id);
      const users = await User.find({ _id: { $in: userIds } })
        .select('name dtuEmail branch batch profilePhoto rating potwsCompleted')
        .lean();

      const userMap = new Map();
      users.forEach((u) => userMap.set(u._id.toString(), u));

      const leaderboard = addDenseRanks(
        monthlyAggregation
        .map((item) => {
          const user = userMap.get(item._id.toString());
          if (!user) return null;
          return {
            monthlyScore: item.monthlyScore,
            potwsSolvedInMonth: item.potwsSolvedInMonth,
            user,
          };
        })
        .filter(Boolean),
        (entry) => entry.monthlyScore
      );

      return {
        success: true,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        count: leaderboard.length,
        data: leaderboard,
      };
    }, 30);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
