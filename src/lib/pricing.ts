import { facades, limits } from "./catalog";
import { swatches } from "./palette";

/**
 * Расчёт стоимости заказа фасадов по розничному прайсу заказчика («Прайс-техничка»).
 *
 * Цена за м² = базовая цена (по толщине, покрытию и типу цвета) + надбавки выбранных вариантов, затем умножается
 * на коэффициенты (срочность). Площадь считается не меньше 0,5 м² на фасад, кроме белого RAL 9003.
 * Срок = базовый срок + надбавки, затем умножается на коэффициент срочности.
 *
 * Новый параметр добавляется одной записью в `params`: он сам появится в форме, в расчёте и в выгрузке в Excel.
 * Цены меняются только здесь.
 */

/** Цены внесены из прайса заказчика */
export const PRICES_ARE_PLACEHOLDER = false;

/** Минимальная расчётная площадь одного фасада, м² (кроме RAL 9003) */
export const MIN_BILLED_AREA = 0.5;
export const WHITE_COLOR_ID = "ral-9003";

/** Надбавка за фрезеровку по каталогу, ₽/м² */
const MILLING_ADD = 2500;

type Tier = "white" | "ral" | "metal";
type RateTable = Record<"matte" | "gloss", Record<Tier, { rate: number; days: number }>>;

/** Прямые фасады 16 мм: основа расчёта. ₽/м² и срок, дней */
const TABLE_16: RateTable = {
  matte: { white: { rate: 7400, days: 10 }, ral: { rate: 7700, days: 10 }, metal: { rate: 8600, days: 10 } },
  gloss: { white: { rate: 8900, days: 18 }, ral: { rate: 9200, days: 18 }, metal: { rate: 10100, days: 18 } },
};
/** Прямые фасады 10 мм: отдельная таблица цен */
const TABLE_10: RateTable = {
  matte: { white: { rate: 6900, days: 15 }, ral: { rate: 7200, days: 15 }, metal: { rate: 7900, days: 15 } },
  gloss: { white: { rate: 8200, days: 18 }, ral: { rate: 8500, days: 18 }, metal: { rate: 9200, days: 18 } },
};

/** Цены «от» для каталога: самый дешёвый вариант (16 мм, матовый белый) */
export const priceFrom = {
  straight: TABLE_16.matte.white.rate,
  milled: TABLE_16.matte.white.rate + MILLING_ADD,
  /** Интегрированная ручка L, U, C, ₽ за погонный метр */
  handle: 1200,
  /** Радиусный фасад высотой до 150 мм, матовый, ₽ за штуку */
  radius: 1600,
};

export const sizeLimits = { width: limits.width, height: limits.height, qty: [1, 999] as const };

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

const milled = facades.filter((f) => f.category === "milled");

export const params: Param[] = [
  {
    id: "type",
    label: "Тип фасада",
    options: [
      { id: "straight", label: "Прямой" },
      // фрезеровка по каталогу: +2500 ₽/м², +15 дней
      { id: "milled", label: "С фрезеровкой", add: MILLING_ADD, days: 15 },
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
    options: [
      { id: "1", label: "R 1 мм" },
      { id: "3", label: "R 3 мм" },
      { id: "6", label: "R 6 мм" },
      { id: "8", label: "R 8 мм" },
    ],
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
    // 10 мм считается по своей таблице, остальные: 16 мм плюс надбавка
    options: [
      { id: "10", label: "10" },
      { id: "16", label: "16" },
      { id: "19", label: "19", add: 600 },
      { id: "22", label: "22", add: 1600 },
      { id: "24", label: "24", add: 2400 },
      { id: "38", label: "38", add: 3200, days: 5 },
    ],
  },
  {
    id: "rush",
    label: "Срочность",
    // срочное изготовление только для прямых фасадов
    showIf: (v) => v.type === "straight",
    options: [
      { id: "normal", label: "Обычная" },
      { id: "rush25", label: "Быстрее на 25% (+25% к цене)", mult: 1.25, daysMult: 0.75 },
      { id: "rush50", label: "Быстрее на 50% (+50% к цене)", mult: 1.5, daysMult: 0.5 },
    ],
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

export const defaultValues = (): Values => {
  const v: Values = {};
  for (const p of params) v[p.id] = p.id === "color" ? "ral-7040" : p.id === "thickness" ? "16" : p.options[0].id;
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
  unit: number;
  total: number;
};

function baseOf(v: Values) {
  const table = v.thickness === "10" ? TABLE_10 : TABLE_16;
  const tier: Tier = v.effect === "metal" ? "metal" : v.color === WHITE_COLOR_ID ? "white" : "ral";
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
  const unit = Math.round(billedArea * rate);
  return { width, height, qty, errors, area, billedArea, rate, days, unit, total: unit * qty };
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
