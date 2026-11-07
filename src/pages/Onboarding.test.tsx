import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ROUTER_FUTURE } from '@/test/router';
import OnboardingPage from './Onboarding';
import { useAppStore } from '@/store/app';

const renderPage = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <OnboardingPage />
    </MemoryRouter>,
  );

describe('<OnboardingPage />', () => {
  beforeEach(() => useAppStore.getState().resetAll());

  it('blocks an empty step, explains why, and focuses the first problem field', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /next/i }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts.map((a) => a.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/enter your name/i),
        expect.stringMatching(/choose your state/i),
      ]),
    );
    const name = screen.getByLabelText('Your name');
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription(/enter your name/i);
  });

  it('“Try demo profile” loads the sample student and reveals their matches', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /try demo profile/i }));

    expect(useAppStore.getState().isDemo).toBe(true);
    expect(useAppStore.getState().profile?.name).toBe('Ananya Rao');
    expect(screen.getByRole('heading', { name: /Ananya, we found/i })).toBeInTheDocument();
  });
});
