import { BufferGeometry, Float32BufferAttribute } from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FacadeProfile, ProfilePoint } from "./profiles";

const EPS = 1e-6;
const CREASE_ANGLE = Math.PI / 6;

function sortedUnique(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const out: number[] = [];
  for (const v of sorted) {
    if (out.length === 0 || v - out[out.length - 1] > EPS) out.push(v);
  }
  return out;
}

/** Узлы сетки вдоль одной оси: плотные у краёв (где рельеф), редкие в середине. */
function axisBreaks(len: number, profile: FacadeProfile, alongStripes: boolean): number[] {
  if (profile.kind === "flat") return [0, len];

  if (profile.kind === "edge") {
    const ds = profile.points.map((p) => p[0]);
    return sortedUnique(
      [0, len, len / 2, ...ds, ...ds.map((d) => len - d)].filter((v) => v >= -EPS && v <= len + EPS),
    );
  }

  if (!alongStripes) return [0, len];
  const out = [0, len];
  const periods = Math.ceil(len / profile.pitch);
  for (let k = 0; k <= periods; k++) {
    for (const [u] of profile.points) {
      const v = k * profile.pitch + u;
      if (v > EPS && v < len - EPS) out.push(v);
    }
  }
  return sortedUnique(out);
}

function interpolate(pts: readonly ProfilePoint[], d: number): number {
  if (d <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [d1, z1] = pts[i];
    if (d <= d1) {
      const [d0, z0] = pts[i - 1];
      const span = d1 - d0;
      return span < EPS ? z1 : z0 + ((z1 - z0) * (d - d0)) / span;
    }
  }
  return pts[pts.length - 1][1];
}

/** Глубина выборки в точке (x, y) лицевой плоскости. */
function depthAt(profile: FacadeProfile, x: number, y: number, w: number, h: number): number {
  if (profile.kind === "flat") return 0;
  if (profile.kind === "edge") {
    return interpolate(profile.points, Math.min(x, w - x, y, h - y));
  }
  const u = ((x % profile.pitch) + profile.pitch) % profile.pitch;
  // x ровно на границе периода: берём конец профиля, а не начало, чтобы поверхность была непрерывной
  const uu = x > EPS && u < EPS ? profile.pitch : u;
  return interpolate(profile.points, uu);
}

/**
 * Геометрия фасада в миллиметрах, центрирована в нуле.
 * Лицевая сторона смотрит в +Z, высота по Y, ширина по X.
 */
export function buildFacadeGeometry(
  profile: FacadeProfile,
  width: number,
  height: number,
  thickness: number,
): BufferGeometry {
  const xs = axisBreaks(width, profile, true);
  const ys = axisBreaks(height, profile, false);
  const topZ = (x: number, y: number) => thickness - depthAt(profile, x, y, width, height);

  const pos: number[] = [];
  const tri = (a: number[], b: number[], c: number[]) => pos.push(...a, ...b, ...c);

  // Лицевая поверхность с рельефом
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
      const a = [x0, y0, topZ(x0, y0)];
      const b = [x1, y0, topZ(x1, y0)];
      const c = [x1, y1, topZ(x1, y1)];
      const d = [x0, y1, topZ(x0, y1)];
      // Диагональ ячейки идёт вдоль косого стыка угла, иначе фаска получится «рваной»
      const sameDiagonal = (x0 + x1 < width) === (y0 + y1 < height);
      if (sameDiagonal) {
        tri(a, b, c);
        tri(a, c, d);
      } else {
        tri(a, b, d);
        tri(b, c, d);
      }
    }
  }

  // Торцы: идём по периметру против часовой стрелки, нормаль наружу
  const wall = (x0: number, y0: number, x1: number, y1: number) => {
    const ab = [x0, y0, 0], bb = [x1, y1, 0];
    const bt = [x1, y1, topZ(x1, y1)], at = [x0, y0, topZ(x0, y0)];
    tri(ab, bb, bt);
    tri(ab, bt, at);
  };
  for (let i = 0; i < xs.length - 1; i++) wall(xs[i], 0, xs[i + 1], 0);
  for (let j = 0; j < ys.length - 1; j++) wall(width, ys[j], width, ys[j + 1]);
  for (let i = xs.length - 1; i > 0; i--) wall(xs[i], height, xs[i - 1], height);
  for (let j = ys.length - 1; j > 0; j--) wall(0, ys[j], 0, ys[j - 1]);

  // Тыльная сторона
  tri([0, 0, 0], [0, height, 0], [width, height, 0]);
  tri([0, 0, 0], [width, height, 0], [width, 0, 0]);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(pos, 3));

  // UV в метрах: текстуры дерева и плёнки привязаны к реальным размерам
  const uv: number[] = [];
  for (let i = 0; i < pos.length; i += 3) uv.push(pos[i] / 1000, pos[i + 1] / 1000);
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));

  // Резкие рёбра остаются резкими, скругления (волна, лепнина) сглаживаются
  const shaded = toCreasedNormals(geometry, CREASE_ANGLE);
  geometry.dispose();
  shaded.translate(-width / 2, -height / 2, -thickness / 2);
  return shaded;
}
