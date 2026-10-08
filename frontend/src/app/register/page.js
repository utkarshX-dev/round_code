'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import { Mail, User, GraduationCap, Calendar, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    dtuEmail: '',
    personalEmail: '',
    branch: '',
    batch: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side pre-validation
    const cleanDtu = formData.dtuEmail.trim().toLowerCase();
    if (!cleanDtu.endsWith('@dtu.ac.in')) {
      setError('DTU Email must strictly end with @dtu.ac.in (e.g., student22coe@dtu.ac.in)');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to submit registration request.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit registration request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#a3ff20]/30 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#a3ff20]/15 border border-[#a3ff20]/30 flex items-center justify-center mx-auto mb-5 text-[#a3ff20]">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase mb-2">Registration Submitted!</h2>
          <p className="text-xs text-zinc-300 leading-relaxed mb-6">
            Your verification request for <strong className="text-white">{formData.dtuEmail}</strong> has been forwarded to Round Table DTU admins. Once approved, you will receive login credentials on your personal email: <strong className="text-white">{formData.personalEmail}</strong>.
          </p>
          <Link
            href="/login"
            className="w-full btn-tactile-lime"
          >
            Back to Member Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-lg w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] shadow-2xl relative">
        <div className="text-center mb-8">
          <RoundTableLogo size={60} className="mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg" showGlow={true} />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Member Registration
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Apply for Round Table DTU coding portal. Requires an authentic <span className="text-[#a3ff20] font-bold">@dtu.ac.in</span> identity.
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
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Aryan Sharma"
                className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Official DTU Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="email"
                name="dtuEmail"
                required
                value={formData.dtuEmail}
                onChange={handleChange}
                placeholder="rollnumber_coe@dtu.ac.in"
                className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">
              Must strictly end with <span className="text-[#a3ff20] font-bold">@dtu.ac.in</span> for society authentication.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Personal Email (For Password Delivery)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="email"
                name="personalEmail"
                required
                value={formData.personalEmail}
                onChange={handleChange}
                placeholder="personal@gmail.com"
                className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Branch
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. COE / IT / SE"
                  className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Graduation Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="batch"
                  required
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                  className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tactile Button with 3D press feel */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 btn-tactile-lime flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <span>Submit Member Application</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#202230] text-center">
          <p className="text-xs text-zinc-400">
            Already verified member?{' '}
            <Link href="/login" className="text-[#a3ff20] hover:underline font-bold ml-1">
              Member Sign In →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
