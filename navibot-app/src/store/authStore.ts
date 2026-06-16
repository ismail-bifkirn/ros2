// Store d'authentification admin
// Utilise Zustand avec persistance dans localStorage
// Le PIN est défini via la variable d'environnement VITE_ADMIN_PIN (fichier .env.local)
// Par défaut: "1234" — à changer en production

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../types';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '1234';

interface S {
  role:       UserRole;     // 'user' ou 'admin'
  loginError: string;       // message d'erreur si PIN incorrect
  enterAdmin: (pin: string) => boolean;  // tente l'authentification
  exitAdmin:  ()            => void;     // retour en mode user
}

export const useAuthStore = create<S>()(
  persist(
    (set) => ({
      role:       'user',
      loginError: '',
      enterAdmin: (pin) => {
        if (pin === ADMIN_PIN) {
          set({ role: 'admin', loginError: '' });
          return true;
        }
        set({ loginError: 'Incorrect PIN' });
        return false;
      },
      exitAdmin: () => set({ role: 'user', loginError: '' }),
    }),
    // Ne persiste que le rôle, pas les messages d'erreur
    { name: 'robot-auth', partialize: (s) => ({ role: s.role }) },
  )
);
