const MAX_SIDE = 1400;
const QUALITY = 0.85;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagem não pôde ser lida'));
    };
    img.src = url;
  });
}

/**
 * Redimensiona e comprime a foto da galeria antes de guardar.
 * Fotos de celular têm 3–8 MB; aqui ficam com ~150–400 KB, sem perda visível no app.
 * A orientação EXIF é respeitada pelo navegador ao desenhar a <img>.
 */
export async function prepareImage(file: Blob): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.fillStyle = '#ffffff'; // PNG transparente não vira fundo preto no JPEG
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob) return file;
  return blob.size < file.size ? blob : file;
}
