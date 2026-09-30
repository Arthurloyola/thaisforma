export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  tone?: 'light' | 'dark';
}

export function ProgressRing({ value, size = 88, stroke = 8, children, tone = 'light' }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={`ring ring--${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__label">{children}</div>
    </div>
  );
}
