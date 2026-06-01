import { useState } from 'react';
import { useConnectionStore } from '../store/connectionStore';

const DOT: Record<string, string> = {
  connected:    'bg-green-400',
  connecting:   'bg-yellow-400 animate-pulse',
  disconnected: 'bg-gray-500',
  error:        'bg-red-500 animate-pulse',
};

const LABEL: Record<string, string> = {
  connected:    'Connected',
  connecting:   'Connecting…',
  disconnected: 'Disconnected',
  error:        'Connection error',
};

export default function ConnectionBar() {
  const { status, url, connect, disconnect } = useConnectionStore();
  const [editUrl, setEditUrl] = useState(url);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-2 text-sm">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT[status]}`} />
        <span className="text-gray-400 flex-1 truncate">
          {LABEL[status]}{' '}
          <span className="text-gray-600 font-mono text-xs">{url}</span>
        </span>
        {status === 'connected'
          ? <button onClick={disconnect}         className="text-red-400  hover:text-red-300  text-xs shrink-0">Disconnect</button>
          : <button onClick={() => setOpen(true)} className="text-blue-400 hover:text-blue-300 text-xs shrink-0">Configure</button>
        }
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-base font-bold text-white">ROSBridge WebSocket URL</h2>
            <input
              type="text" value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (connect(editUrl), setOpen(false))}
              className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 font-mono text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="ws://192.168.1.100:9090"
            />
            <p className="text-xs text-gray-500">
              Replace with your robot's IP. Default port is 9090.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { connect(editUrl); setOpen(false); }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white"
              >
                Connect
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
