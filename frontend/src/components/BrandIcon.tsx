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
      {/* Flat Brand Squircle (Zero Gradient) */}
      <rect width="512" height="512" rx="120" fill="var(--brand, #FF6B5B)" />

      {/* Minimal White Vector Arrow */}
      <path
        d="M256 120V320M256 320L168 232M256 320L344 232"
        stroke="#FFFFFF"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Cradle Tray */}
      <path
        d="M140 390H372"
        stroke="#FFFFFF"
        strokeWidth="48"
        strokeLinecap="round"
      />
    </svg>
  );
}
