import POTW from '../models/POTW.js';
import AuditLog from '../models/AuditLog.js';
import Submission from '../models/Submission.js';
import { processPOTWPenalties } from '../utils/penaltyWorker.js';
import { notifyActiveMembers } from '../utils/engagement.js';

// Helper to validate exactly 3 problems with proper difficulties and max scores
const validateProblemsStructure = (problems) => {
  if (!Array.isArray(problems) || problems.length !== 3) {
    return 'A POTW must contain exactly 3 problems: one Easy, one Medium, and one Hard.';
  }

  const difficulties = problems.map((p) => p.difficulty?.toLowerCase());
  if (!difficulties.includes('easy') || !difficulties.includes('medium') || !difficulties.includes('hard')) {
    return 'Problems must contain exactly one Easy, one Medium, and one Hard question.';
  }

  for (const prob of problems) {
    if (!prob.title || !prob.statement) {
      return 'Every problem must have a title and statement.';
    }
    if (prob.difficulty === 'easy' && prob.maxScore !== 1) {
      return 'Easy problem must have a maxScore of 1 point.';
    }
    if (prob.difficulty === 'medium' && prob.maxScore !== 2) {
      return 'Medium problem must have a maxScore of 2 points.';
    }
    if (prob.difficulty === 'hard' && prob.maxScore !== 3) {
      return 'Hard problem must have a maxScore of 3 points.';
    }
  }

  return null;
};

const getWeekSequenceError = async (weekNumber) => {
  if (weekNumber <= 1) return null;

  const previousWeek = await POTW.findOne({ weekNumber: weekNumber - 1 });
  if (!previousWeek || !['active', 'closed'].includes(previousWeek.status)) {
    return `Publish POTW week #${weekNumber - 1} before creating week #${weekNumber}.`;
  }

  return null;
};

