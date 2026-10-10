'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Award,
  Check,
  Flame,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const BADGES = [
  {
    key: 'first_submission',
    name: 'First Step',
    description: 'Submit your first POTW and enter the arena.',
    goal: 'Complete your first POTW',
    color: 'lime',
    icon: Rocket,
  },
  {
    key: 'five_potws',
    name: 'Consistent Coder',
    description: 'Five completed challenges. Momentum is a skill.',
    goal: 'Complete 5 POTWs',
    color: 'cyan',
    icon: Target,
  },
  {
    key: 'perfect_score',
    name: 'Perfect 6',
    description: 'A flawless run across every difficulty.',
    goal: 'Score 6 / 6 on a POTW',
    color: 'amber',
    icon: Sparkles,
  },
  {
    key: 'three_week_streak',
    name: 'On Fire',
    description: 'Three weeks of showing up and shipping.',
    goal: 'Maintain a 3-week streak',
    color: 'orange',
    icon: Flame,
  },
  {
    key: 'four_week_streak',
    name: 'Unstoppable',
    description: 'Four consecutive weeks. No missed beats.',
    goal: 'Maintain a 4-week streak',
    color: 'violet',
    icon: Zap,
  },
];

const TONE = {
  lime: {
    glow: 'bg-lime-400',
    icon: 'bg-lime-300 text-black',
    border: 'border-lime-300/50',
    text: 'text-lime-300',
    bar: 'bg-lime-300',
    wash: 'from-lime-300/20',
  },
  cyan: {
    glow: 'bg-cyan-400',
    icon: 'bg-cyan-300 text-black',
    border: 'border-cyan-300/50',
    text: 'text-cyan-300',
    bar: 'bg-cyan-300',
    wash: 'from-cyan-300/20',
  },
  amber: {
    glow: 'bg-amber-400',
    icon: 'bg-amber-300 text-black',
    border: 'border-amber-300/50',
    text: 'text-amber-300',
    bar: 'bg-amber-300',
    wash: 'from-amber-300/20',
  },
  orange: {
    glow: 'bg-orange-400',
    icon: 'bg-orange-300 text-black',
    border: 'border-orange-300/50',
    text: 'text-orange-300',
    bar: 'bg-orange-300',
    wash: 'from-orange-300/20',
  },
  violet: {
    glow: 'bg-violet-400',
    icon: 'bg-violet-300 text-black',
    border: 'border-violet-300/50',
    text: 'text-violet-300',
    bar: 'bg-violet-300',
    wash: 'from-violet-300/20',
  },
};

