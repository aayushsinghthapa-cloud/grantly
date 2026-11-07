import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

const REPO_URL = 'https://github.com/aayushsinghthapa-cloud/grantly';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-start md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-ink">
            <LogoMark className="h-5 w-5" />
            <span className="font-semibold">GRANTLY</span>
            <span className="text-muted">
              · Unified Scholarship Discovery &amp; Management Platform
            </span>
          </p>
          <p className="mt-2 max-w-xl text-pretty">
            Scholarship listings are sample data for this build. Your profile, tracker, documents
            and notes stay in your browser.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link to="/requirements" className="font-medium text-ink hover:underline">
                Problem statement &amp; requirements
              </Link>
            </li>
            <li>
              <a href={REPO_URL} className="font-medium text-ink hover:underline">
                Source code
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
