export function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function isValidUrl(raw: string): boolean {
  if (!raw.trim()) return true; // campo opcional
  try {
    const u = new URL(normalizeUrl(raw));
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isYouTubeUrl(raw: string): boolean {
  try {
    const host = new URL(normalizeUrl(raw)).hostname.replace(/^www\.|^m\./, '');
    return host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com');
  } catch {
    return false;
  }
}

export function openExternal(raw: string): void {
  const url = normalizeUrl(raw);
  if (!url) return;
  // Em PWA instalado, _blank abre o navegador/app do YouTube sem fechar o Thaís Maromba.
  window.open(url, '_blank', 'noopener,noreferrer');
}
