import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { RouteError } from './RouteError';

function renderWith(thrown: Error) {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Boom = () => {
    throw thrown;
  };
  const router = createMemoryRouter([
    { path: '/', element: <Boom />, errorElement: <RouteError /> },
  ]);
  render(<RouterProvider router={router} />);
}

describe('<RouteError />', () => {
  it('explains a stale deploy (failed chunk load) and offers a reload', () => {
    renderWith(
      new TypeError('Failed to fetch dynamically imported module: /assets/Tracker-abc.js'),
    );
    expect(screen.getByRole('heading', { name: /just updated/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('never leaves a blank screen for other errors', () => {
    renderWith(new Error('kaboom'));
    expect(screen.getByRole('heading', { name: /hit a problem/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});
