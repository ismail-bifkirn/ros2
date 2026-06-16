// Store des salles (destinations de navigation)
// CRUD complet + import/export JSON
// Persiste automatiquement dans localStorage

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../types';

interface S {
  rooms:      Room[];                                          // liste des salles
  addRoom:    (r: Omit<Room, 'id'>)          => void;          // ajouter une salle
  updateRoom: (id: string, u: Partial<Room>) => void;          // modifier une salle
  deleteRoom: (id: string)                   => void;          // supprimer une salle
  setRoomsFromJSON: (r: Room[])          => void;              // remplacer toutes les salles (import)
}

export const useRoomsStore = create<S>()(
  persist(
    (set) => ({
      // Salles par défaut (hôpital)
      rooms: [
        { id: '1', name: 'Reception', x:  5.0, y:  3.0, yaw:  0,     icon: '🏥' },
        { id: '2', name: 'Room 101',  x: 10.0, y:  8.0, yaw:  1.57,  icon: '🚪' },
        { id: '3', name: 'Pharmacy',  x: 15.0, y:  2.5, yaw:  3.14,  icon: '💊' },
        { id: '4', name: 'Lab',       x:  8.0, y: 12.0, yaw: -1.57,  icon: '🔬' },
      ],
      // Génère un UUID v4 pour chaque nouvelle salle
      addRoom:    (r)      => set((s) => ({ rooms: [...s.rooms, { ...r, id: self.crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) }] })),
      // Met à jour partiellement une salle (fusion)
      updateRoom: (id, u)  => set((s) => ({ rooms: s.rooms.map(r => r.id === id ? { ...r, ...u } : r) })),
      deleteRoom: (id)     => set((s) => ({ rooms: s.rooms.filter(r => r.id !== id) })),
      // Remplacement complet (utilisé par l'import JSON)
      setRoomsFromJSON: (r: Room[]) => set({ rooms: r }),
    }),
    { name: 'robot-rooms' }, // clé localStorage
  )
);
