import { useRef, useCallback, useEffect, useState } from 'react';
import { publishCmdVel, stopRobot } from '../ros/cmdVel';
import { useNavStore } from '../store/navStore';

const R  = 80;    // outer radius px
const KR = 26;    // knob  radius px
const HZ = 50;    // publish interval ms  (20 Hz)
const DZ = 0.07;  // dead-zone fraction

interface Props {
  linearMax:  number;
  angularMax: number;
}

export default function Joystick({ linearMax, angularMax }: Props) {
  const ref        = useRef<HTMLDivElement>(null);
  const knob       = useRef({ nx: 0, ny: 0 });
  const activePtr  = useRef<number | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const { cancelGoal, status } = useNavStore();

  const center = () => {
    const r = ref.current?.getBoundingClientRect();
    return r ? { cx: r.left + r.width / 2, cy: r.top + r.height / 2 } : { cx: 0, cy: 0 };
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const { nx, ny } = knob.current;
      // screen-Y up = forward (negative screen-Y → positive linear)
      publishCmdVel(-ny * linearMax, -nx * angularMax);
    }, HZ);
  }, [linearMax, angularMax]);

  const release = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopRobot();
    knob.current = { nx: 0, ny: 0 };
    setPos({ x: 0, y: 0 });
    activePtr.current = null;
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePtr.current = e.pointerId;
    if (status.type === 'navigating') cancelGoal(); // interrupt autonomous nav
    startTimer();
  }, [startTimer, cancelGoal, status.type]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (activePtr.current !== e.pointerId) return;
    const { cx, cy } = center();
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const scale = dist > R ? R / dist : 1;
    let nx = (dx * scale) / R;
    let ny = (dy * scale) / R;
    if (Math.abs(nx) < DZ) nx = 0;
    if (Math.abs(ny) < DZ) ny = 0;
    knob.current = { nx, ny };
    setPos({ x: nx * R, y: ny * R });
  }, []);

  // Restart timer when speed limits change mid-drag so new limits take effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      startTimer();
    }
  }, [linearMax, angularMax, startTimer]);

  useEffect(() => () => release(), [release]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div
        ref={ref}
        className="relative rounded-full bg-gray-800 border-2 border-gray-700 touch-none cursor-grab active:cursor-grabbing"
        style={{ width: R * 2, height: R * 2 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={release}
        onPointerCancel={release}
      >
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="absolute w-full h-px bg-gray-400" />
          <div className="absolute h-full w-px bg-gray-400" />
        </div>
        {/* Knob */}
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
      <p className="text-xs text-gray-600 font-mono">
        max {linearMax.toFixed(2)} m/s · {angularMax.toFixed(2)} rad/s
      </p>
    </div>
  );
}
