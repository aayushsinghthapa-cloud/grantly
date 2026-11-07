# Grantly

**One profile. Every scholarship, explained.**

Grantly is a scholarship co-pilot built for _THE OUTPOST_ (Frontend Arena) hackathon. A student fills in **one eligibility profile**, and the whole app personalises to it: what they qualify for, why they match, how to apply, which documents they still need, and how much of their annual cost is covered.

> 🔗 **Live demo:** _coming soon_ · 📦 **Repo:** _coming soon_

## The problem

Students struggle to **find** relevant scholarships, **understand** their options, **navigate** application processes, and **keep track** of deadlines and documents.

## How Grantly solves it

| Pain point    | Feature                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| Finding       | Smart Discover — fuzzy search, filters and a per-scholarship **Match Score** |
| Understanding | **Why you match** breakdown, side-by-side **Compare**, glossary tooltips     |
| Navigating    | **Application Roadmap** + **Document Readiness** from your Document Vault    |
| Tracking      | **Tracker** board + **Deadline Radar**                                       |
| ✨ Signature  | **Funding Gap Meter** — how much of your annual cost your scholarships cover |

_(Sections on features, architecture and screenshots are filled in as the build progresses.)_

## Tech stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS · React Router v6 · Zustand (persisted to localStorage) · Framer Motion · lucide-react · date-fns · Fuse.js · @dnd-kit · Vitest · ESLint + Prettier

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
npm test
```

## Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `index.html` so client-side routes work on refresh.

---

All scholarship data is fictional. No backend — your data stays in your browser.
