import User from '../models/User.js';
import POTW from '../models/POTW.js';
import Submission from '../models/Submission.js';
import RatingHistory from '../models/RatingHistory.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import PasswordResetToken from '../models/PasswordResetToken.js';

// GET /api/admin/dashboard (Admin & Super Admin)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalMembers,
      activePOTW,
      pendingSubmissions,
      ratingStats,
      recentSubmissions,
      recentReviews,
      recentAudits,
    ] = await Promise.all([
      User.countDocuments({ role: 'member', accountStatus: 'active' }),
      POTW.findOne({ status: 'active' }).lean(),
      Submission.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      User.aggregate([
        { $match: { role: 'member', accountStatus: 'active' } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            maxRating: { $max: '$rating' },
            totalPOTWsCompleted: { $sum: '$potwsCompleted' },
          },
        },
      ]),
      Submission.find()
        .populate('userId', 'name dtuEmail rating')
        .populate('potwId', 'weekNumber title')
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
      Submission.find({ status: 'reviewed' })
        .populate('userId', 'name dtuEmail')
        .populate('potwId', 'weekNumber title')
        .populate('reviewedBy', 'name')
        .sort({ reviewedAt: -1 })
        .limit(5)
        .lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    // Rating calculations
    const avgRating = ratingStats.length > 0 ? Math.round(ratingStats[0].avgRating * 10) / 10 : 0;
    const maxRating = ratingStats.length > 0 ? ratingStats[0].maxRating : 0;

    // Participation percentage calculation for active POTW
    let participationRate = 0;
    if (activePOTW && totalMembers > 0) {
      const activePOTWSubmissions = await Submission.countDocuments({ potwId: activePOTW._id });
      participationRate = Math.round((activePOTWSubmissions / totalMembers) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activePOTW,
        pendingSubmissions,
        solutionsToReview: pendingSubmissions,
        avgRating,
        maxRating,
        participationRate,
        recentSubmissions,
        recentReviews,
        recentAudits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/admins (Super Admin only)
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('-password')
      .sort({ role: -1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/admins (Super Admin only)
export const createAdmin = async (req, res, next) => {
  try {
    const { name, dtuEmail, personalEmail, password, branch, batch } = req.body;

    if (!name || !dtuEmail || !personalEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, DTU Email, Personal Email, and Password are required.',
      });
    }

    const cleanDtu = dtuEmail.trim().toLowerCase();
    const cleanPersonal = personalEmail.trim().toLowerCase();

    if (!cleanDtu.endsWith('@dtu.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'DTU Email must end with @dtu.ac.in',
      });
    }

    const existing = await User.findOne({
      $or: [{ dtuEmail: cleanDtu }, { personalEmail: cleanPersonal }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this DTU Email or Personal Email already exists.',
      });
    }

    const admin = await User.create({
      name: name.trim(),
      dtuEmail: cleanDtu,
      personalEmail: cleanPersonal,
      password,
      role: 'admin',
      accountStatus: 'active',
      branch: branch || 'Administration',
      batch: batch || 'DTU',
    });

    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CREATE_ADMIN',
      targetType: 'User',
      targetId: admin._id.toString(),
      details: {
        adminName: admin.name,
        adminEmail: admin.personalEmail,
      },
    });

    res.status(201).json({
      success: true,
      message: `Admin ${admin.name} created successfully.`,
      data: admin.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/admins/:id (Super Admin only)
export const removeAdmin = async (req, res, next) => {
  try {
    const targetAdmin = await User.findById(req.params.id);

    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (targetAdmin._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own administrative account.',
      });
    }

    if (targetAdmin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin accounts cannot be removed directly.',
      });
    }

    // Demote role to regular member instead of dropping all history
    targetAdmin.role = 'member';
    await targetAdmin.save();

    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REMOVE_ADMIN',
      targetType: 'User',
      targetId: targetAdmin._id.toString(),
      details: {
        adminName: targetAdmin.name,
        adminEmail: targetAdmin.personalEmail,
      },
    });

    res.status(200).json({
      success: true,
      message: `Admin ${targetAdmin.name} revoked to regular member successfully.`,
      data: targetAdmin.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/ratings/:id (Super Admin only - Section 57)
export const modifyMemberRating = async (req, res, next) => {
  try {
    const { newRating, reason } = req.body;

    if (newRating === undefined || !reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Both newRating and a specific audit reason are required to modify ratings manually.',
      });
    }

    const numericRating = Number(newRating);
    if (isNaN(numericRating) || numericRating < 0) {
      return res.status(400).json({
        success: false,
        message: 'Rating cannot be negative and must be a valid number.',
      });
    }

    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const previousRating = member.rating;
    const ratingChange = numericRating - previousRating;

    member.rating = numericRating;
    await member.save();

    // Create immutable RatingHistory record (Section 57, 64)
    await RatingHistory.create({
      userId: member._id,
      potwId: null,
      previousRating,
      potwScore: 0,
      penalty: 0,
      ratingChange,
      newRating: numericRating,
      reason: `Super Admin adjustment: ${reason.trim()}`,
      createdBy: req.user.id,
    });

    // In-app notification for member
    await Notification.create({
      userId: member._id,
      type: 'rating',
      title: 'Rating Adjusted by Administration',
      message: `Your rating was updated: ${previousRating} → ${numericRating}. Reason: ${reason.trim()}`,
      link: '/profile',
    });

    // Audit log
    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'MANUAL_RATING_CHANGE',
      targetType: 'User',
      targetId: member._id.toString(),
      reason: reason.trim(),
      details: {
        memberName: member.name,
        previousRating,
        newRating: numericRating,
        ratingChange,
      },
    });

    res.status(200).json({
      success: true,
      message: `Rating for ${member.name} updated from ${previousRating} to ${numericRating}.`,
      data: {
        member: member.toJSON(),
        previousRating,
        newRating,
        ratingChange,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/members/:id (Admin & Super Admin)
export const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    // Safety check 1: Cannot remove your own account
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own account.',
      });
    }

    // Safety check 2: Super Admin cannot be removed through this endpoint
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Super Administrator accounts cannot be removed.',
      });
    }

    // Safety check 3: Admin cannot remove another admin (only super_admin can)
    if (targetUser.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only a Super Administrator can remove administrative accounts.',
      });
    }

    const memberDetails = {
      memberName: targetUser.name,
      dtuEmail: targetUser.dtuEmail,
      personalEmail: targetUser.personalEmail,
      role: targetUser.role,
    };

    // Clean up notifications and reset tokens
    await Notification.deleteMany({ userId: targetUser._id });
    await PasswordResetToken.deleteMany({ userId: targetUser._id });

    // Delete user record from database
    await User.findByIdAndDelete(targetUser._id);

    // Record action in Audit Log
    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REMOVE_MEMBER',
      targetType: 'User',
      targetId: id,
      details: memberDetails,
      reason: reason ? String(reason).trim() : `Removed by ${req.user.name} (${req.user.role})`,
    });

    res.status(200).json({
      success: true,
      message: `Member ${targetUser.name} (${targetUser.dtuEmail}) was removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
