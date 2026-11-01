import type { ProfileId } from "./profiles";
import { swatchById, type Finish } from "./palette";
import { facades } from "./catalog";

/**
 * Модель конструктора прямой кухни. Все размеры в мм, ось X слева направо,
 * Y вверх от пола. Размеры модулей условные: до запуска нужно сверить с заказчиком.
 */

export type ColumnKind = "doors" | "drawers" | "tall";

export type FacadeStyle = { profile: ProfileId; swatchId: string };

export type Column = {
  id: string;
  kind: ColumnKind;
  width: number;
  /** Навесной шкаф над тумбой (для пенала не используется) */
  upper: boolean;
  /** Свой фасад модуля вместо общего */
  override?: FacadeStyle;
};

export type Project = {
  wall: number;
  style: FacadeStyle & { finish: Finish };
  columns: Column[];
};

export const WALL_RANGE = [1800, 4800] as const;
export const WALL_STEP = 100;

export const widthOptions: Record<ColumnKind, readonly number[]> = {
  doors: [300, 400, 450, 500, 600, 800, 900],
  drawers: [400, 450, 500, 600, 800, 900],
  tall: [400, 450, 500, 600],
};

export const kindLabels: Record<ColumnKind, string> = {
  doors: "Тумба с дверцами",
  drawers: "Тумба с ящиками",
  tall: "Пенал",
};

export const dims = {
  plinth: 100,
  baseTop: 820,
  worktop: 38,
  worktopDepth: 600,
  baseDepth: 560,
  wallBottom: 1400,
  wallTop: 2200,
  wallDepth: 320,
  tallTop: 2200,
  gap: 3,
  facadeThickness: 19,
} as const;

/** Профили из каталога, у которых есть 3D */
export const facadeStyles = facades
  .filter((f) => f.profile)
  .map((f) => ({ profile: f.profile as ProfileId, name: f.name }));

export const profileName = (profile: ProfileId) => facadeStyles.find((f) => f.profile === profile)?.name ?? profile;

export type FacadePiece = {
  /** Уникальный ключ в сцене */
  key: string;
  columnId: string;
  /** Левый край и низ в мм */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Глубина, на которой стоит лицевая плоскость корпуса */
  depth: number;
  style: FacadeStyle;
  zone: "base" | "upper" | "tall";
};

export type ColumnLayout = {
  column: Column;
  x: number;
  pieces: FacadePiece[];
};

export const usedWidth = (columns: Column[]) => columns.reduce((sum, c) => sum + c.width, 0);

export function layoutProject(project: Project): ColumnLayout[] {
  let x = 0;
  return project.columns.map((column) => {
    const style = column.override ?? project.style;
    const pieces: FacadePiece[] = [];
    const g = dims.gap;
    const add = (zone: FacadePiece["zone"], suffix: string, px: number, y0: number, y1: number, pw: number, depth: number) =>
      pieces.push({
        key: `${column.id}-${suffix}`,
        columnId: column.id,
        x: px + g / 2,
        y: y0 + g / 2,
        w: pw - g,
        h: y1 - y0 - g,
        depth,
        style,
        zone,
      });

    const split = (zone: FacadePiece["zone"], prefix: string, y0: number, y1: number, depth: number) => {
      const n = column.width > 600 ? 2 : 1;
      for (let i = 0; i < n; i++) add(zone, `${prefix}${i}`, x + (column.width / n) * i, y0, y1, column.width / n, depth);
    };

    if (column.kind === "tall") {
      add("tall", "low", x, dims.plinth, 1300, column.width, dims.baseDepth);
      add("tall", "high", x, 1300, dims.tallTop, column.width, dims.baseDepth);
    } else {
      if (column.kind === "doors") {
        split("base", "d", dims.plinth, dims.baseTop, dims.baseDepth);
      } else {
        // три ящика: верхний ниже остальных
        add("base", "a", x, dims.plinth, 390, column.width, dims.baseDepth);
        add("base", "b", x, 390, 600, column.width, dims.baseDepth);
        add("base", "c", x, 600, dims.baseTop, column.width, dims.baseDepth);
      }
      if (column.upper) split("upper", "u", dims.wallBottom, dims.wallTop, dims.wallDepth);
    }

    const layout = { column, x, pieces };
    x += column.width;
    return layout;
  });
}

export type FacadeRow = { name: string; swatch: string; finish: string; w: number; h: number; count: number };

/** Сводка для заявки: одинаковые фасады объединяются */
export function facadeSummary(project: Project): FacadeRow[] {
  const map = new Map<string, FacadeRow>();
  for (const { pieces } of layoutProject(project)) {
    for (const p of pieces) {
      const sw = swatchById(p.style.swatchId);
      const w = Math.round(p.w);
      const h = Math.round(p.h);
      const key = `${p.style.profile}|${sw.id}|${w}|${h}`;
      const row = map.get(key);
      if (row) row.count += 1;
      else
        map.set(key, {
          name: profileName(p.style.profile),
          swatch: `${sw.code === "Wood Color" ? "Wood" : sw.code} ${sw.name}`,
          finish: project.style.finish === "gloss" ? "глянец" : "мат",
          w,
          h,
          count: 1,
        });
    }
  }
  return [...map.values()].sort((a, b) => b.h - a.h || b.w - a.w);
}

let counter = 0;
export const newId = () => `c${Date.now().toString(36)}${(counter++).toString(36)}`;

export const makeColumn = (kind: ColumnKind, width: number, upper = kind !== "tall"): Column => ({
  id: newId(),
  kind,
  width,
  upper,
});

export const defaultProject = (): Project => ({
  wall: 3000,
  style: { profile: "step", swatchId: "ral-7040", finish: "matte" },
  columns: [
    makeColumn("tall", 600),
    makeColumn("doors", 600),
    makeColumn("drawers", 900),
    makeColumn("doors", 600),
    makeColumn("doors", 300),
  ],
});

export function summaryText(project: Project, rows: FacadeRow[]) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const short = `Кухня ${project.wall} мм, ${project.columns.length} модулей, ${total} фасадов`;
  const lines = rows.map((r) => `${r.name}, ${r.swatch}, ${r.finish}: ${r.w}×${r.h} мм, ${r.count} шт`);
  return { short, comment: `Конструктор кухни.\n${lines.join("\n")}` };
}
