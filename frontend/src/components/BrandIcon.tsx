interface BrandIconProps {
  className?: string;
  size?: number;
}

export default function BrandIcon({ className = '', size = 28 }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="headerReelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF414D" />
          <stop offset="50%" stopColor="#FF5C4D" />
          <stop offset="100%" stopColor="#FF7A59" />
        </linearGradient>
      </defs>

      {/* Background Squircle */}
      <rect width="512" height="512" rx="112" fill="url(#headerReelGrad)" />

      {/* Inner Border */}
      <rect x="2" y="2" width="508" height="508" rx="110" stroke="white" strokeOpacity="0.2" strokeWidth="4" />

      {/* Reel Film Sprockets */}
      <circle cx="176" cy="95" r="18" fill="white" fillOpacity="0.85" />
      <circle cx="256" cy="95" r="18" fill="white" fillOpacity="0.85" />
      <circle cx="336" cy="95" r="18" fill="white" fillOpacity="0.85" />

      {/* Arrow Stem */}
      <rect x="230" y="145" width="52" height="150" rx="26" fill="white" />

      {/* Arrow Chevron */}
      <path
        d="M150 270L256 376L362 270"
        stroke="white"
        strokeWidth="52"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Cradle Tray */}
      <rect x="140" y="415" width="232" height="38" rx="19" fill="white" />
    </svg>
  );
}
