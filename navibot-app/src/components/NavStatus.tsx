import { useNavStore } from '../store/navStore';

const STYLES: Record<string, string> = {
  idle:       'bg-gray-800/60 text-gray-500',
  navigating: 'bg-blue-950   text-blue-300',
  succeeded:  'bg-green-950  text-green-300',
  failed:     'bg-red-950    text-red-300',
  cancelled:  'bg-yellow-950 text-yellow-400',
};

export default function NavStatus() {
  const { status, cancelGoal } = useNavStore();

  const msg =
    status.type === 'idle'
      ? '— Awaiting navigation goal'
    : status.type === 'navigating'
      ? `🧭 Navigating to ${status.roomName}…${status.distance != null ? `  ${status.distance.toFixed(1)} m remaining` : ''}`
    : status.type === 'succeeded'
      ? `✓ Arrived at ${status.roomName}`
    : status.type === 'failed'
      ? `✗ Failed — ${(status as any).reason ?? status.roomName}`
    : '⊘ Navigation cancelled';

  return (
    <div className={`rounded-xl px-4 py-3 flex items-center justify-between text-sm font-medium ${STYLES[status.type]}`}>
      <span className="flex-1">{msg}</span>
      {status.type === 'navigating' && (
        <button
          onClick={cancelGoal}
          className="ml-3 shrink-0 text-xs bg-red-800 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
