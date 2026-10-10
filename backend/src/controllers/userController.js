import User from '../models/User.js';
import RatingHistory from '../models/RatingHistory.js';
import Submission from '../models/Submission.js';
import { getCloudinary } from '../config/cloudinary.js';

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

// POST /api/users/me/profile-photo
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'A valid image file is required.',
      });
    }

    const imageMatch = image.match(/^data:image\/(jpeg|jpg|png|webp);base64,/i);
    if (!imageMatch) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG, PNG, and WebP images are supported.',
      });
    }

    const base64Payload = image.slice(image.indexOf(',') + 1);
    const estimatedBytes = Math.ceil((base64Payload.length * 3) / 4);
    if (estimatedBytes > 5 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'Profile photos must be 5MB or smaller.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cloudinary = getCloudinary();
    const uploaded = await cloudinary.uploader.upload(image, {
      folder: 'roundcode/profile-photos',
      public_id: `user-${user._id}`,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    user.profilePhoto = uploaded.secure_url;
    user.profilePhotoPublicId = uploaded.public_id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully.',
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
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 24, 1), 100);

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

    const [members, total] = await Promise.all([
      User.find(query)
      .select('-password -personalEmail') // Hide sensitive private info
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: total,
      page,
      limit,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};
