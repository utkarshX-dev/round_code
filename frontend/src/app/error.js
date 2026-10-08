'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] text-center shadow-2xl relative space-y-6">
        <div className="flex justify-center">
          <RoundTableLogo size={56} />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#a3ff20] block mb-1">
            System Notice
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {error?.message || 'An unexpected error occurred while loading this section of the platform.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider btn-tactile-lime flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider btn-tactile-dark flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
