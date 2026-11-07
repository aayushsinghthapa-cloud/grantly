import { useEffect } from 'react';

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · Grantly` : 'Grantly: Scholarships, finally simple';
  }, [title]);
}
