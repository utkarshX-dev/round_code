'use client';

import React, { useState, useEffect } from 'react';
import { PacmanLoader } from 'react-spinners';

export default function LoadingSpinner({
  size = 25,
  text = 'Loading...',
  color = '#a3e635',
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-6 select-none min-h-[180px]">
      <div className="pl-6 pr-10 py-3 flex items-center justify-center">
        {mounted ? (
          <PacmanLoader color={color} size={numericSize} />
        ) : (
          <div
            style={{ width: numericSize * 2, height: numericSize * 2 }}
            className="rounded-full bg-[#a3e635]/20 animate-pulse"
          />
        )}
      </div>
      {text && (
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
