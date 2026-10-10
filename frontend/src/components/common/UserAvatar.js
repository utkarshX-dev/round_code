'use client';

import React from 'react';

export default function UserAvatar({
  user,
  size = 'md',
  className = '',
  alt,
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-11 h-11 text-sm rounded-xl',
    lg: 'w-20 h-20 text-3xl rounded-2xl',
  };
  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'M';

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden bg-[#b4a2f8] flex items-center justify-center font-black text-black shadow-sm ${sizes[size] || sizes.md} ${className}`}
      aria-label={alt || `${user?.name || 'Member'} profile photo`}
    >
      {user?.profilePhoto ? (
        // Cloudinary URLs are user-generated and are intentionally not restricted to a local image path.
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={user.profilePhoto}
          alt={alt || `${user?.name || 'Member'} profile`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        initials
      )}
    </div>
  );
}
