interface Props {
  size?: 'sm' | 'lg';
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="84 130 344 262" aria-hidden="true">
      <rect x="84" y="158" width="24" height="64" rx="12" fill="var(--rose)" />
      <rect x="104" y="136" width="40" height="108" rx="18" fill="var(--rose)" />
      <rect x="404" y="158" width="24" height="64" rx="12" fill="var(--rose)" />
      <rect x="368" y="136" width="40" height="108" rx="18" fill="var(--rose)" />
      <rect x="136" y="175" width="240" height="30" rx="15" fill="currentColor" />
      <rect x="239" y="190" width="34" height="196" rx="17" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ size = 'sm' }: Props) {
  return (
    <span className={`wordmark wordmark--${size}`}>
      <LogoMark className="wordmark__mark" />
      <span className="wordmark__text">Thaís Maromba</span>
    </span>
  );
}
