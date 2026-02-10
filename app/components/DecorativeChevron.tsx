'use client';

import React, { useId } from 'react';

interface DecorativeChevronProps {
  variant: 'blue' | 'orange';
  className?: string;
}

export const DecorativeChevron: React.FC<DecorativeChevronProps> = ({ variant, className = '' }) => {
  const uid = useId();
  const gradId = `chev_${variant}_${uid}`;

  if (variant === 'blue') {
    return (
      <svg className={className} viewBox="0 0 266 273" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M136.501 0H265.816L64.6584 201.158L0.000427246 136.5L136.501 0Z" fill="#527BE7" />
        <path d="M64.659 201.158L129.317 136.5L258.633 273H136.501L64.659 201.158Z" fill={`url(#${gradId})`} />
        <defs>
          <linearGradient id={gradId} x1="161.646" y1="136.5" x2="161.646" y2="273" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E4581" />
            <stop offset="1" stopColor="#527BE7" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 266 273" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M129.162 272.676H0L200.919 71.7569L265.5 136.338L129.162 272.676Z" fill="#F7A000" />
      <path d="M200.919 71.7568L136.338 136.338L7.17578 4.57764e-05H129.162L200.919 71.7568Z" fill={`url(#${gradId})`} />
      <defs>
        <linearGradient id={gradId} x1="104.047" y1="136.338" x2="104.047" y2="4.57764e-05" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E5C00" />
          <stop offset="1" stopColor="#F7A000" />
        </linearGradient>
      </defs>
    </svg>
  );
};
