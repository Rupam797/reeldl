'use client';

interface AdSlotProps {
  position: 'top' | 'inline' | 'bottom';
  className?: string;
}

const heights: Record<string, string> = {
  top: 'h-[90px]',
  inline: 'h-[250px]',
  bottom: 'h-[90px]',
};

export default function AdSlot({ position, className = '' }: AdSlotProps) {
  return (
    <div
      className={`w-full flex items-center justify-center bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-md)] overflow-hidden ${heights[position]} ${className}`}
      role="complementary"
      aria-label={`Advertisement ${position}`}
    >
      <span className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider select-none">
        Advertisement
      </span>
    </div>
  );
}
