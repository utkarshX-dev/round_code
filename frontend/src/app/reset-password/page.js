'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RoundTableLogo from '@/components/common/RoundTableLogo';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [personalEmail, setPersonalEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        personalEmail,
        token,
        newPassword,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-[#a3ff20]/15 border border-[#a3ff20]/40 flex items-center justify-center mx-auto mb-4 text-[#a3ff20]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Password Updated!</h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Your credentials have been securely updated. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider btn-tactile-lime"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <RoundTableLogo size={52} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#a3ff20] block mb-1">
          CREDENTIAL RESET
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Set New Password</h2>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          Enter your single-use verification token and choose a strong password.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Personal or DTU Email
          </label>
          <input
            type="email"
            required
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
            placeholder="e.g. member@gmail.com or name@dtu.ac.in"
            className="w-full bg-[#090a0f] border border-[#202230] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Reset Token
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token received in email"
            className="w-full bg-[#090a0f] border border-[#202230] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#090a0f] border border-[#202230] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#090a0f] border border-[#202230] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider btn-tactile-lime flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <span>Updating Password...</span> : <span>Update Password</span>}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#202230] text-center">
        <Link
          href="/login"
          className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] shadow-2xl relative">
        <Suspense fallback={<LoadingSpinner text="Loading reset form..." />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
