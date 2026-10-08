import crypto from 'node:crypto';
import RegistrationRequest from '../models/RegistrationRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../config/mailer.js';
import { getRegistrationApprovalEmailHtml } from '../utils/emailTemplates.js';

// GET /api/registrations (Admin only)
export const getRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const registrations = await RegistrationRequest.find(query)
      .populate('reviewedBy', 'name role dtuEmail')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/registrations/:id (Admin only)
export const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await RegistrationRequest.findById(req.params.id)
      .populate('reviewedBy', 'name role dtuEmail');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/registrations/:id/approve (Admin only)
export const approveRegistration = async (req, res, next) => {
  try {
    const registration = await RegistrationRequest.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Registration request is already ${registration.status}.`,
      });
    }

    // Check if user already exists with either email
    const existing = await User.findOne({
      $or: [{ dtuEmail: registration.dtuEmail }, { personalEmail: registration.personalEmail }],
    });

    if (existing) {
      registration.status = 'approved';
      registration.reviewedBy = req.user.id;
      registration.reviewedAt = new Date();
      await registration.save();
      return res.status(400).json({
        success: false,
        message: 'A user account with this DTU or Personal email already exists.',
      });
    }

    // Generate secure temporary password
    const tempPassword = `RT-${crypto.randomBytes(4).toString('hex').toUpperCase()}!${Math.floor(100 + Math.random() * 900)}`;

    // Create user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      name: registration.name,
      dtuEmail: registration.dtuEmail,
      personalEmail: registration.personalEmail,
      branch: registration.branch,
      batch: registration.batch,
      password: tempPassword,
      role: 'member',
      accountStatus: 'active',
      rating: 0,
      potwsCompleted: 0,
    });

    // Mark registration as approved
    registration.status = 'approved';
    registration.reviewedBy = req.user.id;
    registration.reviewedAt = new Date();
    await registration.save();

    // Log admin audit action
    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'APPROVE_REGISTRATION',
      targetType: 'User',
      targetId: newUser._id.toString(),
      details: {
        registrationId: registration._id,
        dtuEmail: registration.dtuEmail,
        personalEmail: registration.personalEmail,
      },
    });

    // Send email with credentials
    const emailBody = `Welcome to ROUNDCode.

Your Round Table DTU membership registration has been approved.

Login Email:
${registration.personalEmail}

Temporary Password:
${tempPassword}

Please log in to your account. You can update this password later whenever you want in your profile settings.

Platform Link: ${process.env.CLIENT_URL || 'http://localhost:3000'}/login`;

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const loginUrl = `${clientUrl}/login`;

    const htmlBody = getRegistrationApprovalEmailHtml({
      name: registration.name,
      personalEmail: registration.personalEmail,
      dtuEmail: registration.dtuEmail,
      tempPassword,
      loginUrl,
    });

    await sendEmail({
      to: registration.personalEmail,
      subject: 'ROUNDCode — Membership Registration Approved!',
      text: emailBody,
      html: htmlBody,
    });

    // Create in-app welcome notification
    await Notification.create({
      userId: newUser._id,
      type: 'approval',
      title: 'Welcome to ROUNDCode!',
      message: 'Your membership has been approved by Round Table DTU. Complete your developer profile to get started.',
      link: '/profile',
    });

    res.status(200).json({
      success: true,
      message: `Registration for ${registration.name} approved. Login credentials sent to ${registration.personalEmail}.`,
      data: {
        user: newUser.toJSON(),
        // Return tempPassword in response for development convenience
        tempPasswordDev: process.env.NODE_ENV !== 'production' ? tempPassword : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/registrations/:id/reject (Admin only)
export const rejectRegistration = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const registration = await RegistrationRequest.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Registration request is already ${registration.status}.`,
      });
    }

    const reason = rejectionReason?.trim() || 'DTU membership details could not be verified.';

    registration.status = 'rejected';
    registration.rejectionReason = reason;
    registration.reviewedBy = req.user.id;
    registration.reviewedAt = new Date();
    await registration.save();

    // Log admin audit action
    await AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REJECT_REGISTRATION',
      targetType: 'RegistrationRequest',
      targetId: registration._id.toString(),
      reason,
      details: {
        dtuEmail: registration.dtuEmail,
        personalEmail: registration.personalEmail,
      },
    });

    // Send rejection email as per Section 9
    const emailBody = `Your ROUNDCode registration request has not been approved.

Reason:
${reason}

If you believe this was an error, please reach out to the Round Table DTU council.`;

    await sendEmail({
      to: registration.personalEmail,
      subject: 'ROUNDCode — Registration Status Update',
      text: emailBody,
    });

    res.status(200).json({
      success: true,
      message: `Registration for ${registration.name} has been rejected.`,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};
