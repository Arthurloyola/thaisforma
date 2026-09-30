import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  label: string;
}

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, format = String, label }: Props) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" className="icon-btn" onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`Diminuir ${label}`}>
        <Minus />
      </button>
      <output className="stepper__value" aria-live="polite">{format(value)}</output>
      <button type="button" className="icon-btn" onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`Aumentar ${label}`}>
        <Plus />
      </button>
    </div>
  );
}
