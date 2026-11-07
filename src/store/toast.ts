import { create } from 'zustand';

export type ToastTone = 'default' | 'success' | 'danger';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'tone'> & { tone?: ToastTone }) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: ({ tone = 'default', ...rest }) => {
    const id = nextId++;
    set({ toasts: [...get().toasts.slice(-2), { id, tone, ...rest }] });
    window.setTimeout(() => get().dismiss(id), 4000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Fire a toast from anywhere (also outside React). */
export const toast = (t: Parameters<ToastState['push']>[0]) => useToastStore.getState().push(t);
