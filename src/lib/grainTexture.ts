import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/** Простая процедурная текстура дерева: вертикальные волокна поверх базового цвета */
export function createGrainTexture(hex: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const g = canvas.getContext("2d")!;
  g.fillStyle = hex;
  g.fillRect(0, 0, canvas.width, canvas.height);

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 280; i++) {
    const x = rnd() * canvas.width;
    const alpha = 0.03 + rnd() * 0.1;
    g.strokeStyle = rnd() > 0.45 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha * 0.7})`;
    g.lineWidth = 0.6 + rnd() * 2.4;
    const phase = rnd() * 6;
    const amp = 1 + rnd() * 5;
    g.beginPath();
    for (let y = 0; y <= canvas.height; y += 16) {
      const px = x + Math.sin(y / 90 + phase) * amp;
      if (y === 0) g.moveTo(px, y);
      else g.lineTo(px, y);
    }
    g.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  // текстура покрывает 0.5 x 1 м
  texture.repeat.set(2, 1);
  texture.anisotropy = 8;
  return texture;
}
