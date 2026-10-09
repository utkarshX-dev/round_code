import crypto from 'node:crypto';
import User from '../models/User.js';
import RegistrationRequest from '../models/RegistrationRequest.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { sendEmail } from '../config/mailer.js';
import { getPasswordResetEmailHtml } from '../utils/emailTemplates.js';

// POST /api/auth/register (Member submits registration request)
export const submitRegistration = async (req, res, next) => {
  try {
    const { name, dtuEmail, personalEmail, branch, batch } = req.body;

    if (!name || !dtuEmail || !personalEmail || !branch || !batch) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: Full Name, DTU Email, Personal Email, Branch, Batch.',
      });
    }

    const cleanDtuEmail = dtuEmail.trim().toLowerCase();
    const cleanPersonalEmail = personalEmail.trim().toLowerCase();

    // Section 6 DTU Email Validation: Must end with @dtu.ac.in
    const dtuEmailRegex = /^[a-zA-Z0-9._%+-]+@dtu\.ac\.in$/;
    if (!dtuEmailRegex.test(cleanDtuEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DTU Email. Email must strictly end with @dtu.ac.in (e.g., yourname123@dtu.ac.in)',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ dtuEmail: cleanDtuEmail }, { personalEmail: cleanPersonalEmail }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An active account with this DTU Email or Personal Email already exists.',
      });
    }

    // Check if pending request exists
    const existingPending = await RegistrationRequest.findOne({
      $or: [{ dtuEmail: cleanDtuEmail }, { personalEmail: cleanPersonalEmail }],
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A registration request with this email is already pending admin review.',
      });
    }

    const newRequest = await RegistrationRequest.create({
      name: name.trim(),
      dtuEmail: cleanDtuEmail,
      personalEmail: cleanPersonalEmail,
      branch: branch.trim(),
      batch: batch.trim(),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully! An administrator will review your application.',
      data: {
        requestId: newRequest._id,
        name: newRequest.name,
        dtuEmail: newRequest.dtuEmail,
        status: newRequest.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login (Member/Admin logs in using Personal Email + Password)
export const login = async (req, res, next) => {
  try {
    const { personalEmail, password } = req.body;

    if (!personalEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Personal Email and password are required.',
      });
    }

    const cleanEmail = personalEmail.trim().toLowerCase();

    // Allow login with either Personal Email or DTU Email for flexibility
    const user = await User.findOne({
      $or: [{ personalEmail: cleanEmail }, { dtuEmail: cleanEmail }],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid personal email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid personal email or password.',
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact Round Table DTU administration.',
      });
    }

    const token = generateToken(user._id.toString(), user.role);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: user.toJSON(),
        isFirstLogin: !user.hasSeenTour,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
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

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const rawEmail = req.body.personalEmail || req.body.email || req.body.dtuEmail;
    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Personal Email or DTU Email is required.',
      });
    }

    const cleanEmail = rawEmail.trim().toLowerCase();

    // Support lookup by either personalEmail or dtuEmail
    const user = await User.findOne({
      $or: [{ personalEmail: cleanEmail }, { dtuEmail: cleanEmail }],
    });

    if (!user) {
      // Check if registration is pending admin approval
      const pendingReq = await RegistrationRequest.findOne({
        $or: [{ personalEmail: cleanEmail }, { dtuEmail: cleanEmail }],
        status: 'pending',
      });
      if (pendingReq) {
        return res.status(200).json({
          success: true,
          statusType: 'pending',
          message: `Your registration request for "${cleanEmail}" is currently pending administrator review. Login credentials will be dispatched to your email once approved.`,
        });
      }

      // Check if registration was rejected
      const rejectedReq = await RegistrationRequest.findOne({
        $or: [{ personalEmail: cleanEmail }, { dtuEmail: cleanEmail }],
        status: 'rejected',
      });
      if (rejectedReq) {
        return res.status(200).json({
          success: true,
          statusType: 'rejected',
          message: `The registration request for "${cleanEmail}" was rejected by an administrator. Please reach out to Round Table DTU leadership.`,
        });
      }

      // In non-production, return clear diagnostic info
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({
          success: true,
          statusType: 'not_found',
          message: `No active account was found matching "${cleanEmail}". Make sure you have registered and your membership was approved.`,
        });
      }

      // Consistent production security response
      return res.status(200).json({
        success: true,
        statusType: 'dispatched',
        message: 'If an active account exists with that email, a password reset link has been dispatched.',
      });
    }

    // Generate cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Invalidate previous tokens
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Create 1 hour expiring token
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.personalEmail)}`;

    // Dispatch to personal email
    const emailResult = await sendEmail({
      to: user.personalEmail,
      subject: 'ROUNDCode — Password Reset Request',
      text: `Hello ${user.name},\n\nYou recently requested to reset your password for ROUNDCode (Round Table DTU).\n\nClick the link below or copy it into your browser to set a new password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
      html: getPasswordResetEmailHtml({
        name: user.name,
        resetLink,
      }),
    });

    if (emailResult && !emailResult.success) {
      console.error(`[SMTP Mailer] Failed to deliver password reset email to ${user.personalEmail}:`, emailResult.error);
    }

    res.status(200).json({
      success: true,
      statusType: 'dispatched',
      message: `Password reset link dispatched to ${user.personalEmail}.`,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const rawEmail = req.body.personalEmail || req.body.email || req.body.dtuEmail;
    const { token, newPassword } = req.body;

    if (!rawEmail || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const cleanEmail = rawEmail.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ personalEmail: cleanEmail }, { dtuEmail: cleanEmail }],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordResetToken.findOne({
      userId: user._id,
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new one.',
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Remove the token immediately after successful use.
    await PasswordResetToken.deleteOne({ _id: resetRecord._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
