'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Lock,
  ShieldAlert,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="pb-4 border-b border-[#202230]">
        <div className="flex items-center gap-2.5 mb-2">
          <BookOpen className="w-6 h-6 text-[#a3ff20]" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Rules & Evaluation System
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Official competition charter and evaluation criteria for Round Table DTU members.
        </p>
      </div>

      {/* POTW Structure */}
      <section className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] space-y-4">
        <div className="flex items-center gap-2.5 text-[#a3ff20]">
          <Clock className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            1. Problem of the Week (POTW) Format
          </h2>
        </div>
        <ul className="text-xs text-zinc-300 space-y-2.5 leading-relaxed pl-4 list-disc">
          <li>
            <strong>Exactly 3 Questions:</strong> Every weekly POTW contains precisely 3 algorithmic problems: one <span className="text-[#a3ff20] font-bold">Easy</span>, one <span className="text-amber-400 font-bold">Medium</span>, and one <span className="text-rose-400 font-bold">Hard</span>.
          </li>
          <li>
            <strong>Single Synchronized Deadline:</strong> All three questions share a common weekly submission deadline (Sunday 11:59 PM IST).
          </li>
          <li>
            <strong>Batch Submission Mandatory:</strong> Members must solve and submit all 3 questions together in one single submission. Partial POTW submissions cannot be accepted.
          </li>
          <li>
            <strong>Hard Deadline Enforcement:</strong> The platform strictly locks submissions when deadline passes.
          </li>
        </ul>
      </section>

      {/* Scoring Matrix */}
      <section className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] space-y-4">
        <div className="flex items-center gap-2.5 text-[#a3ff20]">
          <Award className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            2. Difficulty & Scoring Matrix
          </h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          POTWs have a maximum achievable score of <strong className="text-white">6.0 points</strong> per week, broken down strictly by difficulty tier:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#a3ff20]/30">
            <span className="text-[#a3ff20] font-bold block mb-1 uppercase text-[11px]">Easy Question</span>
            <span className="text-lg font-black text-white">1.0 Maximum Point</span>
            <p className="text-[11px] text-zinc-400 mt-2">
              Fundamental arrays, two pointers, strings, or basic hash tables.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#090a0f] border border-amber-500/30">
            <span className="text-amber-400 font-bold block mb-1 uppercase text-[11px]">Medium Question</span>
            <span className="text-lg font-black text-white">2.0 Maximum Points</span>
            <p className="text-[11px] text-zinc-400 mt-2">
              Trees, graph BFS/DFS, sliding window, backtracking, or standard DP.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#090a0f] border border-rose-500/30">
            <span className="text-rose-400 font-bold block mb-1 uppercase text-[11px]">Hard Question</span>
            <span className="text-lg font-black text-white">3.0 Maximum Points</span>
            <p className="text-[11px] text-zinc-400 mt-2">
              Segment trees, topological flows, bitmask DP, or advanced graphs.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#202230] text-xs text-zinc-300 leading-relaxed">
          <strong className="text-[#a3ff20]">Partial Scoring:</strong> Reviewing administrators can award partial credit in increments of <span className="text-amber-400 font-bold">0.5</span> based on code optimality, asymptotic analysis, and proof validity.
        </div>
      </section>

      {/* Rating & Penalty System */}
      <section className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] space-y-4">
        <div className="flex items-center gap-2.5 text-[#b4a2f8]">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            3. Rating Formula & Penalty Policy
          </h2>
        </div>
        <ul className="text-xs text-zinc-300 space-y-2.5 leading-relaxed pl-4 list-disc">
          <li>
            <strong>Initial Baseline:</strong> All newly approved members start at <code className="text-[#a3ff20] font-bold">Rating = 0.0</code>.
          </li>
          <li>
            <strong>Rating Formula:</strong> Upon evaluation, a member&apos;s new rating is updated by adding awarded POTW points:
            <div className="my-2 p-3 rounded-2xl bg-[#090a0f] border border-[#202230] text-[#a3ff20] font-bold text-xs">
              newRating = Math.max(0, previousRating + potwScore - penalty)
            </div>
          </li>
          <li>
            <strong className="text-rose-400">No-Submission Penalty (-2.0 pts):</strong> If an active member fails to submit a POTW before the deadline, an automated penalty of <strong className="text-rose-400">-2.0 rating points</strong> is applied.
          </li>
          <li>
            <strong>Non-Negative Bound:</strong> Ratings can never drop below zero.
          </li>
        </ul>
      </section>

      {/* Submission Lock & Proof */}
      <section className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] space-y-4">
        <div className="flex items-center gap-2.5 text-[#a3ff20]">
          <Lock className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            4. Submission Lock & Verification
          </h2>
        </div>
        <ul className="text-xs text-zinc-300 space-y-2.5 leading-relaxed pl-4 list-disc">
          <li>
            <strong>Immutable Lock:</strong> Once submitted, answers cannot be edited unless explicitly reopened by an administrator with audit justification.
          </li>
          <li>
            <strong>Required Evidence:</strong> Members provide external profile links and screenshot proof on Google Drive for verification.
          </li>
        </ul>
      </section>

      {/* CTA Section with tactile buttons */}
      <div className="p-8 rounded-3xl bg-[#a3ff20] text-black flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Ready to Take on This Week?</h3>
          <p className="text-xs font-bold text-black/80 mt-1">
            Jump directly into the active problem set and test your limits.
          </p>
        </div>
        <Link
          href="/potw"
          className="px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-black text-white hover:bg-zinc-800 text-center shadow-[0_4px_0_0_#2b2b2b] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <span>Solve POTW</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
