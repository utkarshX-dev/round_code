import React from 'react';
import Link from 'next/link';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] text-center shadow-2xl relative space-y-6">
        <div className="flex justify-center">
          <RoundTableLogo size={56} />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#a3ff20]/15 border border-[#a3ff20]/30 flex items-center justify-center text-[#a3ff20] mx-auto">
          <Compass className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#a3ff20] block mb-1">
            404 Error
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Page Not Found
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            The challenge or page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider btn-tactile-lime inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Return to Platform Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
