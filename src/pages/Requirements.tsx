import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { PROBLEM_STATEMENT, REQUIREMENTS, RULES, TRACK_TITLE } from '@/data/brief';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** How GRANTLY meets the problem statement: every requirement, the features behind it, and where to try it. */
export default function RequirementsPage() {
  useDocumentTitle('Problem statement & requirements');
  return (
    <div className="container-page pb-16">
      <PageHeader
        title="How GRANTLY meets the problem statement"
        description={`${TRACK_TITLE}. Every requirement below is implemented and live; each one links to where you can try it.`}
      />

      <Card as="section" aria-labelledby="ps-heading" className="p-5 sm:p-8">
        <h2 id="ps-heading" className="text-xl font-semibold">
          The problem statement
        </h2>
        <blockquote className="mt-3 text-pretty border-l-2 border-primary pl-4 text-[17px] leading-relaxed">
          {PROBLEM_STATEMENT}
        </blockquote>
      </Card>

      <section aria-labelledby="req-heading" className="mt-10">
        <h2 id="req-heading" className="text-2xl font-semibold">
          Requirements checklist
        </h2>
        <ol className="mt-5 space-y-4">
          {REQUIREMENTS.map((r, i) => (
            <li key={r.id}>
              <Card as="article" aria-labelledby={`req-${r.id}`} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-muted">Requirement {i + 1}</p>
                    <h3
                      id={`req-${r.id}`}
                      className="mt-0.5 flex items-center gap-2 text-xl font-semibold"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                      {r.need}
                      <span className="sr-only">: implemented.</span>
                    </h3>
                    <p className="mt-1 text-pretty text-muted">{r.answer}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.links.map((l) => (
                      <Link
                        key={l.to + l.label}
                        to={l.to}
                        className="group inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        Try {l.label}
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    ))}
                  </div>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {r.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span className="text-pretty">{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="rules-heading" className="mt-10">
        <h2 id="rules-heading" className="text-2xl font-semibold">
          Hackathon rules
        </h2>
        <Card className="mt-5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">How this build meets each hackathon rule</caption>
            <thead className="border-b border-border bg-surface-2/60">
              <tr>
                <th scope="col" className="p-4 font-semibold">
                  Rule
                </th>
                <th scope="col" className="p-4 font-semibold">
                  How it is met
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RULES.map((r) => (
                <tr key={r.rule}>
                  <th scope="row" className="p-4 align-top font-medium">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {r.rule}
                    </span>
                  </th>
                  <td className="p-4 text-muted">{r.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
