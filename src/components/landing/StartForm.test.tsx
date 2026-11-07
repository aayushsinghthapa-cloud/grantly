import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { StartForm } from './StartForm';

function OnboardingProbe() {
  const state = useLocation().state as { prefill?: { level: string; percentage: string } };
  return <p>Prefill: {JSON.stringify(state?.prefill)}</p>;
}

const renderForm = () =>
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<StartForm />} />
        <Route path="/onboarding" element={<OnboardingProbe />} />
      </Routes>
    </MemoryRouter>,
  );

describe('<StartForm /> (landing close)', () => {
  it('shows a live, computed count once a level is chosen', async () => {
    const user = userEvent.setup();
    renderForm();
    expect(screen.getByText(/two answers/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('What are you studying?'), 'Undergraduate');
    await user.type(screen.getByLabelText('Latest marks (%)'), '86');

    expect(screen.getByText(/take Undergraduate students with 86%/)).toBeInTheDocument();
  });

  it('carries both answers into onboarding', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.selectOptions(screen.getByLabelText('What are you studying?'), 'Postgraduate');
    await user.type(screen.getByLabelText('Latest marks (%)'), '72');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      screen.getByText('Prefill: {"level":"Postgraduate","percentage":"72"}'),
    ).toBeInTheDocument();
  });
});
