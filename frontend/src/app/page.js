'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DifficultyBadge } from '@/components/common/Badge';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import {
  Code2,
  Trophy,
  ArrowRight,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Round Table DTU',
  url: 'https://roundcode.vercel.app',
  logo: 'https://roundcode.vercel.app/roundtable-icon.png',
  description:
    'RoundCode is a private competitive programming and skill-development platform for Round Table DTU members.',
};

export default function LandingPage() {
  const [currentPotw, setCurrentPotw] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLandingData() {
      try {
        const [potwRes, leadRes] = await Promise.all([
          api.get('/potws/current').catch(() => ({ data: null })),
          api.get('/leaderboard/all-time').catch(() => ({ data: [] })),
        ]);

        if (potwRes.success && potwRes.data) {
          setCurrentPotw(potwRes.data);
        }
        if (leadRes.success && leadRes.data) {
          setLeaderboard(leadRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Landing page data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLandingData();
  }, []);

  return (
    <div className="flex flex-col gap-20 py-6 max-w-6xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section matching Screenshot 1 */}
      <section aria-labelledby="landing-heading" className="relative pt-10 pb-12 text-center max-w-4xl mx-auto">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#12131b] border border-[#202230] text-[#b4a2f8] text-xs font-bold uppercase tracking-wider mb-6">
          <RoundTableLogo size={24} className="rounded-full" showGlow={true} />
          <span>RoundCode by Round Table DTU</span>
        </div>

        {/* Punchy uppercase typography matching "TIME INTO SMART TIME" */}
        <h1 id="landing-heading" className="text-4xl sm:text-7xl font-black tracking-tight uppercase leading-[1.05] mb-5 text-white">
          Turn Code Into{' '}
          <span className="text-[#a3ff20] block sm:inline">
            Real Mastery
          </span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Fast algorithmic duels against real peers. Weekly POTWs, verified code reviews, and transparent leaderboard ratings for Round Table DTU members.
        </p>

        {/* Buttons matching Screenshot 1 & 2 tactile press feel */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto btn-tactile-lime"
          >
            Apply Now
          </Link>
          <Link
            href="/potw"
            className="w-full sm:w-auto btn-tactile-outline"
          >
            View Weekly Tasks
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto btn-tactile-dark"
          >
            Member Login →
          </Link>
        </div>

        {/* 4 Feature highlight pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14 pt-8 border-t border-zinc-800 text-left">
          <div className="p-4 rounded-2xl bg-[#12131b] border border-[#202230]">
            <p className="text-xs font-black text-[#a3ff20] uppercase">3 Tasks / Week</p>
            <p className="text-xs text-zinc-400 mt-0.5">Easy, Medium, Hard</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12131b] border border-[#202230]">
            <p className="text-xs font-black text-[#b4a2f8] uppercase">Human Reviews</p>
            <p className="text-xs text-zinc-400 mt-0.5">Tech leads verify logic</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12131b] border border-[#202230]">
            <p className="text-xs font-black text-white uppercase">Live Ratings</p>
            <p className="text-xs text-zinc-400 mt-0.5">Audit-logged progression</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12131b] border border-[#202230]">
            <p className="text-xs font-black text-[#a3ff20] uppercase">Leaderboard</p>
            <p className="text-xs text-zinc-400 mt-0.5">Weekly & all-time tiers</p>
          </div>
        </div>
      </section>

      {/* Hero Action Card inspired by Screenshot 3: Vibrant Lime Banner */}
      <section aria-labelledby="weekly-challenge-heading" className="w-full">
        <div className="bg-[#a3ff20] text-black rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex items-center gap-6">
            <RoundTableLogo size={72} className="rounded-2xl hidden sm:inline-flex bg-black p-1 shadow-md" />
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-black uppercase tracking-wider bg-black text-[#a3ff20] px-3 py-1 rounded-lg inline-block">
                Weekly Challenge
              </span>
              <h2 id="weekly-challenge-heading" className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-black">
                Let&apos;s See What Your Brain Can Do
              </h2>
              <p className="text-sm font-bold text-black/80 max-w-md">
                Face real challenges, get feedback from senior members, and push your algorithmic limits each week.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/potw"
              className="px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-black text-white hover:bg-zinc-800 text-center shadow-[0_4px_0_0_#2b2b2b] active:translate-y-1 active:shadow-none transition-all"
            >
              Solve POTW
            </Link>
            <Link
              href="/leaderboard"
              className="px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border-2 border-black text-black hover:bg-black hover:text-[#a3ff20] text-center shadow-[0_4px_0_0_#000000] active:translate-y-1 active:shadow-none transition-all"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* How RoundCode Works Section */}
      <section aria-labelledby="progress-heading" className="w-full">
        <div className="text-center mb-10">
          <h2 id="progress-heading" className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Show Progress
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-2">
            You solve weekly problems, receive verified reviews, and level up your rating each week.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Pick Weekly Tasks', desc: 'Every Monday, 3 handpicked LeetCode/Codeforces problems unlock.' },
            { step: '02', title: 'Submit Solution', desc: 'Submit clean code and time/space complexity analysis, with optional proof links.' },
            { step: '03', title: 'Admin Evaluation', desc: 'Tech leads inspect approach, edge cases, and code cleanliness.' },
            { step: '04', title: 'Earn 0-6 Points', desc: 'Score points for optimal complexity and validated submissions.' },
            { step: '05', title: 'Rating Updates', desc: 'Rating rises with every approved problem. Inactivity incurs penalty.' },
            { step: '06', title: 'Rank & Portfolio', desc: 'Showcase verified profile badges, ranking, and public project showcase.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#14151e] border border-zinc-800 hover:border-[#a3ff20]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-black text-[#a3ff20] mb-2 block">{item.step}</span>
                <h3 className="text-sm font-bold text-white uppercase mb-1.5">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Current POTW & Leaderboard Showcase */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Active POTW Card */}
        <div className="bg-[#14151e] p-6 sm:p-8 rounded-3xl border border-zinc-800 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-[#a3ff20] font-black flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#a3ff20]" />
              Active Week
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#1e192e] text-[#b4a2f8] font-bold border border-[#b4a2f8]/30">
              POTW #{currentPotw?.weekNumber || '1'}
            </span>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
            {currentPotw ? currentPotw.title : 'Algorithmic Foundations'}
          </h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            {currentPotw?.description ||
              'Solve problems on arrays, binary search, and dynamic programming to earn weekly rating points.'}
          </p>

          <div className="space-y-3 mb-6">
            {currentPotw?.problems ? (
              currentPotw.problems.map((prob, i) => (
                <div
                  key={prob._id || i}
                  className="p-3.5 rounded-xl bg-[#0b0c10] border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#14151e] flex items-center justify-center text-xs font-black text-zinc-300">
                      Q{i + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{prob.title}</span>
                  </div>
                  <DifficultyBadge difficulty={prob.difficulty} />
                </div>
              ))
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Climbing Stairs</span>
                  <DifficultyBadge difficulty="easy" />
                </div>
                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Longest Increasing Subsequence</span>
                  <DifficultyBadge difficulty="medium" />
                </div>
                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Segment Tree Range Queries</span>
                  <DifficultyBadge difficulty="hard" />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400 font-semibold">Max Points: 6.0 pts</span>
            <Link
              href="/potw"
              className="inline-flex items-center gap-1.5 text-[#a3ff20] hover:text-[#b8ff3d] font-bold uppercase"
            >
              Solve Challenge <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right: Top Leaderboard Preview */}
        <div className="bg-[#14151e] p-6 sm:p-8 rounded-3xl border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-[#b4a2f8] font-black flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              All-Time Standings
            </span>
            <Link href="/leaderboard" className="text-xs text-zinc-400 hover:text-white transition-colors font-bold">
              Full Board →
            </Link>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Top DTU Coders</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Ranked by verified rating points and solved weekly problems.
          </p>

          <div className="space-y-2.5">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
                return (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-xl bg-[#0b0c10] border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-black">{medal}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          {item.branch || 'DTU'} {item.batch ? `• ${item.batch}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[#a3ff20]">
                        {item.rating} pts
                      </span>
                      <p className="text-[10px] text-zinc-500">
                        {item.potwsCompleted || 0} POTWs
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                Leaderboard data will display here as member submissions are approved.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
