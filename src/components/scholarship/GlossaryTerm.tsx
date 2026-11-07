import type { ReactNode } from 'react';
import { Tooltip } from '@/components/ui';
import { GLOSSARY } from '@/data/glossary';

/** Wraps jargon in an explainer tooltip when the glossary has an entry; renders plain text otherwise. */
export function GlossaryTerm({ term, children }: { term: string; children?: ReactNode }) {
  const definition = GLOSSARY[term];
  if (!definition) return <>{children ?? term}</>;
  return (
    <Tooltip
      content={
        <>
          <strong className="block text-bg">{term}</strong>
          {definition}
        </>
      }
    >
      {children ?? term}
    </Tooltip>
  );
}
