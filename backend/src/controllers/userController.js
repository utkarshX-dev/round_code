import User from '../models/User.js';
import RatingHistory from '../models/RatingHistory.js';
import Submission from '../models/Submission.js';

// GET /api/users/me
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me
export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      bio,
      profilePhoto,
      branch,
      batch,
      skills,
      codingProfiles,
      projects,
    } = req.body;

    // Allowed updates (Explicitly ignore rating, role, accountStatus, potwsCompleted)
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto.trim();
    if (branch) user.branch = branch.trim();
    if (batch) user.batch = batch.trim();

    if (Array.isArray(skills)) {
      user.skills = skills.map((s) => s.trim()).filter(Boolean);
    }

    if (codingProfiles && typeof codingProfiles === 'object') {
      user.codingProfiles = {
        leetcode: codingProfiles.leetcode?.trim() || user.codingProfiles.leetcode || '',
        codeforces: codingProfiles.codeforces?.trim() || user.codingProfiles.codeforces || '',
        codechef: codingProfiles.codechef?.trim() || user.codingProfiles.codechef || '',
        geeksforgeeks: codingProfiles.geeksforgeeks?.trim() || user.codingProfiles.geeksforgeeks || '',
        hackerrank: codingProfiles.hackerrank?.trim() || user.codingProfiles.hackerrank || '',
        github: codingProfiles.github?.trim() || user.codingProfiles.github || '',
        linkedin: codingProfiles.linkedin?.trim() || user.codingProfiles.linkedin || '',
        portfolio: codingProfiles.portfolio?.trim() || user.codingProfiles.portfolio || '',
        custom: Array.isArray(codingProfiles.custom) ? codingProfiles.custom : user.codingProfiles.custom || [],
      };
    }

    if (typeof req.body.hasSeenTour === 'boolean') {
      user.hasSeenTour = req.body.hasSeenTour;
    }

    if (Array.isArray(projects)) {
      user.projects = projects;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/complete-tour (Mark onboarding / platform review as completed)
export const completeTour = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.hasSeenTour = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Platform review completed successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/reset-tour (Allow replaying platform review on demand)
export const resetTour = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.hasSeenTour = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Platform review reset successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id (Public member profile)
export const getMemberProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -personalEmail'); // Privacy: personal email is strictly hidden

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Calculate member's all-time rank
    const higherRatingCount = await User.countDocuments({
      role: 'member',
      accountStatus: 'active',
      $or: [
        { rating: { $gt: user.rating } },
        { rating: user.rating, potwsCompleted: { $gt: user.potwsCompleted } },
        { rating: user.rating, potwsCompleted: user.potwsCompleted, createdAt: { $lt: user.createdAt } },
      ],
    });
    const rank = higherRatingCount + 1;

    // Fetch rating history for rating chart
    const ratingHistory = await RatingHistory.find({ userId: user._id })
      .populate('potwId', 'weekNumber title')
      .sort({ createdAt: 1 });

    // Fetch submitted POTWs
    const submissions = await Submission.find({ userId: user._id })
      .populate('potwId', 'weekNumber title deadline status')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        rank,
        ratingHistory,
        submissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users (Member directory)
export const getMembers = async (req, res, next) => {
  try {
    const { search, branch, batch, sort = 'rating' } = req.query;

    const query = {
      role: 'member',
      accountStatus: 'active',
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (branch) {
      query.branch = branch;
    }

    if (batch) {
      query.batch = batch;
    }

    let sortOption = { rating: -1, potwsCompleted: -1, createdAt: 1 };
    if (sort === 'potwsCompleted') {
      sortOption = { potwsCompleted: -1, rating: -1, createdAt: 1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    const members = await User.find(query)
      .select('-password -personalEmail') // Hide sensitive private info
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};
