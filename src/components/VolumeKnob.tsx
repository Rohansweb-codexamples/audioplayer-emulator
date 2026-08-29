import { useRef } from 'react';

interface Props {
  value: number;
  max: number;
  min?: number;
  label: string;
  color?: string;
  onChange: (delta: number) => void;
  onToggle?: () => void;
}

export default function VolumeKnob({ value, max, min = 0, label, color = '#ea580c', onChange, onToggle }: Props) {
  const dragging = useRef(false);
  const lastY = useRef(0);

  const range = max - min;
  const angle = -135 + ((value - min) / range) * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = lastY.current - e.clientY;
    if (Math.abs(dy) > 4) {
      onChange(dy > 0 ? 1 : -1);
      lastY.current = e.clientY;
    }
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-inner cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={onToggle}
      >
        <div
          className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-700 to-gray-900"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="absolute left-1/2 top-1 w-[2px] h-3 -translate-x-1/2 rounded-full" style={{ background: color }} />
        </div>
      </div>
      <span className="text-[9px] font-bold tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}
