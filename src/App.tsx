import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

// Route-level code splitting: each page is its own chunk, loaded behind the shell's Suspense skeleton.
const Landing = lazy(() => import('@/pages/Landing'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Discover = lazy(() => import('@/pages/Discover'));
const Scholarship = lazy(() => import('@/pages/Scholarship'));
const Compare = lazy(() => import('@/pages/Compare'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Tracker = lazy(() => import('@/pages/Tracker'));
const Vault = lazy(() => import('@/pages/Vault'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      children: [
        { path: '/', element: <Landing /> },
        { path: '/onboarding', element: <Onboarding /> },
        { path: '/discover', element: <Discover /> },
        { path: '/scholarship/:id', element: <Scholarship /> },
        { path: '/compare', element: <Compare /> },
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/tracker', element: <Tracker /> },
        { path: '/vault', element: <Vault /> },
        { path: '/profile', element: <Profile /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  // Matches Vite's `base`, so routes work under /grantly/ on GitHub Pages and at / elsewhere.
  {
    basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
    // Opt in to React Router v7 behaviour now, so the upgrade is a no-op.
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
