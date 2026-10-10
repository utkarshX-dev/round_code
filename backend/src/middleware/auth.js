import User from '../models/User.js';
import { getSession } from '../utils/session.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.roundcode_session;
    const session = await getSession(sessionId);
    if (!session?.userId) {
      return res.status(401).json({ success: false, message: 'Please log in.' });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }
    if (user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is suspended.' });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      dtuEmail: user.dtuEmail,
      personalEmail: user.personalEmail,
    };
    next();
  } catch (error) {
    next(error);
  }
};
