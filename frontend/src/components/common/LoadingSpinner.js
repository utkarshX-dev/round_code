'use client';

import React from 'react';
import { PacmanLoader } from 'react-spinners';

export default function LoadingSpinner({
  size = 25,
  text = 'Loading...',
  color = '#a3e635',
}) {
  // Compute numeric size if string is passed
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 16
      : size === 'lg'
      ? 35
      : 25;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-5 select-none min-h-[220px]">
      <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-2xl shadow-black/20">
        <div className="absolute inset-3 rounded-2xl border border-[#a3ff20]/20 animate-pulse" />
        <PacmanLoader color={color} size={numericSize} />
      </div>
      {text && (
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.18em] text-center animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
