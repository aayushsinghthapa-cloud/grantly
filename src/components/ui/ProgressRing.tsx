import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  stroke?: number;
  /** Accessible label, e.g. "87% match". Defaults to "{value}%". */
  label?: string;
  showValue?: boolean;
  tone?: 'auto' | 'primary' | 'accent' | 'muted';
  className?: string;
}

const toneClass = { primary: 'text-primary', accent: 'text-accent', muted: 'text-muted' } as const;

function toneFor(value: number): string {
  if (value >= 75) return 'text-primary';
  if (value >= 45) return 'text-accent';
  return 'text-muted';
}

/** Circular score indicator — the signature Match ring. Exposed to AT as a meter-like image. */
export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  label,
  showValue = true,
  tone = 'auto',
  className,
}: ProgressRingProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const colour = tone === 'auto' ? toneFor(clamped) : toneClass[tone];

  return (
    <div
      role="img"
      aria-label={label ?? `${clamped}%`}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-border"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={colour}
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c - (clamped / 100) * c : c }}
          animate={{ strokeDashoffset: c - (clamped / 100) * c }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {showValue && (
        <span
          className="tabular absolute font-display font-semibold leading-none"
          style={{ fontSize: size * 0.28 }}
          aria-hidden
        >
          {clamped}
        </span>
      )}
    </div>
  );
}
