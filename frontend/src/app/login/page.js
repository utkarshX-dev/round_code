'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [personalEmail, setPersonalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(personalEmail, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] shadow-2xl relative">
        <div className="text-center mb-8">
          <RoundTableLogo size={60} className="mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg" showGlow={true} />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Member Login
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Enter your <strong className="text-zinc-200">Personal Email</strong> to access Round Table DTU challenges.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="Personal email or @dtu.ac.in"
                className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">
              Enter your registered Personal Email or DTU College Email.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#a3ff20] hover:underline font-bold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-11 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tactile Button with 3D press feel */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 btn-tactile-lime flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to ROUNDCode</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials helper */}
        <div className="mt-6 p-3 rounded-2xl bg-[#090a0f] border border-[#202230]/70 text-[11px]">
          <div className="text-zinc-400 font-semibold mb-2 flex items-center justify-between">
            <span>Demo Quick-Fill:</span>
            <span className="text-[10px] text-zinc-500 font-mono">Password@123</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setPersonalEmail('superadmin@roundtabledtu.in');
                setPassword('Password@123');
              }}
              className="py-1.5 px-2 rounded-xl bg-[#1a1c28] hover:bg-[#252839] text-[#a3ff20] text-[10px] font-bold border border-[#a3ff20]/20 transition-all text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setPersonalEmail('admin.utkarsh@roundtabledtu.in');
                setPassword('Password@123');
              }}
              className="py-1.5 px-2 rounded-xl bg-[#1a1c28] hover:bg-[#252839] text-sky-400 text-[10px] font-bold border border-sky-400/20 transition-all text-center"
            >
              Tech Lead
            </button>
            <button
              type="button"
              onClick={() => {
                setPersonalEmail('priya.malik@gmail.com');
                setPassword('Password@123');
              }}
              className="py-1.5 px-2 rounded-xl bg-[#1a1c28] hover:bg-[#252839] text-purple-400 text-[10px] font-bold border border-purple-400/20 transition-all text-center"
            >
              Member
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#202230] text-center">
          <p className="text-xs text-zinc-400">
            Don&apos;t have an active account yet?{' '}
            <Link href="/register" className="text-[#a3ff20] hover:underline font-bold ml-1">
              Apply as Member →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
