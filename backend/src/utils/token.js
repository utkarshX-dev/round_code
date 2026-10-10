import { deleteSession } from './session.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookie = (res, sessionId) => {
  res.cookie('roundcode_session', sessionId, cookieOptions);
};

export const clearAuthCookie = async (res, sessionId) => {
  await deleteSession(sessionId);
  res.clearCookie('roundcode_session', {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
};
