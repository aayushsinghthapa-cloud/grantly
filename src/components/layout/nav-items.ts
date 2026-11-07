import {
  Compass,
  FolderLock,
  KanbanSquare,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/tracker', label: 'Tracker', icon: KanbanSquare },
  { to: '/vault', label: 'Vault', icon: FolderLock },
  { to: '/profile', label: 'Profile', icon: UserRound },
];
