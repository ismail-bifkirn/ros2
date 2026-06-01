import { create } from 'zustand';
import type { NavStatusType } from '../types';
import { navigateToPose, cancelNavigation } from '../ros/navigation';

interface S {
  status:       NavStatusType;
  activeGoalId: string | null;
  sendGoal:     (roomName: string, x: number, y: number, yaw: number) => void;
  cancelGoal:   () => void;
}

export const useNavStore = create<S>((set, get) => ({
  status:       { type: 'idle' },
  activeGoalId: null as string | null,

  sendGoal: (roomName, x, y, yaw) => {
    get().cancelGoal();
    set({ status: { type: 'navigating', roomName } });

    const goalId = navigateToPose(
      x, y, yaw,
      ({ distance_remaining }) =>
        set((s) =>
          s.status.type === 'navigating'
            ? { status: { type: 'navigating', roomName, distance: distance_remaining } }
            : s
        ),
      ({ succeeded }) => {
        set({
          activeGoalId: null,
          status: succeeded
            ? { type: 'succeeded', roomName }
            : { type: 'failed',    roomName, reason: 'Navigation aborted by Nav2' },
        });
        if (succeeded) setTimeout(() => set({ status: { type: 'idle' } }), 3000);
      },
    );

    set({ activeGoalId: goalId });
  },

  cancelGoal: () => {
    const { activeGoalId } = get();
    if (activeGoalId) {
      cancelNavigation(activeGoalId);
      set({ activeGoalId: null, status: { type: 'cancelled' } });
      setTimeout(() => set({ status: { type: 'idle' } }), 2000);
    }
  },
}));
