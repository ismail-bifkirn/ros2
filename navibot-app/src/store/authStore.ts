import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../types';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '1234';

interface S {
  role:       UserRole;
  loginError: string;
  enterAdmin: (pin: string) => boolean;
  exitAdmin:  ()            => void;
}

export const useAuthStore = create<S>()(
  persist(
    (set) => ({
      role:       'user',
      loginError: '',
      enterAdmin: (pin) => {
        if (pin === ADMIN_PIN) { set({ role: 'admin', loginError: '' }); return true; }
        set({ loginError: 'Incorrect PIN' });
        return false;
      },
      exitAdmin: () => set({ role: 'user', loginError: '' }),
    }),
    { name: 'robot-auth', partialize: (s) => ({ role: s.role }) },
  )
);
