import { useState } from 'react';
import ConnectionBar from './components/ConnectionBar';
import Joystick      from './components/Joystick';
import SpeedControl  from './components/SpeedControl';
import RoomPanel     from './components/RoomPanel';
import NavStatus     from './components/NavStatus';
import AdminPanel    from './components/AdminPanel';
import LoginModal    from './components/LoginModal';
import { useAuthStore } from './store/authStore';
import type { SpeedLimits } from './types';

type Tab = 'drive' | 'navigate' | 'admin';

export default function App() {
  const { role, exitAdmin } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [tab,   setTab]   = useState<Tab>('drive');
  const [speed, setSpeed] = useState<SpeedLimits>({ linear: 0.26, angular: 1.0 });

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: 'drive',    label: '🕹️  Drive'    },
    { id: 'navigate', label: '🧭  Navigate' },
    { id: 'admin',    label: '⚙️  Admin', adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <ConnectionBar />

      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight">NaviBot Control</span>
          {role === 'admin' && (
            <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>
          )}
        </div>
        {role === 'user' ? (
          <button
            onClick={() => setShowLogin(true)}
            className="text-xs text-gray-500 hover:text-yellow-400 px-3 py-1 border border-gray-700 rounded-lg transition-colors"
          >
            Admin
          </button>
        ) : (
          <button
            onClick={exitAdmin}
            className="text-xs text-gray-500 hover:text-white px-3 py-1 border border-gray-700 rounded-lg transition-colors"
          >
            Exit Admin
          </button>
        )}
      </header>

      {/* Tab bar */}
      <div className="flex border-b border-gray-800 shrink-0">
        {tabs
          .filter((t) => !t.adminOnly || role === 'admin')
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'text-blue-400 border-b-2 border-blue-400 -mb-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 max-w-lg mx-auto w-full">
        <NavStatus />

        {tab === 'drive' && (
          <>
            <div className="bg-gray-900 rounded-2xl p-5 flex flex-col items-center gap-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest self-start">
                Manual Control
              </span>
              <Joystick linearMax={speed.linear} angularMax={speed.angular} />
            </div>
            <SpeedControl
              linear={speed.linear}
              angular={speed.angular}
              onChange={(l, a) => setSpeed({ linear: l, angular: a })}
            />
          </>
        )}

        {tab === 'navigate' && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <RoomPanel />
          </div>
        )}

        {tab === 'admin' && role === 'admin' && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <AdminPanel />
          </div>
        )}
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
