const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹1,20,000 */
export function formatINR(amount: number): string {
  return inrFull.format(amount);
}

/** Compact Indian notation: ₹1.2L, ₹45K, ₹2.5Cr */
export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, '');
  if (abs >= 1_00_00_000) return `₹${trim(amount / 1_00_00_000)}Cr`;
  if (abs >= 1_00_000) return `₹${trim(amount / 1_00_000)}L`;
  if (abs >= 1_000) return `₹${trim(amount / 1_000)}K`;
  return `₹${amount}`;
}