// GET /api/potws/current
export const getCurrentPOTW = async (req, res, next) => {
  try {
    const now = new Date();

    // Check if an active POTW exists
    let potw = await POTW.findOne({ status: 'active' }).populate('createdBy', 'name');

    // If active POTW has passed its deadline, we can trigger penalty processing & mark closed
    if (potw && now >= new Date(potw.deadline)) {
      if (!potw.penaltyProcessed) {
        await processPOTWPenalties(potw._id);
        potw.status = 'closed';
        await potw.save();
      }
    }

    // Check if any scheduled POTW should be made active now (if no active POTW)
    if (!potw || potw.status === 'closed') {
      const scheduledPOTW = await POTW.findOne({
        status: 'scheduled',
        publishAt: { $lte: now },
        deadline: { $gt: now },
      }).sort({ publishAt: 1 });

      if (scheduledPOTW) {
        scheduledPOTW.status = 'active';
        await scheduledPOTW.save();
        potw = scheduledPOTW;

        if (!potw.publishNotificationSent) {
          await notifyActiveMembers({
            type: 'potw',
            title: `POTW #${potw.weekNumber} is Now Live!`,
            message: `${potw.title} is now available. Solve all 3 problems before ${new Date(potw.deadline).toLocaleDateString()}.`,
            link: `/potw/${potw._id}`,
          });
          potw.publishNotificationSent = true;
          await potw.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: potw || null,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/potws
export const getAllPOTWs = async (req, res, next) => {
  try {
    const query = {};
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isAdmin) {
      // Non-admins only see active and closed POTWs
      query.status = { $in: ['active', 'closed'] };
    }

    const potws = await POTW.find(query)
      .populate('createdBy', 'name')
      .sort({ weekNumber: -1 });

    res.status(200).json({
      success: true,
      count: potws.length,
      data: potws,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/potws/:id
export const getPOTWById = async (req, res, next) => {
  try {
    const potw = await POTW.findById(req.params.id).populate('createdBy', 'name');

    if (!potw) {
      return res.status(404).json({ success: false, message: 'POTW not found' });
    }

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
    if (!isAdmin && ['draft', 'scheduled'].includes(potw.status)) {
      return res.status(403).json({ success: false, message: 'This POTW is not yet published' });
    }

    res.status(200).json({
      success: true,
      data: potw,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/potws (Admin only)
export const createPOTW = async (req, res, next) => {
  try {
    const { weekNumber, title, description, problems, publishAt, status = 'draft' } = req.body;

    if (!weekNumber || !title) {
      return res.status(400).json({
        success: false,
        message:
          'Week Number and Title are required.',
      });
    }

    const sequenceError = await getWeekSequenceError(weekNumber);
    if (sequenceError) {
      return res.status(400).json({ success: false, message: sequenceError });
    }

    const existingWeek = await POTW.findOne({ weekNumber });
    if (existingWeek) {
      const state = existingWeek.status === 'draft' ? 'drafted' : 'published';
      return res.status(400).json({
        success: false,
        message: `POTW for week #${weekNumber} is already ${state}.`,
      });
    }

    const effectivePublishAt = status === 'active'
      ? (publishAt ? new Date(publishAt) : new Date())
      : null;
    if (effectivePublishAt && Number.isNaN(effectivePublishAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Publish date is invalid.',
      });
    }
    const effectiveDeadline = effectivePublishAt
      ? new Date(effectivePublishAt)
      : null;
    if (effectiveDeadline) {
      effectiveDeadline.setDate(effectiveDeadline.getDate() + 7);
    }

    // Strict validation: exactly 3 problems (Easy: 1, Medium: 2, Hard: 3)
    const validationErr = validateProblemsStructure(problems);
    if (validationErr) {
      return res.status(400).json({ success: false, message: validationErr });
    }

    // Check conflict: Only ONE active POTW allowed at any time
    if (status === 'active') {
      const activePOTW = await POTW.findOne({ status: 'active' });
      if (activePOTW) {
        return res.status(400).json({
          success: false,
          message: `Cannot activate: POTW #${activePOTW.weekNumber} ("${activePOTW.title}") is currently active. Please close it first.`,
        });
      }
    }

    const newPOTW = await POTW.create({
      weekNumber,
      title: title.trim(),
      description: description?.trim() || '',
      problems,
      publishAt: effectivePublishAt,
      deadline: effectiveDeadline,
      status,
      createdBy: req.user.id,
    });

    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CREATE_POTW',
      targetType: 'POTW',
      targetId: newPOTW._id.toString(),
      details: {
        weekNumber,
        title,
        status,
      },
    });

    // Notify members if published directly as active
    if (status === 'active') {
      await notifyActiveMembers({
        type: 'potw',
        title: `New POTW Live: #${newPOTW.weekNumber} ${newPOTW.title}`,
        message: `A new weekly problem set is live! Deadline: ${new Date(newPOTW.deadline).toLocaleDateString()}`,
        link: `/potw/${newPOTW._id}`,
      });
      newPOTW.publishNotificationSent = true;
      await newPOTW.save();
    }

    res.status(201).json({
      success: true,
      message: 'POTW created successfully',
      data: newPOTW,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/potws/:id (Admin only)
export const updatePOTW = async (req, res, next) => {
  try {
    const potw = await POTW.findById(req.params.id);

    if (!potw) {
      return res.status(404).json({ success: false, message: 'POTW not found' });
    }

    const { weekNumber, title, description, problems, publishAt, status } = req.body;

    // If changing to active, ensure no other active POTW exists
    if (status === 'active' && potw.status !== 'active') {
      const activePOTW = await POTW.findOne({ status: 'active', _id: { $ne: potw._id } });
      if (activePOTW) {
        return res.status(400).json({
          success: false,
          message: `Cannot activate: POTW #${activePOTW.weekNumber} is already active.`,
        });
      }

    }

    if (weekNumber !== undefined && weekNumber !== potw.weekNumber) {
      const sequenceError = await getWeekSequenceError(weekNumber);
      if (sequenceError) {
        return res.status(400).json({ success: false, message: sequenceError });
      }

      const existingWeek = await POTW.findOne({ weekNumber, _id: { $ne: potw._id } });
      if (existingWeek) {
        const state = existingWeek.status === 'draft' ? 'drafted' : 'published';
        return res.status(400).json({
          success: false,
          message: `POTW for week #${weekNumber} is already ${state}.`,
        });
      }
    }

    // If problems are modified, re-validate structure
    if (problems) {
      const validationErr = validateProblemsStructure(problems);
      if (validationErr) {
        return res.status(400).json({ success: false, message: validationErr });
      }
      potw.problems = problems;
    }

    if (weekNumber !== undefined) potw.weekNumber = weekNumber;
    if (title) potw.title = title.trim();
    if (description !== undefined) potw.description = description.trim();
    if (status === 'active' && potw.status !== 'active') {
      potw.publishAt = new Date();
      potw.deadline = new Date(potw.publishAt);
      potw.deadline.setDate(potw.deadline.getDate() + 7);
    } else if (status === 'draft') {
      potw.publishAt = null;
      potw.deadline = null;
    } else if (publishAt) {
      potw.publishAt = new Date(publishAt);
    }
    if (status) potw.status = status;

    if (potw.deadline && potw.publishAt && potw.deadline <= potw.publishAt) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be later than publish date.',
      });
    }

    await potw.save();

    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'UPDATE_POTW',
      targetType: 'POTW',
      targetId: potw._id.toString(),
      details: {
        weekNumber: potw.weekNumber,
        title: potw.title,
        status: potw.status,
      },
    });

    res.status(200).json({
      success: true,
      message: 'POTW updated successfully',
      data: potw,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/potws/:id (Admin only)
export const deletePOTW = async (req, res, next) => {
  try {
    const potw = await POTW.findById(req.params.id);
    if (!potw) {
      return res.status(404).json({ success: false, message: 'POTW not found' });
    }

    // Check if submissions exist
    const subCount = await Submission.countDocuments({ potwId: potw._id });
    if (subCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete POTW with ${subCount} existing submission(s). Change status to 'closed' instead.`,
      });
    }

    await potw.deleteOne();
    res.status(200).json({
      success: true,
      message: 'POTW deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
