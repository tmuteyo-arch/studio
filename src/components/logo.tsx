import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 40"
    {...props}
  >
    <rect width="40" height="40" rx="8" fill="none" />
    <circle cx="12" cy="12" r="8" fill="#FFD700" /> {/* Brand Yellow */}
    <circle cx="28" cy="12" r="8" fill="#A020F0" /> {/* Brand Purple */}
    <circle cx="12" cy="28" r="8" fill="#40E0D0" /> {/* Brand Teal */}
    <circle cx="28" cy="28" r="8" fill="#E31B23" /> {/* Brand Red */}
  </svg>
);