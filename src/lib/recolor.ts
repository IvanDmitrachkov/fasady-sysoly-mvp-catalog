/**
 * Перекраска областей фото с сохранением света и теней.
 * Для каждой области считаем яркость пикселя относительно средней яркости области
 * и умножаем на целевой цвет в линейном пространстве. Стыки, блики и тени остаются из фото.
 */

const TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const v = i / 255;
  TO_LINEAR[i] = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

const LUT_SIZE = 4096;
const TO_SRGB = new Uint8ClampedArray(LUT_SIZE + 1);
for (let i = 0; i <= LUT_SIZE; i++) {
  const x = i / LUT_SIZE;
  TO_SRGB[i] = Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
}

const encode = (x: number) => TO_SRGB[Math.min(LUT_SIZE, Math.max(0, Math.round(x * LUT_SIZE)))];

/** Мягкое ограничение светов: плавно подходим к белому, а не обрезаем */
function knee(x: number): number {
  if (x <= 0.8) return x;
  return 0.8 + 0.2 * (1 - Math.exp(-(x - 0.8) / 0.2));
}

/** Зоны: 0 фасады, 1 столешница, 2 фартук, 3 акцент. Веса лежат подряд по 4 на пиксель */
export const REGIONS = 4;

export type Prepared = {
  width: number;
  height: number;
  base: Uint8ClampedArray;
  weights: Uint8ClampedArray;
  luminance: Float32Array;
  reference: number[];
};

export type Target = {
  /** линейные компоненты целевого цвета */
  linear: [number, number, number];
  /** < 1 смягчает контраст исходной области (для тёмного камня, который красим в светлый) */
  contrast: number;
  grain: boolean;
};

export function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [TO_LINEAR[(n >> 16) & 255], TO_LINEAR[(n >> 8) & 255], TO_LINEAR[n & 255]];
}

/** masks — RGB: фасады, столешница, фартук; accent — R: акцентные зоны (необязательно) */
export function prepare(base: ImageData, masks: ImageData, accent?: ImageData): Prepared {
  const { width, height } = base;
  const n = width * height;
  const luminance = new Float32Array(n);
  const weights = new Uint8ClampedArray(n * REGIONS);
  const sum = new Array(REGIONS).fill(0);
  const weight = new Array(REGIONS).fill(0);

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const y =
      0.2126 * TO_LINEAR[base.data[o]] + 0.7152 * TO_LINEAR[base.data[o + 1]] + 0.0722 * TO_LINEAR[base.data[o + 2]];
    luminance[i] = y;
    const w4 = i * REGIONS;
    weights[w4] = masks.data[o];
    weights[w4 + 1] = masks.data[o + 1];
    weights[w4 + 2] = masks.data[o + 2];
    weights[w4 + 3] = accent ? accent.data[o] : 0;
    for (let c = 0; c < REGIONS; c++) {
      const w = weights[w4 + c] / 255;
      sum[c] += y * w;
      weight[c] += w;
    }
  }

  const reference = sum.map((s, c) => Math.max(s / Math.max(weight[c], 1), 1e-4));
  return { width, height, base: base.data, weights, luminance, reference };
}

/** Вертикальные «волокна» для дерева: дёшево и без перспективы, но на фасадах читается как рисунок */
function makeGrain(width: number): Float32Array {
  const g = new Float32Array(width);
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const knots = Array.from({ length: Math.ceil(width / 3) + 2 }, () => rnd() * 2 - 1);
  for (let x = 0; x < width; x++) {
    const t = x / 3;
    const i = Math.floor(t);
    const f = t - i;
    const smooth = f * f * (3 - 2 * f);
    g[x] = 1 + 0.12 * (knots[i] * (1 - smooth) + knots[i + 1] * smooth);
  }
  return g;
}

export function render(p: Prepared, targets: (Target | null)[], out: ImageData): void {
  const { width, height, base, weights, luminance, reference } = p;
  const data = out.data;
  data.set(base);

  const grain = targets.some((t) => t?.grain) ? makeGrain(width) : null;
  const n = width * height;

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    for (let c = 0; c < REGIONS; c++) {
      const t = targets[c];
      if (!t) continue;
      const a = weights[i * REGIONS + c];
      if (a === 0) continue;

      let r = luminance[i] / reference[c];
      if (t.contrast !== 1) r = r ** t.contrast;
      if (t.grain && grain) r *= grain[i % width];

      const k = a / 255;
      for (let ch = 0; ch < 3; ch++) {
        const target = encode(knee(t.linear[ch] * r));
        data[o + ch] += (target - data[o + ch]) * k;
      }
    }
  }
}
