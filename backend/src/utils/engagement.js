import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const BADGES = {
  FIRST_SUBMISSION: { key: 'first_submission', name: 'First Step', description: 'Submitted your first POTW.' },
  FIVE_POTWS: { key: 'five_potws', name: 'Consistent Coder', description: 'Completed five POTWs.' },
  PERFECT_SCORE: { key: 'perfect_score', name: 'Perfect 6', description: 'Scored 6/6 on a POTW.' },
  THREE_WEEK_STREAK: { key: 'three_week_streak', name: 'On Fire', description: 'Maintained a three-week streak.' },
  FOUR_WEEK_STREAK: { key: 'four_week_streak', name: 'Unstoppable', description: 'Maintained a four-week streak.' },
};

const badgeByKey = Object.values(BADGES).reduce((map, badge) => {
  map[badge.key] = badge;
  return map;
}, {});

export const notifyUser = async ({ user, type = 'system', title, message, link = '', email = true }) => {
  await Notification.create({ userId: user._id, type, title, message, link });
};

export const notifyActiveMembers = async ({ type = 'system', title, message, link = '' }) => {
  const members = await User.find({ role: 'member', accountStatus: 'active' })
    .select('_id personalEmail')
    .lean();
  if (!members.length) return;

  await Notification.insertMany(
    members.map((user) => ({ userId: user._id, type, title, message, link })),
    { ordered: false }
  );

};

export const awardBadges = async (user, { perfectScore = false } = {}) => {
  const earned = new Set((user.badges || []).map((badge) => badge.key));
  const candidates = [];
  if (user.potwsCompleted >= 1) candidates.push(BADGES.FIRST_SUBMISSION);
  if (user.potwsCompleted >= 5) candidates.push(BADGES.FIVE_POTWS);
  if (perfectScore) candidates.push(BADGES.PERFECT_SCORE);
  if (user.currentStreak >= 3) candidates.push(BADGES.THREE_WEEK_STREAK);
  if (user.currentStreak >= 4) candidates.push(BADGES.FOUR_WEEK_STREAK);

  const newBadges = candidates.filter((badge) => !earned.has(badge.key));
  if (!newBadges.length) return [];

  user.badges.push(...newBadges.map((badge) => ({ key: badge.key })));
  await user.save();

  await Promise.all(
    newBadges.map((badge) =>
      notifyUser({
        user,
        type: 'badge',
        title: `Badge unlocked: ${badge.name}`,
        message: badge.description,
        link: '/profile',
      })
    )
  );
  return newBadges;
};

export const getBadgeDetails = (keys = []) => keys.map((key) => badgeByKey[key]).filter(Boolean);
