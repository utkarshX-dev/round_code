'use client';

import React, { useEffect, useRef } from 'react';
import { NextStepProvider, NextStep, useNextStep } from 'nextstepjs';
import { useAuth } from '@/context/AuthContext';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Rocket,
  Code2,
  Trophy,
  Users,
  User,
  LayoutDashboard,
} from 'lucide-react';

export const tourSteps = [
  {
    tour: 'mainTour',
    steps: [
      {
        icon: <Sparkles className="w-5 h-5 text-[#a3ff20]" />,
        title: 'Welcome to RoundCode',
        content: (
          <div className="space-y-2 text-xs text-zinc-300">
            <p>
              The private competitive coding arena for <strong className="text-white">Round Table DTU</strong> members.
            </p>
            <p className="text-zinc-400">
              Solve weekly algorithmic challenges, build problem-solving rigor, and scale the campus ranks.
            </p>
          </div>
        ),
        selector: '#tour-brand',
        side: 'bottom',
      },
      {
        icon: <LayoutDashboard className="w-5 h-5 text-sky-400" />,
        title: 'Platform Navigation Hub',
        content: (
          <div className="space-y-2 text-xs text-zinc-300">
            <p>
              Seamless access to all core modules:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-400">
              <li><strong className="text-zinc-200">POTW Challenge:</strong> Active algorithmic sprints</li>
              <li><strong className="text-zinc-200">Leaderboard:</strong> Dynamic rankings by batch & branch</li>
              <li><strong className="text-zinc-200">Members:</strong> Peer directory & portfolios</li>
              <li><strong className="text-zinc-200">Rules & Scoring:</strong> ELO scoring guidelines</li>
            </ul>
          </div>
        ),
        selector: '#tour-sidebar-nav',
        side: 'right',
      },
      {
        icon: <Code2 className="w-5 h-5 text-amber-400" />,
        title: 'Problem of the Week (POTW)',
        content: (
          <div className="space-y-2 text-xs text-zinc-300">
            <p>
              Each week presents 3 curated algorithmic problems:
            </p>
            <div className="flex gap-1.5 font-mono text-[11px] pt-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Easy (+1)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium (+2)</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Hard (+3)</span>
            </div>
            <p className="text-[11px] text-amber-200/80 pt-1">
              Race against the live countdown timer before the Sunday midnight deadline!
            </p>
          </div>
        ),
        selector: '#tour-active-potw',
        side: 'bottom',
      },
      {
        icon: <Trophy className="w-5 h-5 text-[#a3ff20]" />,
        title: 'Live Stats & ELO Rating',
        content: (
          <div className="space-y-2 text-xs text-zinc-300">
            <p>
              Earn up to <strong className="text-[#a3ff20]">+6 points</strong> weekly based on code reviews.
            </p>
            <p className="text-zinc-400">
              <strong className="text-rose-300">Consistency Rule:</strong> Unsubmitted active weeks incur a -2 penalty (minimum 0) to keep you consistently sharpening your coding edge.
            </p>
          </div>
        ),
        selector: '#tour-stats-grid',
        side: 'top',
      },
      {
        icon: <User className="w-5 h-5 text-purple-400" />,
        title: 'Verified Engineering Profile',
        content: (
          <div className="space-y-2 text-xs text-zinc-300">
            <p>
              Your public profile showcases your LeetCode, Codeforces, GitHub handles, projects, and DTU batch information.
            </p>
            <p className="text-[11px] text-zinc-400">
              Update your profiles anytime to showcase your accomplishments to fellow students and alumni.
            </p>
          </div>
        ),
        selector: '#tour-profile-pill',
        side: 'bottom',
      },
    ],
  },
];

// Custom Card matching RoundCode tactile design system
export function CustomTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="relative w-[340px] sm:w-[380px] bg-[#11131c] border-2 border-[#202230] hover:border-[#a3ff20]/40 rounded-2xl shadow-2xl p-5 text-white transition-all overflow-hidden">
      {/* Top Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a1c29]">
        <div
          className="h-full bg-gradient-to-r from-[#a3ff20] via-sky-400 to-[#b4a2f8] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card Header with Skip Button */}
      <div className="flex items-start justify-between gap-3 mb-3 pt-1">
        <div className="flex items-center gap-2.5">
          {step.icon && (
            <div className="w-8 h-8 rounded-xl bg-[#1b1e2c] border border-zinc-800 flex items-center justify-center flex-shrink-0">
              {step.icon}
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-white tracking-tight leading-snug">
              {step.title}
            </h4>
            <span className="text-[10px] font-mono font-bold text-[#a3ff20] uppercase tracking-wider block">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Skip Button */}
        {skipTour && (
          <button
            onClick={skipTour}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a1c28] hover:bg-[#252839] border border-zinc-800 hover:border-zinc-700 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
            title="Skip Tour"
          >
            <span>Skip</span>
            <X className="w-3 h-3 text-zinc-500 hover:text-rose-400" />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="py-2 text-xs leading-relaxed text-zinc-300 border-t border-b border-[#1b1c28] my-2">
        {step.content}
      </div>

      {/* Card Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        {/* Step dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all ${
                idx === currentStep
                  ? 'w-4 h-1.5 bg-[#a3ff20]'
                  : 'w-1.5 h-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={prevStep}
              type="button"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white border border-[#202230] hover:bg-[#1a1c28] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          )}

          {isLast ? (
            <button
              onClick={nextStep}
              type="button"
              className="btn-tactile-lime !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
            >
              <span>Finish</span>
              <Rocket className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              type="button"
              className="btn-tactile-lime !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* NextStep Caret / Arrow */}
      {arrow}
    </div>
  );
}

// Internal controller that connects Auth state to NextStep
function TourController({ children }) {
  const { user, shouldStartTour, setShouldStartTour } = useAuth();
  const { startNextStep } = useNextStep();

  // One-shot start when requested (first-time login or clicking "Review Tour")
  useEffect(() => {
    if (!user) return;

    if (shouldStartTour) {
      // Consume the trigger immediately so it NEVER loops
      setShouldStartTour(false);

      const timer = setTimeout(() => {
        try {
          startNextStep('mainTour');
        } catch (err) {
          console.warn('Could not start nextstep tour:', err);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [user, shouldStartTour, setShouldStartTour, startNextStep]);

  return children;
}

export default function NextStepTourWrapper({ children }) {
  const { skipTour, completeTour } = useAuth();

  const handleSkip = () => {
    skipTour();
  };

  const handleComplete = () => {
    completeTour();
  };

  return (
    <NextStepProvider>
      <NextStep
        steps={tourSteps}
        cardComponent={CustomTourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.75"
        onSkip={handleSkip}
        onComplete={handleComplete}
      >
        <TourController>{children}</TourController>
      </NextStep>
    </NextStepProvider>
  );
}
