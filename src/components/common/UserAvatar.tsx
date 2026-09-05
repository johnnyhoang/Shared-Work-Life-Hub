'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({
  avatar,
  name,
  className = '',
  size = 'md',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const dimensionClasses = {
    sm: 'w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] text-xs',
    md: 'w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] text-xs font-bold',
    lg: 'w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] text-sm font-black',
  }[size];

  const trimmedAvatar = avatar?.trim();
  const isUrl = Boolean(
    trimmedAvatar && (trimmedAvatar.startsWith('http://') || trimmedAvatar.startsWith('https://'))
  );

  const initial = name ? name.trim().charAt(0).toUpperCase() : '👤';
  const isEmoji = Boolean(trimmedAvatar && trimmedAvatar.length <= 4 && !isUrl);

  if (isUrl && !imgError && trimmedAvatar) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 aspect-square flex items-center justify-center bg-blue-100 dark:bg-blue-950/70 ${dimensionClasses} ${className}`}
      >
        <img
          src={trimmedAvatar}
          alt={name ? name.charAt(0) : 'U'}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 select-none aspect-square ${dimensionClasses} ${className}`}
    >
      {isEmoji ? trimmedAvatar : initial}
    </div>
  );
}
