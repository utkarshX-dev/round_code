import { firebaseAuth } from '../config/firebase.js';
import User from '../models/User.js';
import { connectRedis } from '../config/redis.js';
import { createSession } from '../utils/session.js';
import { clearAuthCookie, setAuthCookie } from '../utils/token.js';

const userResponse = (user) => ({
  ...user.toJSON(),
  isFirstLogin: !user.hasSeenTour,
});

export const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
    }

    const decoded = await firebaseAuth().verifyIdToken(idToken);
    if (!decoded.uid || !decoded.email) {
      return res.status(401).json({ success: false, message: 'Firebase account has no usable email.' });
    }
    if (decoded.firebase?.sign_in_provider !== 'google.com') {
      return res.status(401).json({ success: false, message: 'Only Google sign-in is supported.' });
    }

    const email = decoded.email.trim().toLowerCase();
    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { personalEmail: email }],
    });

    if (user) {
      if (user.role !== 'member') {
        return res.status(403).json({ success: false, message: 'Administrators must use the admin login.' });
      }
      if (user.firebaseUid && user.firebaseUid !== decoded.uid) {
        return res.status(409).json({ success: false, message: 'This email is linked to another account.' });
      }
      user.firebaseUid = decoded.uid;
      if (!user.personalEmail) user.personalEmail = email;
      if (decoded.name && user.name === 'New Member') user.name = decoded.name;
      if (decoded.picture && !user.profilePhoto) user.profilePhoto = decoded.picture;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name?.trim() || email.split('@')[0],
        personalEmail: email,
        profilePhoto: decoded.picture || '',
        role: 'member',
        accountStatus: 'active',
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is suspended.' });
    }

    await connectRedis();
    const sessionId = await createSession(user._id.toString());
    setAuthCookie(res, sessionId);
    res.status(200).json({ success: true, message: 'Logged in successfully', data: { user: userResponse(user) } });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'College ID or personal email, and password are required.',
      });
    }

    const loginEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { personalEmail: loginEmail },
        { dtuEmail: loginEmail },
      ],
      role: { $in: ['admin', 'super_admin'] },
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }
    if (user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: 'Admin account is suspended.' });
    }

    await connectRedis();
    const sessionId = await createSession(user._id.toString());
    setAuthCookie(res, sessionId);
    res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      data: { user: userResponse(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await clearAuthCookie(res, req.cookies?.roundcode_session);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user.toJSON() });
  } catch (error) {
    next(error);
  }
};
