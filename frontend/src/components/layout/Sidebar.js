'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Code2,
  Trophy,
  Users,
  BookOpen,
  User,
  ShieldAlert,
  UserCheck,
  FileCheck2,
  CalendarPlus,
  Crown,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isSuperAdmin } = useAuth();

  const memberLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'POTW Challenge', href: '/potw', icon: Code2 },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Members', href: '/members', icon: Users },
    { label: 'Rules & Scoring', href: '/rules', icon: BookOpen },
    { label: 'My Profile', href: '/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Admin Hub', href: '/admin/dashboard', icon: ShieldAlert },
    { label: 'Registrations', href: '/admin/registrations', icon: UserCheck },
    { label: 'Submissions', href: '/admin/submissions', icon: FileCheck2 },
    { label: 'Manage POTWs', href: '/admin/potws', icon: CalendarPlus },
  ];

  if (isSuperAdmin) {
    adminLinks.push({ label: 'Admins & Ratings', href: '/admin/admins', icon: Crown });
  }

  const isActive = (href) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside id="tour-sidebar-nav" className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 flex flex-col gap-6 p-4 rounded-2xl glass-panel border border-slate-800">
        {/* Member Navigation */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
            Navigation
          </p>
          <nav className="flex flex-col gap-1">
            {memberLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-400 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          </nav>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                Admin Console
              </p>
              {isSuperAdmin && (
                <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/60 font-mono">
                  SUPER
                </span>
              )}
            </div>
            <nav className="flex flex-col gap-1">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-purple-500/15 to-cyan-500/15 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Round Table Society Quick Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1">Round Table DTU</p>
          <p className="text-[10px]">
            Private skill & competitive coding ecosystem for members.
          </p>
        </div>
      </div>
    </aside>
  );
}
