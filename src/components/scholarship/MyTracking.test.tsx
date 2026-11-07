import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MyTracking } from './MyTracking';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useAppStore } from '@/store/app';
import { getScholarship } from '@/data/scholarships';
import { ROUTER_FUTURE } from '@/test/router';

const scholarship = getScholarship('future-engineers-merit')!; // closes in 4 days (relative to today)

const renderBoth = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <NotificationBell />
      <MyTracking scholarship={scholarship} />
    </MemoryRouter>,
  );

describe('Reminders, notification centre and notes', () => {
  beforeEach(() => useAppStore.getState().resetAll());

  it('setting a reminder adds it to the notification bell', async () => {
    const user = userEvent.setup();
    renderBoth();
    expect(screen.getByRole('button', { name: 'Notifications, none new' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Remind me'), '7');
    expect(useAppStore.getState().reminders[scholarship.id]).toBe(7);

    const bell = screen.getByRole('button', { name: 'Notifications, 1 new' });
    await user.click(bell);
    const panel = screen.getByRole('dialog', { name: 'Notifications' });
    expect(
      within(panel).getByRole('link', { name: /Reminder: Future Engineers Merit Award/ }),
    ).toHaveAttribute('href', `/scholarship/${scholarship.id}`);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();
    expect(bell).toHaveFocus();
  });

  it('a reminder outside its window stays quiet', async () => {
    const user = userEvent.setup();
    renderBoth();
    await user.selectOptions(screen.getByLabelText('Remind me'), '1');
    expect(screen.getByRole('button', { name: 'Notifications, none new' })).toBeInTheDocument();
  });

  it('notes save as you type and clear when emptied', async () => {
    const user = userEvent.setup();
    renderBoth();
    const notes = screen.getByLabelText('My notes');
    await user.type(notes, 'Ask Prof. Iyer for the letter');
    expect(useAppStore.getState().notes[scholarship.id]).toBe('Ask Prof. Iyer for the letter');
    await user.clear(notes);
    expect(useAppStore.getState().notes[scholarship.id]).toBeUndefined();
  });
});
