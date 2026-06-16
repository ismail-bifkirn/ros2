// Store de connexion WebSocket au robot
// Gère l'URL, le statut, et la reconnexion automatique
// Persiste l'URL dans localStorage

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rosBridge } from '../ros/bridge';
import type { ConnectionStatus } from '../types';

interface S {
  status:     ConnectionStatus;  // état visuel (point vert/rouge)
  url:        string;            // URL WebSocket du rosbridge
  errorMsg:   string;            // dernier message d'erreur
  connect:    (url: string) => void;
  disconnect: ()            => void;
}

export const useConnectionStore = create<S>()(
  persist(
    (set) => {
      // S'abonne aux changements d'état du pont ROS
      rosBridge.onStatus((s) =>
        set({
          status: s === 'connected'    ? 'connected'
                : s === 'connecting'   ? 'connecting'
                : s === 'error'        ? 'error'
                :                        'disconnected',
          errorMsg: s === 'error' ? rosBridge.lastError : '',
        })
      );
      return {
        status:     'disconnected',
        url:        'ws://localhost:9090', // URL par défaut (rosbridge en local)
        errorMsg:   '',
        connect:    (url) => { set({ url, errorMsg: '' }); rosBridge.connect(url); },
        disconnect: ()    => { rosBridge.disconnect(); set({ status: 'disconnected', errorMsg: '' }); },
      };
    },
    // Ne persiste que l'URL (pas le statut éphémère)
    { name: 'robot-connection', partialize: (s) => ({ url: s.url }) },
  )
);

// Auto-connexion au chargement de l'application
setTimeout(() => {
  const { url, connect } = useConnectionStore.getState();
  connect(url);
}, 0);
