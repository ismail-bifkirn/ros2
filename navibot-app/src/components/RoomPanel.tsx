// Panneau de sélection de salle pour la navigation autonome
// Affiche les salles sous forme de grille de boutons
// Envoie un objectif NavigateToPose au robot lors du clic

import { useRoomsStore } from '../store/roomsStore';
import { useNavStore }   from '../store/navStore';

export default function RoomPanel() {
  const rooms = useRoomsStore((s) => s.rooms);
  const { sendGoal, status } = useNavStore();
  const busy = status.type === 'navigating';  // désactive les boutons pendant la navigation

  if (rooms.length === 0) {
    return (
      <div className="py-8 text-center text-gray-600 text-sm">
        No rooms defined yet. Ask an admin to add rooms.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Go To Room</h3>
      <div className="grid grid-cols-2 gap-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => sendGoal(room.name, room.x, room.y, room.yaw)}
            disabled={busy}
            className={`p-3 rounded-xl text-left transition-all ${
              busy
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 active:scale-95 text-white'
            }`}
          >
            <div className="text-2xl mb-1">{room.icon ?? '📍'}</div>
            <div className="text-sm font-medium leading-tight">{room.name}</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">
              {room.x.toFixed(1)}, {room.y.toFixed(1)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
