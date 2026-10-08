'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNextStep } from 'nextstepjs';

import NotificationDropdown from '@/components/common/NotificationDropdown';
import { RoleBadge } from '@/components/common/Badge';
import RoundTableLogo from '@/components/common/RoundTableLogo';

import { Code2, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { startNextStep } = useNextStep();

  const pathname = usePathname();

  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090a0f]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link
          id="tour-brand"
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-3 group"
        >
          <RoundTableLogo
            size={38}
            className="rounded-xl overflow-hidden group-hover:scale-105 transition-transform"
            showGlow={true}
          />

          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase block">
              ROUND<span className="text-[#a3ff20]">Code</span>
            </span>

            <p className="text-[10px] text-zinc-400 hidden sm:block">
              by Roundtable DTU
            </p>
          </div>
        </Link>

        {/* Right side navigation */}
        <div className="flex items-center gap-3 sm:gap-4">

          {!user ? (

            !isAuthPage && (
              <div className="flex items-center gap-2 sm:gap-3">

                <Link
                  href="/rules"
                  className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                >
                  Rules
                </Link>

                <Link
                  href="/leaderboard"
                  className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                >
                  Leaderboard
                </Link>

                <Link
                  href="/login"
                  className="text-xs font-black uppercase tracking-wider text-white border-2 border-[#a3ff20] bg-[#12131c] px-3.5 py-1.5 rounded-xl shadow-[0_3px_0_0_#a3ff20] active:translate-y-[2px] active:shadow-none hover:bg-[#1a1c29] transition-all"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="text-xs font-black uppercase tracking-wider text-black bg-[#a3ff20] border-2 border-[#a3ff20] px-4 py-1.5 rounded-xl shadow-[0_3px_0_0_#6cb204] active:translate-y-[2px] active:shadow-none hover:bg-[#b5ff38] transition-all"
                >
                  Apply
                </Link>

              </div>
            )

          ) : (

            <div className="flex items-center gap-2.5 sm:gap-3">

              {/* Platform Review Tour Button */}
              <button
                type="button"
                onClick={() => {
                  console.log('Starting ROUNDCode tour...');
                  startNextStep('mainTour');
                }}
                title="Review Platform Tour"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-[#14151e] border border-zinc-800 hover:border-[#a3ff20]/40 rounded-xl transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#a3ff20]" />

                <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-bold">
                  Review Tour
                </span>
              </button>

              {/* Notification Center */}
              <NotificationDropdown />

              {/* User Profile Pill */}
              <Link
                id="tour-profile-pill"
                href="/profile"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#14151e] border border-zinc-800 hover:border-[#a3ff20]/50 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-[#b4a2f8] flex items-center justify-center text-xs font-black text-black">
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="hidden md:block text-left">

                  <div className="flex items-center gap-1.5">

                    <span className="text-xs font-bold text-white leading-tight max-w-[120px] truncate">
                      {user.name}
                    </span>

                    <RoleBadge role={user.role} />

                  </div>

                  <span className="text-[10px] text-[#a3ff20] font-black block">
                    ★ {user.rating} pts
                  </span>

                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
}