import { LogoMark } from './Logo';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="container-page flex flex-col items-start justify-between gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <p className="inline-flex items-center gap-2">
          <LogoMark className="h-5 w-5" />
          <span>Grantly. One profile, every scholarship explained.</span>
        </p>
        <p>All scholarships shown are fictional demo data. Your data stays in this browser.</p>
      </div>
    </footer>
  );
}