export default function BadgesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) {
      api.get('/users/me').then((res) => setProfile(res.data)).catch(console.error);
    }
  }, [user, authLoading, router]);

  if (authLoading || !profile) return <LoadingSpinner text="Loading achievement vault..." />;

  const earned = new Set((profile.badges || []).map((badge) => badge.key));
  const unlockedCount = BADGES.filter((badge) => earned.has(badge.key)).length;
  const completion = Math.round((unlockedCount / BADGES.length) * 100);
  const currentStreak = profile.currentStreak || 0;
  const longestStreak = profile.longestStreak || 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#303346] bg-[#11131d] p-6 shadow-2xl shadow-black/30 sm:p-9">
        <div className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-lime-300">
              <Award className="h-3.5 w-3.5" />
              Achievement vault
            </div>
            <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl">
              Build your
              <span className="block text-lime-300">legend.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-zinc-400">
              Every challenge is a chance to level up. Keep your streak alive and collect proof of your progress.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#0a0b11] ring-1 ring-white/10">
              <div className="absolute inset-2 rounded-full border border-dashed border-lime-300/40" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">{completion}%</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">complete</p>
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{unlockedCount}<span className="text-zinc-600">/{BADGES.length}</span></p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">badges unlocked</p>
              <div className="mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-lime-300 transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-orange-300/40 bg-gradient-to-br from-orange-400/15 via-[#15131a] to-[#101119] p-5">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-400/20 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Live streak</p>
              <p className="mt-2 text-5xl font-black tracking-tighter text-white">{currentStreak}</p>
              <p className="mt-1 text-xs text-zinc-400">weeks in a row</p>
            </div>
            <div className="rounded-2xl bg-orange-300 p-3 text-black shadow-lg shadow-orange-400/20"><Flame className="h-6 w-6" /></div>
          </div>
          <div className="mt-5 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((week) => <span key={week} className={`h-1.5 flex-1 rounded-full ${week <= currentStreak ? 'bg-orange-300' : 'bg-white/10'}`} />)}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/10 via-[#15151a] to-[#101119] p-5">
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-yellow-300/15 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200">Personal best</p>
              <p className="mt-2 text-5xl font-black tracking-tighter text-white">{longestStreak}</p>
              <p className="mt-1 text-xs text-zinc-400">longest streak</p>
            </div>
            <div className="rounded-2xl bg-yellow-300 p-3 text-black shadow-lg shadow-yellow-300/20"><Trophy className="h-6 w-6" /></div>
          </div>
          <p className="relative mt-5 text-xs font-semibold text-yellow-100/70">Beat your record. Own the next week.</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-violet-300/35 bg-gradient-to-br from-violet-400/15 via-[#15131d] to-[#101119] p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Next unlock</p>
              <p className="mt-2 text-xl font-black text-white">{unlockedCount === BADGES.length ? 'All claimed' : BADGES.find((badge) => !earned.has(badge.key))?.name}</p>
              <p className="mt-2 text-xs text-zinc-400">{unlockedCount === BADGES.length ? 'The vault is yours.' : BADGES.find((badge) => !earned.has(badge.key))?.goal}</p>
            </div>
            <div className="rounded-2xl bg-violet-300 p-3 text-black"><ShieldCheck className="h-6 w-6" /></div>
          </div>
        </div>
      </section>

      <div className="flex items-end justify-between border-b border-[#252838] pb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-300">The collection</p>
          <h2 className="mt-1 text-2xl font-black text-white">Earn your insignia</h2>
        </div>
        <span className="text-xs font-bold text-zinc-500">{unlockedCount} unlocked</span>
      </div>

      <section className="grid gap-5 md:grid-cols-2">
        {BADGES.map((badge, index) => {
          const isEarned = earned.has(badge.key);
          const tone = TONE[badge.color];
          const Icon = badge.icon;
          return (
            <article key={badge.key} className={`group relative overflow-hidden rounded-[1.75rem] border ${isEarned ? tone.border : 'border-[#252838]'} ${isEarned ? `bg-gradient-to-br ${tone.wash} via-[#12141d] to-[#0e1017]` : 'bg-[#101119]'} p-5 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30`}>
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${tone.glow} opacity-0 blur-3xl transition duration-500 group-hover:opacity-20`} />
              <div className="relative flex items-start gap-4">
                <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isEarned ? tone.icon : 'bg-[#181b27] text-zinc-600'} shadow-inner`}>
                  <Icon className="h-7 w-7" strokeWidth={2.5} />
                  {!isEarned && <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-[#101119] bg-[#252838] p-1 text-zinc-400"><LockKeyhole className="h-3 w-3" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isEarned ? tone.text : 'text-zinc-600'}`}>Level {String(index + 1).padStart(2, '0')}</p>
                      <h3 className={`mt-1 text-xl font-black ${isEarned ? 'text-white' : 'text-zinc-500'}`}>{badge.name}</h3>
                    </div>
                    {isEarned && <span className={`rounded-full ${tone.icon} p-1.5`}><Check className="h-3.5 w-3.5" /></span>}
                  </div>
                  <p className={`mt-2 text-sm leading-5 ${isEarned ? 'text-zinc-300' : 'text-zinc-600'}`}>{badge.description}</p>
                </div>
              </div>
              <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isEarned ? tone.text : 'text-zinc-600'}`}>{isEarned ? 'Unlocked achievement' : 'Locked achievement'}</p>
                  <p className={`mt-1 text-xs ${isEarned ? 'text-zinc-400' : 'text-zinc-600'}`}>{badge.goal}</p>
                </div>
                <ArrowUpRight className={`h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${isEarned ? tone.text : 'text-zinc-700'}`} />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
