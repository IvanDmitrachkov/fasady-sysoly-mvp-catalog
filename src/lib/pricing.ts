import { facades } from "./catalog";
import {
  DEFAULT_COLOR_ID,
  DEFAULT_EDGE_ID,
  DEFAULT_THICKNESS_ID,
  EDGE_RADII,
  HANDLES,
  MILLING,
  MIN_BILLED_AREA,
  PRICE_FROM,
  RATE_TABLES,
  RUSH,
  SIZE_LIMITS,
  THICKNESS,
  WHITE_COLOR_ID,
  type VariantConfig,
} from "./orderConfig";
import { swatches } from "./palette";

/**
 * Расчёт стоимости заказа фасадов по розничному прайсу заказчика («Прайс-техничка»).
 *
 * Цена за м² = базовая цена (по толщине, покрытию и типу цвета) + надбавки выбранных вариантов, затем умножается
 * на коэффициенты (срочность). Площадь считается не меньше 0,5 м² на фасад, кроме белого RAL 9003.
 * Срок = базовый срок + надбавки, затем умножается на коэффициент срочности.
 *
 * Новый параметр добавляется одной записью в `params`: он сам появится в форме, в расчёте и в выгрузке в Excel.
 * Сами варианты и цены заведены в `orderConfig.ts`; здесь только формула.
 */

/** Цены внесены из прайса заказчика */
export const PRICES_ARE_PLACEHOLDER = false;

export { MIN_BILLED_AREA, WHITE_COLOR_ID };

/** Цены «от» для каталога: самый дешёвый вариант (16 мм, матовый белый) */
export const priceFrom = {
  straight: RATE_TABLES.standard.matte.white.rate,
  milled: RATE_TABLES.standard.matte.white.rate + MILLING.add,
  /** Интегрированная ручка, ₽ за погонный метр (самая дешёвая) */
  handle: Math.min(...HANDLES.flatMap((h) => (h.perMeter ? [h.perMeter] : []))),
  radius: PRICE_FROM.radius,
};

export const sizeLimits = { width: SIZE_LIMITS.width, height: SIZE_LIMITS.height, qty: SIZE_LIMITS.qty };

export type Option = {
  id: string;
  label: string;
  /** Надбавка к цене за м², ₽ */
  add?: number;
  /** Множитель цены (после надбавок) */
  mult?: number;
  /** Надбавка к сроку, дней */
  days?: number;
  /** Множитель срока */
  daysMult?: number;
  /** Цена приблизительная: в форме помечается «цена уточняется» */
  provisional?: boolean;
  /** Интегрированная ручка: цена за погонный метр, ₽, и сторона фасада, вдоль которой она идёт */
  perMeter?: number;
  side?: "height" | "width";
  /** Цвет для образца */
  hex?: string;
};

export type Values = Record<string, string>;

export type Param = {
  id: string;
  label: string;
  options: Option[];
  /** Параметр показывается и учитывается только при выполнении условия */
  showIf?: (v: Values) => boolean;
};

const variant = ({ id, label, add, days, provisional }: VariantConfig): Option => ({ id, label, add, days, provisional });

const milled = facades.filter((f) => f.category === "milled");

export const params: Param[] = [
  {
    id: "type",
    label: "Тип фасада",
    options: [
      { id: "straight", label: "Прямой" },
      { id: "milled", label: "С фрезеровкой", add: MILLING.add, days: MILLING.days },
    ],
  },
  {
    id: "profile",
    label: "Фрезеровка",
    showIf: (v) => v.type === "milled",
    options: milled.map((f) => ({ id: f.slug, label: f.name })),
  },
  {
    id: "edge",
    label: "Радиус завала торца",
    options: EDGE_RADII.map((r) => ({ id: String(r), label: r === 0 ? "Без завала" : `R ${r} мм` })),
  },
  {
    id: "handle",
    label: "Интегрированная ручка",
    options: HANDLES.map(({ id, label, side, perMeter, provisional }) => ({ id, label, side, perMeter, provisional })),
  },
  {
    id: "color",
    label: "Цвет",
    options: swatches.map((s) => ({ id: s.id, label: s.group === "Custom" ? "Подбор по образцу" : `${s.code} · ${s.name}`, hex: s.hex })),
  },
  {
    id: "effect",
    label: "Эффект цвета",
    options: [
      { id: "plain", label: "Обычный" },
      { id: "metal", label: "Металлик" },
    ],
  },
  {
    id: "coating",
    label: "Покрытие",
    options: [
      { id: "matte", label: "Матовое" },
      { id: "gloss", label: "Глянцевое" },
    ],
  },
  {
    id: "thickness",
    label: "Толщина, мм",
    options: THICKNESS.map(variant),
  },
  {
    id: "rush",
    label: "Срочность",
    // срочное изготовление только для прямых фасадов
    showIf: (v) => v.type === "straight",
    options: RUSH,
  },
];

export type Row = {
  id: string;
  values: Values;
  /** Пустая строка, пока пользователь вводит */
  width: number | "";
  height: number | "";
  qty: number | "";
};

