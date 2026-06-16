// Joystick tactile pour le contrôle manuel du robot
// Convertit la position du doigt en commandes de vitesse (linéaire/angulaire)
// Publie à 20 Hz sur /cmd_vel via un timer setInterval

import { useRef, useCallback, useEffect, useState } from 'react';
import { publishCmdVel, stopRobot } from '../ros/cmdVel';
import { useNavStore } from '../store/navStore';

// Constantes de dimensionnement et de comportement
const R  = 80;    // rayon extérieur du joystick en pixels
const KR = 26;    // rayon du bouton (knob) en pixels
const HZ = 50;    // intervalle de publication : 20 Hz (50 ms)
const DZ = 0.07;  // zone morte : fraction du rayon où les petites valeurs sont ignorées

interface Props {
  linearMax:  number;  // vitesse linéaire max en m/s
  angularMax: number;  // vitesse angulaire max en rad/s
}

export default function Joystick({ linearMax, angularMax }: Props) {
  const ref        = useRef<HTMLDivElement>(null);
  const knob       = useRef({ nx: 0, ny: 0 });          // valeurs normalisées [-1, 1]
  const activePtr  = useRef<number | null>(null);        // ID du pointeur actif
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });       // position visuelle du knob

  const { cancelGoal, status } = useNavStore();

  // Calcule le centre du joystick dans les coordonnées de la fenêtre
  const center = () => {
    const r = ref.current?.getBoundingClientRect();
    return r ? { cx: r.left + r.width / 2, cy: r.top + r.height / 2 } : { cx: 0, cy: 0 };
  };

  // Démarre la publication périodique des commandes de vitesse
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const { nx, ny } = knob.current;
      // Y écran vers le haut = avant du robot (Y négatif → linéaire positif)
      publishCmdVel(-ny * linearMax, -nx * angularMax);
    }, HZ);
  }, [linearMax, angularMax]);

  // Relâchement : arrête le robot et réinitialise
  const release = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopRobot();
    knob.current = { nx: 0, ny: 0 };
    setPos({ x: 0, y: 0 });
    activePtr.current = null;
  }, []);

  // Début du toucher : capture le pointeur, interrompt la navigation auto si active
  const onDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePtr.current = e.pointerId;
    if (status.type === 'navigating') cancelGoal();
    startTimer();
  }, [startTimer, cancelGoal, status.type]);

  // Mouvement : met à jour la position normalisée et visuelle
  const onMove = useCallback((e: React.PointerEvent) => {
    if (activePtr.current !== e.pointerId) return;
    const { cx, cy } = center();
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const scale = dist > R ? R / dist : 1;  // limite au cercle extérieur
    let nx = (dx * scale) / R;
    let ny = (dy * scale) / R;
    if (Math.abs(nx) < DZ) nx = 0;  // zone morte
    if (Math.abs(ny) < DZ) ny = 0;
    knob.current = { nx, ny };
    setPos({ x: nx * R, y: ny * R });
  }, []);

  // Redémarre le timer si les limites de vitesse changent pendant le glissement
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      startTimer();
    }
  }, [linearMax, angularMax, startTimer]);

  // Nettoie le timer au démontage
  useEffect(() => () => release(), [release]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Zone circulaire du joystick */}
      <div
        ref={ref}
        className="relative rounded-full bg-gray-800 border-2 border-gray-700 touch-none cursor-grab active:cursor-grabbing"
        style={{ width: R * 2, height: R * 2 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={release}
        onPointerCancel={release}
      >
        {/* Croix de visée (milieu) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="absolute w-full h-px bg-gray-400" />
          <div className="absolute h-full w-px bg-gray-400" />
        </div>
        {/* Bouton du joystick */}
        <div
          className="absolute rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 transition-[box-shadow]"
          style={{
            width:  KR * 2,
            height: KR * 2,
            left:   R - KR + pos.x,
            top:    R - KR + pos.y,
          }}
        />
      </div>
      {/* Indication des limites de vitesse */}
      <p className="text-xs text-gray-600 font-mono">
        max {linearMax.toFixed(2)} m/s · {angularMax.toFixed(2)} rad/s
      </p>
    </div>
  );
}
