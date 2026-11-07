import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DemoBanner } from './DemoBanner';
import { useAppStore } from '@/store/app';
import { DEMO_PROFILE } from '@/data/demoProfile';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <DemoBanner />
    </MemoryRouter>,
  );

describe('<DemoBanner /> and demo mode', () => {
  beforeEach(() => useAppStore.getState().loadDemo());

  it('tells visitors they are exploring with a sample student', () => {
    renderAt('/dashboard');
    expect(screen.getByText(/a sample student/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /use my own details/i })).toHaveAttribute(
      'href',
      '/onboarding',
    );
  });

  it('stays out of the way on the landing page', () => {
    renderAt('/');
    expect(screen.queryByText(/a sample student/i)).not.toBeInTheDocument();
  });

  it('disappears as soon as the visitor saves their own profile', () => {
    renderAt('/dashboard');
    act(() => useAppStore.getState().setProfile({ ...DEMO_PROFILE, name: 'Riya Sen' }));
    expect(screen.queryByText(/a sample student/i)).not.toBeInTheDocument();
    expect(useAppStore.getState().isDemo).toBe(false);
  });
});
