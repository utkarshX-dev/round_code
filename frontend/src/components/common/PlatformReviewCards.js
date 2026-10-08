'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import {
  Code2,
  Trophy,
  Users,
  ShieldCheck,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Sparkles,
  Flame,
  Award,
  Terminal,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

const REVIEW_CARDS = [
  {
    id: 'welcome',
    badge: 'DTU Premier Technical Arena',
    badgeColor: 'text-[#a3ff20] border-[#a3ff20]/30 bg-[#a3ff20]/10',
    title: 'Welcome to ROUNDCode',
    subtitle: 'The private competitive coding and skill acceleration platform for Round Table DTU.',
    icon: Sparkles,
    accentGlow: 'from-[#a3ff20]/20 to-emerald-500/10',
    borderColor: 'border-[#a3ff20]/40',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          ROUNDCode is engineered by <strong className="text-white">Round Table DTU</strong> to cultivate algorithmic excellence, peer collaboration, and competitive programming rigor across all batches and engineering branches.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#141520] border border-[#202230] hover:border-[#a3ff20]/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-[#a3ff20]/15 flex items-center justify-center text-[#a3ff20] mb-2.5">
              <Code2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Weekly Sprints</h4>
            <p className="text-[11px] text-zinc-400">Curated multi-tier algorithmic problems every week.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141520] border border-[#202230] hover:border-sky-400/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 mb-2.5">
              <Trophy className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Live ELO Rating</h4>
            <p className="text-[11px] text-zinc-400">Dynamic score calculation and branch-wise leaderboards.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141520] border border-[#202230] hover:border-purple-400/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 mb-2.5">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">DTU Network</h4>
            <p className="text-[11px] text-zinc-400">Connect, share GitHub projects, and learn from seniors.</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#0d0e14] border border-[#202230] flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a3ff20] animate-pulse"></span>
            Exclusive to verified <strong className="text-zinc-200">@dtu.ac.in</strong> members
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-mono">DTU Technical Council</span>
        </div>
      </div>
    ),
  },
  {
    id: 'potw',
    badge: 'Weekly Algorithmic Challenge',
    badgeColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    title: 'Problem of the Week (POTW)',
    subtitle: 'Every week features three hand-picked problems with a live countdown clock.',
    icon: Code2,
    accentGlow: 'from-amber-400/20 to-orange-500/10',
    borderColor: 'border-amber-400/40',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          POTWs are published every week. You have until the countdown timer expires to submit complete working solutions with code, complexities, and verifiable links.
        </p>

        {/* 3 Difficulty Tiers Showcase */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Easy Tier
              </span>
              <div>
                <span className="text-xs font-bold text-white block">Problem 1: Fundamental Concepts</span>
                <span className="text-[10px] text-zinc-400">Arrays, Strings, Hash Maps, Two Pointers</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 font-mono">+1.0 Point</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Medium Tier
              </span>
              <div>
                <span className="text-xs font-bold text-white block">Problem 2: Core Interview Patterns</span>
                <span className="text-[10px] text-zinc-400">Binary Trees, DP, Graphs, Binary Search</span>
              </div>
            </div>
            <span className="text-xs font-black text-amber-400 font-mono">+2.0 Points</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Hard Tier
              </span>
              <div>
                <span className="text-xs font-bold text-white block">Problem 3: Advanced CP Mastery</span>
                <span className="text-[10px] text-zinc-400">Segment Trees, Trie, Hard Dynamic Programming</span>
              </div>
            </div>
            <span className="text-xs font-black text-rose-400 font-mono">+3.0 Points</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Locking Rule:</strong> Submissions require all 3 problems to be attempted. Once submitted, your entries are permanently locked for admin evaluation.
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'leaderboard',
    badge: 'Dynamic ELO & Scoring',
    badgeColor: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
    title: 'Ratings & The Hall of Fame',
    subtitle: 'Fair, transparent performance metric rewarding consistency and depth.',
    icon: Trophy,
    accentGlow: 'from-sky-400/20 to-blue-600/10',
    borderColor: 'border-sky-400/40',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Your rating updates weekly as tech leads review your submissions. Rise through the global leaderboard and represent your engineering department.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#141520] border border-[#202230]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#a3ff20]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Earn Up to 6 Points</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Full credit for all three problems awards <strong className="text-white">+6.0 rating points</strong>. Partial marks are awarded for partially optimized solutions.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141520] border border-[#202230]">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consistency Penalty</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Missing an active week incurs a <strong className="text-rose-300">-2.0 point penalty</strong> (bounded at 0) to ensure continuous skill sharpening.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#0d0e14] border border-[#202230] text-xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="font-semibold">Filter Leaderboard by:</span>
            <span className="text-[#a3ff20] font-mono text-[11px]">COE • SE • IT • ECE • All Batches</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Compare your standing against your batchmates or view the all-time university leaderboard.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'profile',
    badge: 'Member Showcase',
    badgeColor: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    title: 'Your Engineering Showcase',
    subtitle: 'Build your verified developer footprint on Round Table DTU.',
    icon: Users,
    accentGlow: 'from-purple-400/20 to-pink-500/10',
    borderColor: 'border-purple-400/40',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Link all your coding profiles in one spot. Tech leads and society seniors review your portfolio for hackathons, interview prep, and project mentorship.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="text-[11px] font-bold text-amber-400 block">LeetCode</span>
            <span className="text-[10px] text-zinc-400">Contest stats</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="text-[11px] font-bold text-sky-400 block">Codeforces</span>
            <span className="text-[10px] text-zinc-400">Global rank</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="text-[11px] font-bold text-zinc-200 block">GitHub</span>
            <span className="text-[10px] text-zinc-400">Repositories</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="text-[11px] font-bold text-[#a3ff20] block">Portfolio</span>
            <span className="text-[10px] text-zinc-400">Live projects</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141520] border border-[#202230] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 flex-shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <h5 className="font-bold text-white">Project Showcase</h5>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Add your tech stack, live demos, and GitHub repositories directly in the Profile settings.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'integrity',
    badge: 'Code Review & Integrity',
    badgeColor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    title: 'Verifiable Submissions & Honor Code',
    subtitle: 'Fair play is foundational to the spirit of Round Table DTU.',
    icon: ShieldCheck,
    accentGlow: 'from-emerald-400/20 to-teal-500/10',
    borderColor: 'border-emerald-400/40',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Every submission is evaluated by senior administrators. We uphold academic integrity to keep the competition rewarding and authentic.
        </p>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <CheckCircle2 className="w-4 h-4 text-[#a3ff20] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block">Complexity Proofs</strong>
              <span className="text-zinc-400 text-[11px]">
                Always specify expected Time Complexity (e.g. O(n log n)) and Space Complexity (e.g. O(1)) with brief justification.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <CheckCircle2 className="w-4 h-4 text-[#a3ff20] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block">External Platform Proof Links</strong>
              <span className="text-zinc-400 text-[11px]">
                Provide your accepted LeetCode / Codeforces / CodeChef submission URL or verified drive screenshot.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-200">
            <span className="text-rose-400 font-bold text-sm leading-none mt-0.5">✕</span>
            <div className="text-xs">
              <strong className="text-rose-300 block">Strict Plagiarism Ban</strong>
              <span className="text-rose-200/80 text-[11px]">
                AI-generated copy-pasting and shared code will lead to instant disqualification and account suspension.
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'launch',
    badge: 'Ready to Level Up',
    badgeColor: 'text-[#a3ff20] border-[#a3ff20]/30 bg-[#a3ff20]/10',
    title: 'You Are Ready to Code!',
    subtitle: 'Your journey at ROUNDCode starts right now.',
    icon: Rocket,
    accentGlow: 'from-[#a3ff20]/30 to-purple-500/10',
    borderColor: 'border-[#a3ff20]/50',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Here is your quick roadmap to make the most out of your ROUNDCode experience:
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="w-6 h-6 rounded-lg bg-[#a3ff20]/20 text-[#a3ff20] font-black text-xs flex items-center justify-center font-mono">
              1
            </span>
            <div className="text-xs">
              <span className="text-white font-bold block">Check the Active POTW</span>
              <span className="text-zinc-400 text-[11px]">Open this week&apos;s challenge and read problem statements carefully.</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-black text-xs flex items-center justify-center font-mono">
              2
            </span>
            <div className="text-xs">
              <span className="text-white font-bold block">Complete Your Profile</span>
              <span className="text-zinc-400 text-[11px]">Add your LeetCode handle, GitHub, and top skills.</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141520] border border-[#202230]">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-black text-xs flex items-center justify-center font-mono">
              3
            </span>
            <div className="text-xs">
              <span className="text-white font-bold block">Aim for the Top 10</span>
              <span className="text-zinc-400 text-[11px]">Earn points every week and watch your ranking grow.</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#a3ff20]/15 to-transparent border border-[#a3ff20]/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-white uppercase tracking-wider block">Round Table DTU</span>
            <span className="text-[10px] text-zinc-400">Innovate • Code • Conquer</span>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#a3ff20] text-black text-[11px] font-black uppercase tracking-wider">
            Active Member
          </span>
        </div>
      </div>
    ),
  },
];

