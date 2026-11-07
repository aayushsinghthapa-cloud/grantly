import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary/90',
  secondary: 'bg-surface text-ink ring-1 ring-inset ring-border hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  accent: 'bg-ink text-bg hover:bg-ink/85',
  danger: 'bg-danger text-white hover:bg-danger/90 dark:text-bg',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10',
};

/** Shared class builder so links (e.g. <Link>) can look like buttons. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium transition-[background-color,transform,box-shadow] duration-200 ease-apple',
    'disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
    variants[variant],
    sizes[size],
    className,
  );
}
