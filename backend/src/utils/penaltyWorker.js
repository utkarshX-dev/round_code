import POTW from '../models/POTW.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import RatingHistory from '../models/RatingHistory.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

export const processPOTWPenalties = async (potwId) => {
  try {
    const potw = await POTW.findById(potwId);
    if (!potw || potw.penaltyProcessed) {
      return { processed: 0 };
    }

    // Only apply penalties to active members who existed before the deadline
    const members = await User.find({
      role: 'member',
      accountStatus: 'active',
      createdAt: { $lte: potw.deadline },
    });

    let penalizedCount = 0;

    for (const member of members) {
      // Check if member submitted this POTW
      const submission = await Submission.findOne({
        userId: member._id,
        potwId: potw._id,
      });

      if (!submission) {
        const previousRating = member.rating;
        const penalty = 2;
        const newRating = Math.max(0, previousRating - penalty);
        const ratingChange = newRating - previousRating;

        member.rating = newRating;
        await member.save();

        await RatingHistory.create({
          userId: member._id,
          potwId: potw._id,
          previousRating,
          potwScore: 0,
          penalty,
          ratingChange,
          newRating,
          reason: `No submission penalty for POTW #${potw.weekNumber}`,
        });

        await Notification.create({
          userId: member._id,
          type: 'rating',
          title: `POTW #${potw.weekNumber} Missed Penalty`,
          message: `You received a -2 rating penalty for missing POTW #${potw.weekNumber}. Rating: ${previousRating} → ${newRating}.`,
          link: '/profile',
        });

        penalizedCount++;
      }
    }

    potw.penaltyProcessed = true;
    await potw.save();

    await AuditLog.create({
      actorId: potw.createdBy,
      actorName: 'System Worker',
      actorRole: 'system',
      action: 'APPLY_PENALTIES',
      targetType: 'POTW',
      targetId: potw._id.toString(),
      details: {
        weekNumber: potw.weekNumber,
        penalizedCount,
      },
    });

    return { processed: penalizedCount };
  } catch (error) {
    console.error('Error processing POTW penalties:', error);
    return { error: error.message };
  }
};
