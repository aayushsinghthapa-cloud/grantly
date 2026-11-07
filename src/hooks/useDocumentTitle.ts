import { useEffect } from 'react';

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
      ? `${title} · GRANTLY`
      : 'GRANTLY: Unified Scholarship Discovery & Management Platform';
  }, [title]);
}
