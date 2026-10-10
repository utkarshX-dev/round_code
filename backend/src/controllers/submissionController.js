import validator from 'validator';
import Submission from '../models/Submission.js';
import POTW from '../models/POTW.js';
import RatingHistory from '../models/RatingHistory.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { awardBadges, notifyUser } from '../utils/engagement.js';

// Helper to validate URLs
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return validator.isURL(url.trim(), { require_protocol: true });
};

// POST /api/submissions (Member submits all 3 problems)
export const submitPOTW = async (req, res, next) => {
  try {
    const { potwId, problems } = req.body;
    const userId = req.user.id;

    if (!potwId || !problems || !Array.isArray(problems)) {
      return res.status(400).json({
        success: false,
        message: 'POTW ID and problems array are required.',
      });
    }

    const potw = await POTW.findById(potwId);
    if (!potw) {
      return res.status(404).json({ success: false, message: 'POTW not found' });
    }

    if (potw.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Submissions are only allowed for active POTWs.',
      });
    }

    // Section 25: Strict Deadline enforcement on backend
    const now = new Date();
    if (now >= new Date(potw.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline has passed. Submissions are closed.',
      });
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({ userId, potwId });
    if (existingSubmission && existingSubmission.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this POTW. Submissions are locked and cannot be edited.',
      });
    }

    if (existingSubmission && existingSubmission.status === 'reviewed') {
      return res.status(400).json({
        success: false,
        message: 'This submission has already been reviewed and finalized.',
      });
    }

    // Section 30: Exactly all 3 questions required
    if (problems.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'You must submit solutions for all 3 questions together.',
      });
    }

    // Match problem submissions to POTW questions
    const formattedProblems = [];
    for (const q of potw.problems) {
      const submitted = problems.find((p) => p.problemId?.toString() === q._id.toString());
      if (!submitted) {
        return res.status(400).json({
          success: false,
          message: `Missing submission for problem "${q.title}" (${q.difficulty}).`,
        });
      }

      if (!submitted.code || !submitted.code.trim()) {
        return res.status(400).json({
          success: false,
          message: `Source code is required for "${q.title}".`,
        });
      }

      if (!submitted.timeComplexity?.trim() || !submitted.spaceComplexity?.trim()) {
        return res.status(400).json({
          success: false,
          message: `Both Time and Space complexity are required for "${q.title}".`,
        });
      }

      if (submitted.submissionLink?.trim() && !isValidUrl(submitted.submissionLink)) {
        return res.status(400).json({
          success: false,
          message: `External submission link for "${q.title}" must be a valid http:// or https:// URL.`,
        });
      }

      if (submitted.driveLink?.trim() && !isValidUrl(submitted.driveLink)) {
        return res.status(400).json({
          success: false,
          message: `Google Drive / Proof link for "${q.title}" must be a valid http:// or https:// URL.`,
        });
      }

      formattedProblems.push({
        problemId: q._id,
        language: submitted.language || 'C++',
        code: submitted.code,
        timeComplexity: submitted.timeComplexity.trim(),
        spaceComplexity: submitted.spaceComplexity.trim(),
        platform: submitted.platform || 'LeetCode',
        submissionLink: submitted.submissionLink?.trim() || '',
        driveLink: submitted.driveLink?.trim() || '',
        score: 0,
        maxScore: q.maxScore,
        status: 'pending',
        feedback: '',
      });
    }

    let submission;
    if (existingSubmission) {
      // If was previously reopened
      existingSubmission.problems = formattedProblems;
      existingSubmission.status = 'submitted';
      existingSubmission.submittedAt = now;
      submission = await existingSubmission.save();
    } else {
      submission = await Submission.create({
        userId,
        potwId,
        problems: formattedProblems,
        status: 'submitted',
        submittedAt: now,
      });
    }

    // In-app confirmation notification
    await Notification.create({
      userId,
      type: 'potw',
      title: `POTW #${potw.weekNumber} Submitted!`,
      message: 'Your solutions for all 3 questions were submitted and locked for admin review.',
      link: `/potw/${potw._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'POTW submitted successfully! Your submission is now locked for evaluation.',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/submissions/my
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('potwId', 'weekNumber title publishAt deadline status')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/submissions/pending (Admin only)
export const getPendingSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ status: { $in: ['submitted', 'under_review'] } })
      .populate('userId', 'name dtuEmail personalEmail branch batch rating')
      .populate('potwId', 'weekNumber title deadline status problems')
      .sort({ submittedAt: 1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/submissions/:id
export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('userId', 'name dtuEmail personalEmail branch batch rating profilePhoto')
      .populate('potwId')
      .populate('reviewedBy', 'name');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isAdmin && submission.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/submissions/:id/review (Admin only)
export const reviewSubmission = async (req, res, next) => {
  try {
    const { problemReviews } = req.body;

    if (!Array.isArray(problemReviews) || problemReviews.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Reviews for all 3 questions must be provided.',
      });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('userId')
      .populate('potwId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    let calculatedTotalScore = 0;

    for (const rev of problemReviews) {
      const targetProb = submission.problems.find(
        (p) => p.problemId.toString() === rev.problemId?.toString()
      );

      if (!targetProb) {
        return res.status(400).json({
          success: false,
          message: `Problem ID ${rev.problemId} does not match any problem in this submission.`,
        });
      }

      const score = Number(rev.score);
      const status = rev.status || (score > 0 ? 'approved' : 'rejected');

      // Section 21: Validate 0 <= score <= maxScore, with increments of 0.5
      if (isNaN(score) || score < 0 || score > targetProb.maxScore) {
        return res.status(400).json({
          success: false,
          message: `Score for problem must be between 0 and ${targetProb.maxScore}. Received: ${score}`,
        });
      }

      // Check 0.5 increments
      if ((score * 2) % 1 !== 0) {
        return res.status(400).json({
          success: false,
          message: 'Scores must be awarded in increments of 0.5 (e.g. 0, 0.5, 1, 1.5, etc.)',
        });
      }

      const awardedScore = status === 'rejected' ? 0 : score;
      targetProb.score = awardedScore;
      targetProb.status = status;
      targetProb.feedback = rev.feedback?.trim() || '';

      calculatedTotalScore += awardedScore;
    }

    submission.totalScore = calculatedTotalScore;
    submission.status = 'reviewed';
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.user.id;
    await submission.save();

    // Update user rating and completed count
    const member = submission.userId;
    const previousRating = member.rating;
    const newRating = Math.max(0, previousRating + calculatedTotalScore);
    const ratingChange = newRating - previousRating;

    member.rating = newRating;
    member.potwsCompleted = (member.potwsCompleted || 0) + 1;
    await member.save();

    // Create immutable RatingHistory record (Section 39)
    await RatingHistory.create({
      userId: member._id,
      potwId: submission.potwId._id,
      previousRating,
      potwScore: calculatedTotalScore,
      penalty: 0,
      ratingChange,
      newRating,
      reason: `Evaluation for POTW #${submission.potwId.weekNumber}`,
      createdBy: req.user.id,
    });

    // In-app notification as per Section 40
    const lastReviewed = await Submission.findOne({
      userId: member._id,
      status: 'reviewed',
      _id: { $ne: submission._id },
      reviewedAt: { $lt: submission.reviewedAt },
    }).sort({ reviewedAt: -1 }).select('reviewedAt');
    const withinWeeklyWindow = lastReviewed
      && submission.reviewedAt.getTime() - new Date(lastReviewed.reviewedAt).getTime() <= 14 * 24 * 60 * 60 * 1000;
    member.currentStreak = withinWeeklyWindow ? (member.currentStreak || 0) + 1 : 1;
    member.longestStreak = Math.max(member.longestStreak || 0, member.currentStreak);
    await member.save();
    await notifyUser({
      user: member,
      type: 'review',
      title: `POTW #${submission.potwId.weekNumber} Reviewed`,
      message: `You earned ${calculatedTotalScore}/6 points this week. Your rating changed from ${previousRating} → ${newRating}. Current streak: ${member.currentStreak} week${member.currentStreak === 1 ? '' : 's'}.`,
      link: `/potw/${submission.potwId._id}`,
    });
    await awardBadges(member, { perfectScore: calculatedTotalScore === 6 });

    // Log admin audit action
    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REVIEW_SUBMISSION',
      targetType: 'Submission',
      targetId: submission._id.toString(),
      details: {
        userId: member._id,
        potwWeekNumber: submission.potwId.weekNumber,
        score: calculatedTotalScore,
        previousRating,
        newRating,
      },
    });

    res.status(200).json({
      success: true,
      message: `Submission reviewed successfully. Total score: ${calculatedTotalScore}/6.`,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/submissions/:id/reopen (Admin only)
export const reopenSubmission = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const submission = await Submission.findById(req.params.id)
      .populate('userId')
      .populate('potwId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const reopenReason = reason?.trim() || 'Admin requested corrections on submitted code or links.';

    // Check if POTW deadline has passed
    const now = new Date();
    if (now >= new Date(submission.potwId.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reopen submission: POTW deadline has already passed.',
      });
    }

    submission.status = 'under_review';
    submission.reopenHistory.push({
      reopenedAt: now,
      reopenedBy: req.user.id,
      reason: reopenReason,
    });
    await submission.save();

    await notifyUser({
      user: submission.userId,
      type: 'potw',
      title: `Submission Reopened: POTW #${submission.potwId.weekNumber}`,
      message: `An admin has reopened your submission for modifications. Reason: ${reopenReason}`,
      link: `/potw/${submission.potwId._id}`,
    });

    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REOPEN_SUBMISSION',
      targetType: 'Submission',
      targetId: submission._id.toString(),
      reason: reopenReason,
      details: {
        userId: submission.userId._id,
        potwId: submission.potwId._id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Submission has been reopened for the member to adjust their solution.',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};