export default function PlatformReviewCards() {
  const { user, isTourOpen, skipTour, completeTour } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Close with Escape key, navigate with Arrow keys
  const handleKeyDown = useCallback(
    (e) => {
      if (!isTourOpen) return;
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight') {
        if (currentStep < REVIEW_CARDS.length - 1) {
          setCurrentStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    },
    [isTourOpen, currentStep, skipTour]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isTourOpen) return null;

  const card = REVIEW_CARDS[currentStep];
  const Icon = card.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === REVIEW_CARDS.length - 1;
  const progressPercent = Math.round(((currentStep + 1) / REVIEW_CARDS.length) * 100);

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ROUNDCode Platform Review"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn"
    >
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#a3ff20]/10 via-[#b4a2f8]/5 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      <div className="relative w-full max-w-2xl bg-[#0e1017] border border-[#202230] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Progress Bar */}
        <div className="w-full bg-[#161822] h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#a3ff20] via-sky-400 to-[#b4a2f8] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#202230] flex items-center justify-between gap-4 bg-[#11131c]">
          <div className="flex items-center gap-3">
            <RoundTableLogo size={36} className="rounded-xl overflow-hidden shadow-md flex-shrink-0" showGlow={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight text-white uppercase">
                  ROUND<span className="text-[#a3ff20]">Code</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  Review • {currentStep + 1}/{REVIEW_CARDS.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Platform Tour & Guidelines</p>
            </div>
          </div>

          {/* Prominent SKIP Button */}
          <button
            onClick={skipTour}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1c28] hover:bg-[#252839] border border-[#2b2e40] text-zinc-300 hover:text-white text-xs font-bold transition-all shadow-sm group"
            title="Skip review and go directly to dashboard"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>

        {/* Card Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          {/* Card Badge & Title */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${card.badgeColor}`}
              >
                <Icon className="w-3 h-3" />
                {card.badge}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {card.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {card.subtitle}
            </p>
          </div>

          {/* Card Dynamic Body */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090a0f] border border-[#1b1c28]">
            {card.content}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 pt-4 border-t border-[#202230] bg-[#11131c] flex items-center justify-between gap-3">
          {/* Step Dots Indicators */}
          <div className="flex items-center gap-1.5">
            {REVIEW_CARDS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Jump to slide ${idx + 1}: ${item.title}`}
                className={`transition-all rounded-full ${
                  idx === currentStep
                    ? 'w-7 h-2 bg-[#a3ff20]'
                    : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white border border-[#202230] hover:bg-[#1a1c28] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {isLastStep ? (
              <button
                onClick={completeTour}
                type="button"
                className="btn-tactile-lime flex items-center gap-2 text-xs !py-2 !px-4"
              >
                <span>Enter ROUNDCode</span>
                <Rocket className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                type="button"
                className="btn-tactile-lime flex items-center gap-2 text-xs !py-2 !px-4"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
