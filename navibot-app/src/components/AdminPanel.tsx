import { useState } from 'react';
import { useRoomsStore } from '../store/roomsStore';
import { getRobotPose }  from '../ros/navigation';
import type { Room } from '../types';

type Draft = Omit<Room, 'id'> & { id?: string };
const blank = (): Draft => ({ name: '', x: 0, y: 0, yaw: 0, icon: '📍' });

export default function AdminPanel() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useRoomsStore();
  const [draft,    setDraft]    = useState<Draft | null>(null);
  const [fetching, setFetching] = useState(false);
  const [poseErr,  setPoseErr]  = useState('');

  const save = () => {
    if (!draft?.name.trim()) return;
    if (draft.id) {
      const { id, ...updates } = draft;
      updateRoom(id, updates);
    } else {
      addRoom(draft);
    }
    setDraft(null);
  };

  const useCurrent = async () => {
    setPoseErr('');
    setFetching(true);
    const pose = await getRobotPose();
    setFetching(false);
    if (pose && draft) {
      setDraft({ ...draft, x: +pose.x.toFixed(3), y: +pose.y.toFixed(3), yaw: +pose.yaw.toFixed(3) });
    } else {
      setPoseErr('Could not get pose — is ROSBridge connected and Nav2 running?');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-yellow-500 uppercase tracking-widest">Room Database</h3>

      {/* Room list */}
      {rooms.length === 0 && (
        <p className="text-gray-600 text-sm py-4 text-center">No rooms yet.</p>
      )}
      {rooms.map((r) => (
        <div key={r.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl shrink-0">{r.icon ?? '📍'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{r.name}</div>
            <div className="text-xs text-gray-500 font-mono">
              x={r.x.toFixed(2)}  y={r.y.toFixed(2)}  yaw={r.yaw.toFixed(2)}
            </div>
          </div>
          <button onClick={() => { setDraft({ ...r }); setPoseErr(''); }}
            className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 shrink-0">Edit</button>
          <button onClick={() => deleteRoom(r.id)}
            className="text-red-500 hover:text-red-400 text-xs px-2 py-1 shrink-0">Del</button>
        </div>
      ))}

      {/* Add button */}
      {!draft && (
        <button
          onClick={() => { setDraft(blank()); setPoseErr(''); }}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          + Add Room
        </button>
      )}

      {/* Edit / Add form */}
      {draft && (
        <div className="bg-gray-800 rounded-xl p-4 space-y-3 border border-yellow-900/60">
          <h4 className="text-sm font-semibold text-yellow-400">{draft.id ? 'Edit Room' : 'New Room'}</h4>

          <div>
            <label className="text-xs text-gray-500">Name</label>
            <input
              type="text" value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. ICU Hall"
              className="mt-1 w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-yellow-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'yaw'] as const).map((k) => (
              <div key={k}>
                <label className="text-xs text-gray-500">
                  {k === 'x' ? 'X (m)' : k === 'y' ? 'Y (m)' : 'Yaw (rad)'}
                </label>
                <input
                  type="number" step="0.01" value={(draft as any)[k]}
                  onChange={(e) => setDraft({ ...draft, [k]: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full bg-gray-900 text-white rounded-lg px-2 py-2 text-sm font-mono border border-gray-700 focus:outline-none focus:border-yellow-600"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-500">Icon (emoji)</label>
            <input
              type="text" value={draft.icon ?? ''}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              placeholder="🏥"
              className="mt-1 w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-yellow-600"
            />
          </div>

          <button
            onClick={useCurrent}
            disabled={fetching}
            className="w-full py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 text-sm disabled:opacity-50 transition-colors"
          >
            {fetching ? '⏳ Fetching robot pose…' : '📡 Use Current Robot Position'}
          </button>
          {poseErr && <p className="text-red-400 text-xs">{poseErr}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={save}
              className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-white text-sm font-semibold">Save</button>
            <button onClick={() => setDraft(null)}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
