'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import RoundTableLogo from '@/components/common/RoundTableLogo';

export default function ForgotPasswordPage() {
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type, message, devResetLink }
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { personalEmail: emailInput });
      if (res.success) {
        setStatus({
          type: res.statusType || 'dispatched',
          message: res.message,
          devLink: res.devResetLink,
          mailError: res.mailError,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <RoundTableLogo size={52} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#a3ff20] block mb-1">
            ACCOUNT RECOVERY
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Forgot Password</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Enter your personal email or DTU email address. We will dispatch a secure single-use reset link.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {status && status.type === 'dispatched' && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <div className="flex items-center gap-2 mb-2 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#a3ff20]" />
              <span>Link Dispatched</span>
            </div>
            <p className="leading-relaxed text-zinc-300">{status.message}</p>
            <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 text-[11px] text-zinc-400">
              💡 <strong>Tip:</strong> If not visible in your inbox within 2 minutes, make sure to check your <strong>Spam / Junk</strong> folder or <strong>Promotions</strong> tab.
            </div>
            {status.devLink && (
              <div className="mt-3 p-3 rounded-xl bg-[#090a0f] border border-[#202230] text-[11px] font-mono break-all">
                <span className="text-zinc-500 block mb-1">Development Direct Reset Link:</span>
                <Link href={status.devLink} className="text-[#a3ff20] underline hover:text-[#b8ff3d]">
                  {status.devLink}
                </Link>
              </div>
            )}
          </div>
        )}

        {status && status.type === 'not_found' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Account Not Found</span>
            </div>
            <p className="leading-relaxed text-zinc-300 mb-2">{status.message}</p>
            <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Not registered yet?</span>
              <Link href="/register" className="text-[11px] font-bold text-[#a3ff20] hover:underline">
                Submit Registration &rarr;
              </Link>
            </div>
          </div>
        )}

        {status && status.type === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-sky-300">
              <AlertCircle className="w-4 h-4 text-sky-400" />
              <span>Registration Pending Review</span>
            </div>
            <p className="leading-relaxed text-zinc-300">{status.message}</p>
          </div>
        )}

        {status && status.type === 'rejected' && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Registration Not Approved</span>
            </div>
            <p className="leading-relaxed text-zinc-300">{status.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Personal or DTU Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. member@gmail.com or name@dtu.ac.in"
                className="w-full bg-[#090a0f] border border-[#202230] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider btn-tactile-lime flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Sending Link...</span> : <span>Send Reset Link</span>}
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
    </div>
  );
}
