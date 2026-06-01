import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rosBridge } from '../ros/bridge';
import type { ConnectionStatus } from '../types';

interface S {
  status:     ConnectionStatus;
  url:        string;
  connect:    (url: string) => void;
  disconnect: ()            => void;
}

export const useConnectionStore = create<S>()(
  persist(
    (set) => {
      rosBridge.onStatus((s) =>
        set({
          status: s === 'connected'    ? 'connected'
                : s === 'connecting'   ? 'connecting'
                : s === 'error'        ? 'error'
                :                        'disconnected',
        })
      );
      return {
        status:     'disconnected',
        url:        'ws://localhost:9090',
        connect:    (url) => { set({ url }); rosBridge.connect(url); },
        disconnect: ()    => { rosBridge.disconnect(); set({ status: 'disconnected' }); },
      };
    },
    { name: 'robot-connection', partialize: (s) => ({ url: s.url }) },
  )
);

// Auto-connect on app load using the persisted (or default) URL
setTimeout(() => {
  const { url, connect } = useConnectionStore.getState();
  connect(url);
}, 0);
