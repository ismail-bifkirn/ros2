import type { SpeedLimits } from '../types';

interface Props extends SpeedLimits {
  onChange: (linear: number, angular: number) => void;
}

export default function SpeedControl({ linear, angular, onChange }: Props) {
  const sliders = [
    { label: 'Linear',  value: linear,  min: 0.05, max: 1.0, step: 0.05, color: 'accent-blue-500',   unit: 'm/s',   onCh: (v: number) => onChange(v, angular) },
    { label: 'Angular', value: angular, min: 0.1,  max: 2.0, step: 0.1,  color: 'accent-purple-500', unit: 'rad/s', onCh: (v: number) => onChange(linear, v)  },
  ];

  return (
    <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Speed Limits</h3>
      {sliders.map(({ label, value, min, max, step, color, unit, onCh }) => (
        <div key={label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className={`font-mono text-gray-300`}>{value.toFixed(2)} {unit}</span>
          </div>
          <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={(e) => onCh(parseFloat(e.target.value))}
            className={`w-full h-2 rounded-full appearance-none bg-gray-700 ${color}`}
          />
        </div>
      ))}
    </div>
  );
}
