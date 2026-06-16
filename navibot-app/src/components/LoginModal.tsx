// Modale d'authentification admin (accès protégé par PIN)
// Vérifie le code PIN saisi via le store d'authentification
// Affiche une erreur si le PIN est incorrect

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState('');
  const { enterAdmin, loginError } = useAuthStore();

  // Soumission du formulaire : tente l'authentification, efface le champ si erreur
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enterAdmin(pin)) onClose();
    else setPin('');  // efface le PIN pour réessayer
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="text-lg font-bold text-yellow-400">Admin Access</h2>
          <p className="text-xs text-gray-500 mt-1">Enter your PIN to unlock admin features</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="• • • •"
            autoFocus
            className="w-full bg-gray-900 text-white text-center text-2xl tracking-[0.6em] rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-yellow-500"
          />
          {loginError && (
            <p className="text-red-400 text-sm text-center">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
          >
            Unlock
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
