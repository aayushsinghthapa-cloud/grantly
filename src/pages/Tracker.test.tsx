import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ROUTER_FUTURE } from '@/test/router';
import TrackerPage from './Tracker';
import { useAppStore } from '@/store/app';

describe('<TrackerPage /> keyboard / menu alternative to drag-and-drop', () => {
  beforeEach(() => useAppStore.getState().loadDemo());

  it('moves a card to another column from its “Move” menu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter future={ROUTER_FUTURE}>
        <TrackerPage />
      </MemoryRouter>,
    );
    expect(useAppStore.getState().tracker['jigyasa-summer-research'].status).toBe('saved');

    await user.click(screen.getByRole('button', { name: 'Move Jigyasa Summer Research Grant' }));
    const menu = screen.getByRole('menu', { name: 'Move Jigyasa Summer Research Grant' });
    await user.click(within(menu).getByRole('menuitem', { name: 'Move to Submitted' }));

    expect(useAppStore.getState().tracker['jigyasa-summer-research'].status).toBe('submitted');
    const submitted = screen.getByRole('list', { name: 'Submitted' });
    expect(within(submitted).getByText('Jigyasa Summer Research Grant')).toBeInTheDocument();
    // The page restores focus to the moved card's menu on the next frame; let that finish here.
    await new Promise((r) => requestAnimationFrame(r));
    expect(
      screen.getByRole('button', { name: 'Move Jigyasa Summer Research Grant' }),
    ).toHaveFocus();
  });

  it('opens the menu from the keyboard and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter future={ROUTER_FUTURE}>
        <TrackerPage />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole('button', { name: 'Move Shakti Women in STEM Fellowship' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