let counter = 0;
export const newRowId = () => `r${Date.now().toString(36)}${(counter++).toString(36)}`;

export const isVisible = (p: Param, v: Values) => !p.showIf || p.showIf(v);

const DEFAULTS: Record<string, string> = { color: DEFAULT_COLOR_ID, thickness: DEFAULT_THICKNESS_ID, edge: DEFAULT_EDGE_ID };

export const defaultValues = (): Values => {
  const v: Values = {};
  for (const p of params) v[p.id] = DEFAULTS[p.id] ?? p.options[0].id;
  return v;
};

/** id первой строки фиксирован: Date.now() в рендере давал бы разные id на сервере и в браузере */
export const newRow = (id: string = newRowId()): Row => ({ id, values: defaultValues(), width: 450, height: 700, qty: 1 });

/** Подпись значения для заявки и Excel: у «Подбора» добавляется пожелание клиента (values.colorNote) */
export const valueLabel = (p: Param, v: Values) =>
  p.id === "color" && v.color === "custom" ? `Подбор${v.colorNote?.trim() ? `: ${v.colorNote.trim()}` : ""}` : optionOf(p, v).label;

export const optionOf = (p: Param, v: Values) => p.options.find((o) => o.id === v[p.id]) ?? p.options[0];

const clamp = (n: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, n));

export type RowCalc = {
  width: number;
  height: number;
  qty: number;
  /** Размер или количество вне допустимых пределов */
  errors: { width?: string; height?: string; qty?: string };
  /** Фактическая площадь одной штуки, м² */
  area: number;
  /** Площадь, за которую берётся оплата (не меньше 0,5 м², кроме RAL 9003) */
  billedArea: number;
  /** ₽ за м² с учётом всех надбавок */
  rate: number;
  /** Срок изготовления, дней */
  days: number;
  /** Из цены штуки: интегрированная ручка, ₽ */
  handleCost: number;
  unit: number;
  total: number;
};

function baseOf(v: Values) {
  const table = RATE_TABLES[THICKNESS.find((t) => t.id === v.thickness)?.table ?? "standard"];
  const tier: "white" | "ral" | "metal" = v.effect === "metal" ? "metal" : v.color === WHITE_COLOR_ID ? "white" : "ral";
  return table[v.coating === "gloss" ? "gloss" : "matte"][tier];
}

export function calcRow(row: Row): RowCalc {
  const errors: RowCalc["errors"] = {};
  const check = (key: "width" | "height", label: string) => {
    const raw = row[key];
    const [min, max] = sizeLimits[key];
    if (raw === "" || raw < min) errors[key] = `${label}: от ${min} мм`;
    else if (raw > max) errors[key] = `${label}: не более ${max} мм`;
  };
  check("width", "Ширина");
  check("height", "Высота");
  if (row.qty === "" || row.qty < 1) errors.qty = "Количество: от 1";
  else if (row.qty > sizeLimits.qty[1]) errors.qty = `Количество: не более ${sizeLimits.qty[1]}`;

  const width = clamp(Number(row.width) || 0, sizeLimits.width);
  const height = clamp(Number(row.height) || 0, sizeLimits.height);
  const qty = clamp(Math.round(Number(row.qty) || 0), sizeLimits.qty);
  const area = (width * height) / 1e6;
  const billedArea = row.values.color === WHITE_COLOR_ID ? area : Math.max(area, MIN_BILLED_AREA);

  const visible = params.filter((p) => isVisible(p, row.values)).map((p) => optionOf(p, row.values));
  const base = baseOf(row.values);
  const rate = Math.round(
    (base.rate + visible.reduce((s, o) => s + (o.add ?? 0), 0)) * visible.reduce((m, o) => m * (o.mult ?? 1), 1),
  );
  const days = Math.ceil((base.days + visible.reduce((s, o) => s + (o.days ?? 0), 0)) * visible.reduce((m, o) => m * (o.daysMult ?? 1), 1));
  const handle = visible.find((o) => o.perMeter);
  const handleCost = handle ? Math.round(((handle.side === "width" ? width : height) / 1000) * handle.perMeter!) : 0;
  const unit = Math.round(billedArea * rate) + handleCost;
  return { width, height, qty, errors, area, billedArea, rate, days, handleCost, unit, total: unit * qty };
}

export const hasErrors = (c: RowCalc) => Object.keys(c.errors).length > 0;

export function totals(rows: Row[]) {
  const calcs = rows.map(calcRow);
  return {
    calcs,
    pieces: calcs.reduce((s, c) => s + c.qty, 0),
    area: calcs.reduce((s, c) => s + c.area * c.qty, 0),
    total: calcs.reduce((s, c) => s + c.total, 0),
    /** Срок всего заказа: по самой долгой позиции */
    days: calcs.reduce((m, c) => Math.max(m, c.days), 0),
    valid: calcs.every((c) => !hasErrors(c)),
  };
}
