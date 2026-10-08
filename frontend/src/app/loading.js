'use client';

import React from 'react';
import { PacmanLoader } from 'react-spinners';

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 gap-6 select-none">
      <div className="pl-6 pr-10 py-4 flex items-center justify-center">
        <PacmanLoader color="#a3e635" size={28} />
      </div>
      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center animate-pulse">
        Loading Round Table DTU Platform...
      </p>
    </div>
  );
}
