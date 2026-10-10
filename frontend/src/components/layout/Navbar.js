'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import NotificationDropdown from '@/components/common/NotificationDropdown';
import { RoleBadge } from '@/components/common/Badge';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import UserAvatar from '@/components/common/UserAvatar';

import { Code2, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const pathname = usePathname();

  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090a0f]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#090a0f]/75">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a3ff20]/70 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">

        {/* Brand */}
        <Link
          id="tour-brand"
          href={user ? '/dashboard' : '/'}
          aria-label="RoundCode home"
          className="flex items-center gap-3 group rounded-xl"
        >
          <RoundTableLogo
            size={38}
            className="rounded-xl overflow-hidden group-hover:scale-105 transition-transform"
            showGlow={true}
          />

          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase block">
              Round<span className="text-[#a3ff20]">Code</span>
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
                  className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors px-3 py-2 rounded-lg"
                >
                  Rules
                </Link>

                <Link
                  href="/leaderboard"
                  className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors px-3 py-2 rounded-lg"
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

              {/* Notification Center */}
              <NotificationDropdown />

              {/* User Profile Pill */}
              <Link
                id="tour-profile-pill"
                href="/profile"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#14151e] border border-zinc-800 hover:border-[#a3ff20]/50 transition-all"
              >
                <UserAvatar user={user} size="sm" />

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
                aria-label="Log out"
                className="p-2.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
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