import { useEffect } from 'react';
import { useUIStore } from '@/store/ui';

/** Syncs the `dark` class on <html> with the chosen theme (and the OS when "system"). */
export function useThemeSync(): void {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
