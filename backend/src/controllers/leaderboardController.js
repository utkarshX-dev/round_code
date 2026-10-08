import User from '../models/User.js';
import Submission from '../models/Submission.js';
import POTW from '../models/POTW.js';

// GET /api/leaderboard/all-time
export const getAllTimeLeaderboard = async (req, res, next) => {
  try {
    const members = await User.find({
      role: 'member',
      accountStatus: 'active',
    })
      .select('name dtuEmail branch batch profilePhoto rating potwsCompleted skills createdAt')
      .sort({ rating: -1, potwsCompleted: -1, createdAt: 1 })
      .lean();

    const leaderboard = members.map((member, index) => ({
      rank: index + 1,
      ...member,
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leaderboard/weekly (Based on current active or latest reviewed POTW)
export const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    // Find active POTW, or latest closed POTW if none active
    let potw = await POTW.findOne({ status: 'active' });
    if (!potw) {
      potw = await POTW.findOne({ status: 'closed' }).sort({ weekNumber: -1 });
    }

    if (!potw) {
      return res.status(200).json({
        success: true,
        message: 'No weekly POTW data available yet.',
        data: [],
        potw: null,
      });
    }

    const submissions = await Submission.find({ potwId: potw._id, status: 'reviewed' })
      .populate('userId', 'name dtuEmail branch batch profilePhoto rating potwsCompleted createdAt')
      .sort({ totalScore: -1, submittedAt: 1 })
      .lean();

    const leaderboard = submissions.map((sub, index) => ({
      rank: index + 1,
      score: sub.totalScore,
      submittedAt: sub.submittedAt,
      problems: sub.problems.map((p) => ({
        difficulty: p.maxScore === 1 ? 'Easy' : p.maxScore === 2 ? 'Medium' : 'Hard',
        score: p.score,
        status: p.status,
      })),
      user: sub.userId,
    }));

    res.status(200).json({
      success: true,
      potw: {
        id: potw._id,
        weekNumber: potw.weekNumber,
        title: potw.title,
        deadline: potw.deadline,
      },
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leaderboard/monthly (Total POTW points earned during the current month)
export const getMonthlyLeaderboard = async (req, res, next) => {
  try {
    const now = new Date();
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

    const leaderboard = monthlyAggregation
      .map((item, index) => {
        const user = userMap.get(item._id.toString());
        if (!user) return null;
        return {
          rank: index + 1,
          monthlyScore: item.monthlyScore,
          potwsSolvedInMonth: item.potwsSolvedInMonth,
          user,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
