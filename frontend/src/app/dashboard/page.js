'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { DifficultyBadge } from '@/components/common/Badge';
import ParticipationHeatmap from '@/components/analytics/Heatmap';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import { Terminal } from '@/components/ui/terminal';
import {
  Trophy,
  Code2,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activePotw, setActivePotw] = useState(null);
  const [allPotws, setAllPotws] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myRank, setMyRank] = useState('-');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        const userId = user._id || user.id;
        const [currentRes, potwsRes, subsRes, userProfileRes] = await Promise.all([
          api.get('/potws/current').catch(() => ({ data: null })),
          api.get('/potws').catch(() => ({ data: [] })),
          api.get('/submissions/my').catch(() => ({ data: [] })),
          userId ? api.get(`/users/${userId}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
        ]);

        if (currentRes?.success && currentRes.data) {
          setActivePotw(currentRes.data);
        }
        if (potwsRes?.success && potwsRes.data) {
          setAllPotws(Array.isArray(potwsRes.data) ? potwsRes.data : []);
        }
        if (subsRes?.success && subsRes.data) {
          setMySubmissions(Array.isArray(subsRes.data) ? subsRes.data : []);
        }
        if (userProfileRes?.success && userProfileRes.data?.rank) {
          setMyRank(userProfileRes.data.rank);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  // Live countdown timer for active POTW deadline
  useEffect(() => {
    if (!activePotw?.deadline) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(activePotw.deadline).getTime();
      if (isNaN(end)) return;

      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activePotw]);

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading member dashboard..." />;
  }

  if (!user) return null;

  // Active POTW submission status
  const currentSubmission = mySubmissions.find(
    (s) => s.potwId?._id === activePotw?._id || s.potwId === activePotw?._id
  );
  const currentPotwScore = currentSubmission?.totalScore ?? (currentSubmission ? 'Submitted' : '0.0');

  // Check if profile is empty
  const isNewMember = !user.bio && (!user.skills || user.skills.length === 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-4">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202230]">
        <div className="flex items-center gap-3.5">
          <RoundTableLogo size={46} className="rounded-2xl" showGlow={true} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Welcome back, <span className="text-[#a3ff20]">{user.name}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Round Table DTU • {user.branch || 'Engineering'} ({user.batch || 'DTU'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/potw"
            className="btn-tactile-lime flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Open Current POTW</span>
          </Link>
        </div>
      </div>

      {/* Onboarding Banner */}
      {isNewMember && (
        <div className="p-5 rounded-3xl bg-[#12131b] border border-[#a3ff20]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a3ff20]/15 border border-[#a3ff20]/40 flex items-center justify-center text-[#a3ff20] flex-shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase">Your Profile is Ready to be Customized!</h4>
              <p className="text-xs text-zinc-400">
                Add your technical skills, portfolio links, and LeetCode handles to stand out.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="btn-tactile-outline whitespace-nowrap"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Welcome to Round Table Interactive Terminal */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#a3ff20] animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-[#a3ff20]" />
              Welcome to Round Table // Terminal Session
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            RT CLI v2.4.0 • DTU Node
          </span>
        </div>
        <Terminal
          commands={[
            `roundtable welcome --name "${user.name || 'Member'}"`,
            "roundtable check --potw",
            "roundtable arena --status",
            "roundtable leaderboard --rank",
          ]}
          outputs={{
            0: [`✔ Welcome to Round Table, ${user.name || 'Member'}!`],
            1: [`✔ Active Challenge: ${activePotw?.title || 'POTW loaded & ready to solve'}.`],
            2: ["✔ Compiler sandbox online: C++, Python, Java, JavaScript."],
            3: [`★ DTU Rank: #${myRank || '1'} • Code, collaborate, and conquer! ★`],
          }}
          typingSpeed={38}
          delayBetweenCommands={850}
          title={`roundtable@dtu: ~ (${user.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'member'})`}
        />
      </div>

      {/* Primary Statistics Cards */}
      <div id="tour-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Rating */}
        <div className="bg-[#12131b] p-5 rounded-3xl border border-[#202230]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rating</span>
            <TrendingUp className="w-4 h-4 text-[#a3ff20]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#a3ff20] tracking-tight">
            {(Number(user.rating) || 0).toFixed(1)}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Evaluated points across POTWs
          </p>
        </div>

        {/* POTWs Completed */}
        <div className="bg-[#12131b] p-5 rounded-3xl border border-[#202230]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {user.potwsCompleted || 0}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Incremented +1 per challenge set
          </p>
        </div>

        {/* Current Rank */}
        <div className="bg-[#12131b] p-5 rounded-3xl border border-[#202230]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rank</span>
            <Trophy className="w-4 h-4 text-[#b4a2f8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#b4a2f8] tracking-tight">
            #{myRank}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Round Table DTU overall standing
          </p>
        </div>

        {/* Current POTW Score */}
        <div className="bg-[#12131b] p-5 rounded-3xl border border-[#202230]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Week Score</span>
            <Award className="w-4 h-4 text-[#a3ff20]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#a3ff20] tracking-tight">
            {typeof currentPotwScore === 'number' ? `${currentPotwScore} / 6` : currentPotwScore}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            {currentSubmission?.status === 'reviewed' ? 'Reviewed & credited' : 'POTW evaluation state'}
          </p>
        </div>
      </div>

      {/* Current Active POTW Showcase */}
      <div id="tour-active-potw">
        {activePotw ? (
          <div className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#202230]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1e192e] text-[#b4a2f8] border border-[#b4a2f8]/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#a3ff20]" />
                  POTW #{activePotw.weekNumber}
                </span>
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Challenge</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{activePotw.title}</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                {activePotw.description || 'Solve all 3 questions together before the weekly deadline.'}
              </p>
            </div>

            {/* Deadline Countdown */}
            <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#202230] text-center min-w-[220px]">
              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#a3ff20]" />
                Submission Deadline
              </span>
              <div className="flex items-center justify-center gap-2 text-white font-mono">
                <div className="text-center">
                  <span className="text-lg font-black">{timeLeft.days}</span>
                  <span className="text-[9px] text-zinc-500 block">DAYS</span>
                </div>
                <span className="text-zinc-600">:</span>
                <div className="text-center">
                  <span className="text-lg font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[9px] text-zinc-500 block">HRS</span>
                </div>
                <span className="text-zinc-600">:</span>
                <div className="text-center">
                  <span className="text-lg font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[9px] text-zinc-500 block">MIN</span>
                </div>
                <span className="text-zinc-600">:</span>
                <div className="text-center">
                  <span className="text-lg font-black text-[#a3ff20]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[9px] text-zinc-500 block">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Checklist & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {(activePotw.problems || []).map((p, idx) => {
              const probSubmission = currentSubmission?.problems?.find(
                (sp) => sp.problemId === p._id || sp.problemId?.toString() === p._id?.toString()
              );
              const isSolved = Boolean(probSubmission);

              return (
                <div
                  key={p._id || idx}
                  className="p-4 rounded-2xl bg-[#090a0f] border border-[#202230] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-400">Question {idx + 1}</span>
                      <DifficultyBadge difficulty={p.difficulty} />
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{p.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.statement}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#202230] flex items-center justify-between text-xs">
                    <span className="text-zinc-500 text-[11px]">
                      Complexity: {p.expectedTimeComplexity || 'O(n)'}
                    </span>
                    {isSolved ? (
                      <span className="text-[#a3ff20] font-bold flex items-center gap-1 text-[11px]">
                        ✓ Submitted
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">○ Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#202230]">
            <div className="text-xs text-zinc-400">
              Status:{' '}
              {currentSubmission ? (
                <span className="text-[#a3ff20] font-bold">
                  Submitted on {currentSubmission.submittedAt ? new Date(currentSubmission.submittedAt).toLocaleDateString() : 'Record'} (Under evaluation)
                </span>
              ) : (
                <span className="text-amber-400 font-bold">
                  Unsubmitted • Complete all 3 to maintain rating
                </span>
              )}
            </div>

            <Link
              href="/potw"
              className="btn-tactile-lime flex items-center justify-center gap-2"
            >
              <span>{currentSubmission ? 'View Your Submission' : 'Solve & Submit Challenge'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#12131b] text-center border border-[#202230]">
          <p className="text-sm text-zinc-400">No active POTW right now. Check back soon for the next weekly challenge!</p>
        </div>
      )}
      </div>

      {/* Participation Heatmap */}
      <ParticipationHeatmap submissions={mySubmissions} potws={allPotws} activePotw={activePotw} />
    </div>
  );
}
