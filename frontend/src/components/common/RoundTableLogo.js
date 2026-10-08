import React from 'react';
import Image from 'next/image';

export default function RoundTableLogo({ size = 36, className = '', showGlow = false }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md bg-[#a3ff20]/20 pointer-events-none"
          style={{ transform: 'scale(1.2)' }}
        />
      )}
      <Image
        src="/logo.png"
        alt="Round Table DTU"
        width={size}
        height={size}
        style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
        className="relative object-contain rounded-xl"
        priority
      />
    </div>
  );
}
