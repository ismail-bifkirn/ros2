// Store de navigation autonome
// Envoie des objectifs au robot via l'action ROS NavigateToPose
// et suit le statut (en cours, réussi, échoué, annulé)

import { create } from 'zustand';
import type { NavStatusType } from '../types';
import { navigateToPose, cancelNavigation } from '../ros/navigation';

interface S {
  status:       NavStatusType;   // état actuel de la navigation
  activeGoalId: string | null;   // ID de l'objectif ROS actif (pour annulation)
  sendGoal:     (roomName: string, x: number, y: number, yaw: number) => void;
  cancelGoal:   () => void;
}

export const useNavStore = create<S>((set, get) => ({
  status:       { type: 'idle' },
  activeGoalId: null as string | null,

  // Envoie un objectif de navigation à une salle
  sendGoal: (roomName, x, y, yaw) => {
    get().cancelGoal(); // annule tout objectif en cours avant d'en envoyer un nouveau
    set({ status: { type: 'navigating', roomName } });

    const goalId = navigateToPose(
      x, y, yaw,
      // Callback feedback : met à jour la distance restante
      ({ distance_remaining }) =>
        set((s) =>
          s.status.type === 'navigating'
            ? { status: { type: 'navigating', roomName, distance: distance_remaining } }
            : s
        ),
      // Callback résultat : succès ou échec
      ({ succeeded }) => {
        set({
          activeGoalId: null,
          status: succeeded
            ? { type: 'succeeded', roomName }
            : { type: 'failed',    roomName, reason: 'Navigation aborted by Nav2' },
        });
        // Retour automatique à l'état idle après 3s
        if (succeeded) setTimeout(() => set({ status: { type: 'idle' } }), 3000);
      },
    );

    set({ activeGoalId: goalId });
  },

  // Annule l'objectif en cours
  cancelGoal: () => {
    const { activeGoalId } = get();
    if (activeGoalId) {
      cancelNavigation(activeGoalId);
      set({ activeGoalId: null, status: { type: 'cancelled' } });
      setTimeout(() => set({ status: { type: 'idle' } }), 2000);
    }
  },
}));
