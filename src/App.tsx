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

const router = createBrowserRouter([
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
]);

export default function App() {
  return <RouterProvider router={router} />;
}
