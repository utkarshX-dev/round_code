'use client';

import React from 'react';
import Link from 'next/link';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import { Globe, FolderGit2 } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-20 space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Lilac banner bar matching sample image 3 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#c4b5fd] via-[#b4a2f8] to-[#a99af0] text-black rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[#b4a2f8]/10">
        <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <RoundTableLogo size={40} className="rounded-xl overflow-hidden bg-black p-0.5" />
          <span className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            ROUNDCode
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-extrabold uppercase">
          <button
            onClick={scrollToTop}
            className="hover:opacity-75 transition-opacity flex items-center gap-1 cursor-pointer"
          >
            Back to Top ↗
          </button>
          <Link href="/rules" className="hover:opacity-75 transition-opacity flex items-center gap-1">
            Rules ↗
          </Link>
          <Link href="/leaderboard" className="hover:opacity-75 transition-opacity flex items-center gap-1">
            Leaderboard ↗
          </Link>
          <Link href="/potw" className="hover:opacity-75 transition-opacity flex items-center gap-1">
            POTW ↗
          </Link>
        </div>
      </div>

      {/* Main footer body */}
      <div className="bg-[#14151e] border border-zinc-800 rounded-3xl p-8 sm:p-10 text-zinc-400">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white uppercase tracking-tight">
                ROUND<span className="text-[#a3ff20]">Code</span>
              </span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#1e192e] text-[#b4a2f8] font-bold border border-[#b4a2f8]/30">
                DTU
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              Competitive coding and technical skill-building platform of{' '}
              <strong className="text-zinc-200">Round Table, Delhi Technological University (DTU)</strong>.
              Built to foster algorithmic thinking and real peer growth.
            </p>
            <p className="text-[11px] text-zinc-500">
              Delhi Technological University, Shahbad Daulatpur, Bawana Road, Delhi-110042
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/rules" className="hover:text-[#a3ff20] transition-colors">
                  Rules & Evaluation
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#a3ff20] transition-colors">
                  Global Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/potw" className="hover:text-[#a3ff20] transition-colors">
                  Problem of the Week
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#a3ff20] transition-colors">
                  Apply for Membership
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Round Table DTU
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#a3ff20]" />
                <a
                  href="http://dtu.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  DTU Official Portal
                </a>
              </li>
              
              <li className="text-[11px] text-zinc-500 pt-2">
                Campus domain: <span className="text-[#a3ff20] font-semibold">@dtu.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Round Table DTU. All rights reserved.</p>
          <p>
            Crafted for <span className="text-white font-bold">Round Table DTU</span> members.
          </p>
        </div>
      </div>
    </footer>
  );
}
