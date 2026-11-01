/**
 * Профили фрезеровок. Все размеры в миллиметрах.
 *
 * `edge`    — рамочные фрезеровки: глубина зависит от расстояния до ближайшего края.
 *             Точки [d, depth]: d — расстояние от края, depth — глубина выборки от лицевой плоскости.
 *             Дальше последней точки глубина постоянна. Косые стыки в углах получаются сами.
 * `stripes` — рейки и волны: профиль повторяется по ширине фасада. Точки [u, depth], u в [0, pitch].
 * `flat`    — гладкий фасад.
 *
 * ВАЖНО: размеры сняты приблизительно с картинок каталога. Перед запуском в прод
 * их нужно сверить с чертежами заказчика.
 */
export type ProfilePoint = readonly [number, number];

export type FacadeProfile =
  | { kind: "flat" }
  | { kind: "edge"; points: readonly ProfilePoint[] }
  | { kind: "stripes"; pitch: number; points: readonly ProfilePoint[] };

/** Гладкая S-кривая между двумя точками, нарезанная на сегменты. */
function ease(
  from: ProfilePoint,
  to: ProfilePoint,
  steps = 6,
): ProfilePoint[] {
  const out: ProfilePoint[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const s = t * t * (3 - 2 * t);
    out.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * s]);
  }
  return out;
}

function wave(pitch: number, amplitude: number, samples = 12): ProfilePoint[] {
  const pts: ProfilePoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = (i / samples) * pitch;
    pts.push([u, (amplitude * (1 - Math.cos((2 * Math.PI * i) / samples))) / 2]);
  }
  return pts;
}

export const profiles = {
  flat: { kind: "flat" },

  // Степ: рамка 44 мм, ступенька 2 мм, затем филёнка утоплена на 4 мм
  step: {
    kind: "edge",
    points: [[0, 0], [44, 0], [45.5, 2], [50, 2], [51.5, 4]],
  },

  // Баден: широкая рамка 60 мм, филёнка утоплена на 3 мм
  baden: {
    kind: "edge",
    points: [[0, 0], [60, 0], [63, 3]],
  },

  // Кант: узкий кант 9 мм, филёнка утоплена на 4 мм
  kant: {
    kind: "edge",
    points: [[0, 0], [9, 0], [12, 4]],
  },

  // Премьер: классический рамочный профиль с плавной лепниной
  premier: {
    kind: "edge",
    points: [
      [0, 0],
      [8, 0],
      ...ease([8, 0], [16, 2.5]),
      ...ease([16, 2.5], [22, 1.2], 4),
      ...ease([22, 1.2], [30, 4.5]),
      [38, 4.5],
    ],
  },

  // Волна 1: синусоидальные вертикальные волны, шаг 24 мм
  wave1: { kind: "stripes", pitch: 24, points: wave(24, 3) },

  // Рейки: плоская рейка 20 мм, паз 10 мм глубиной 6 мм, шаг 30 мм
  rails: {
    kind: "stripes",
    pitch: 30,
    points: [[0, 0], [20, 0], [21.5, 6], [28.5, 6], [30, 0]],
  },
} satisfies Record<string, FacadeProfile>;

export type ProfileId = keyof typeof profiles;
