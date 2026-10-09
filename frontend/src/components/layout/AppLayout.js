'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Code2, Trophy, Users, User } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isPublicPage = ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);
  const showSidebar = user && !isPublicPage;

  return (
    <div className="min-h-screen flex flex-col bg-radial-glow">
        <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showSidebar ? (
          <div className="flex gap-6 items-start">
            <Sidebar />
            <div className="flex-1 min-w-0 pb-16 md:pb-0">{children}</div>
          </div>
        ) : (
          <div className="w-full">{children}</div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Section 90 Responsive Design) */}
      {showSidebar && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around py-2 px-1">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
              pathname === '/dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/potw"
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
              pathname.startsWith('/potw') ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Code2 className="w-5 h-5" />
            <span>POTW</span>
          </Link>
          <Link
            href="/leaderboard"
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
              pathname.startsWith('/leaderboard') ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Ranks</span>
          </Link>
          <Link
            href="/members"
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
              pathname.startsWith('/members') ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Members</span>
          </Link>
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
              pathname.startsWith('/profile') ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </nav>
      )}

      {isPublicPage && <Footer />}
    </div>
  );
}
