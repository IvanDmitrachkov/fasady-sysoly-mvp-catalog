/**
 * Единое место, где заводятся параметры заказа фасадов и цены на них.
 * Источники: розничный прайс заказчика («Прайс-техничка») и бланк заказа «Blank_zakaza_fasadov_emal.xlsx»
 * (списки толщин, радиусов завала торца, интегрированных ручек).
 *
 * Чтобы добавить или изменить вариант (толщину, радиус, ручку) или цену, правьте только этот файл:
 * калькулятор, заявка и Excel подхватят изменения сами. `pricing.ts` содержит только саму формулу расчёта.
 * Вариант с `provisional: true` помечен в форме как «цена уточняется»: цифра приблизительная, её нужно подтвердить.
 */

/** Предельные размеры фасада, мм, и количество */
export const SIZE_LIMITS = {
  width: [1, 2050],
  height: [1, 2750],
  qty: [1, 999],
} as const;

/** Минимальная расчётная площадь одного фасада, м² (кроме белого RAL 9003) */
export const MIN_BILLED_AREA = 0.5;
export const WHITE_COLOR_ID = "ral-9003";

/** Цвет по умолчанию в новой строке */
export const DEFAULT_COLOR_ID = "ral-7040";

type Tier = "white" | "ral" | "metal";
export type RateTable = Record<"matte" | "gloss", Record<Tier, { rate: number; days: number }>>;

/** Базовые цены прямых фасадов: ₽/м² и срок, дней. Таблицу выбирает толщина (поле `table` в `THICKNESS`) */
export const RATE_TABLES: Record<"standard" | "thin", RateTable> = {
  /** 16 мм: основа расчёта */
  standard: {
    matte: { white: { rate: 7400, days: 10 }, ral: { rate: 7700, days: 10 }, metal: { rate: 8600, days: 10 } },
    gloss: { white: { rate: 8900, days: 18 }, ral: { rate: 9200, days: 18 }, metal: { rate: 10100, days: 18 } },
  },
  /** 10 мм: отдельная таблица цен */
  thin: {
    matte: { white: { rate: 6900, days: 15 }, ral: { rate: 7200, days: 15 }, metal: { rate: 7900, days: 15 } },
    gloss: { white: { rate: 8200, days: 18 }, ral: { rate: 8500, days: 18 }, metal: { rate: 9200, days: 18 } },
  },
};

/** Фрезеровка по каталогу: надбавка ₽/м² и дней */
export const MILLING = { add: 2500, days: 15 };

export type VariantConfig = {
  id: string;
  label: string;
  /** Надбавка к цене за м², ₽ */
  add?: number;
  /** Надбавка к сроку, дней */
  days?: number;
  /** Цена приблизительная, нужно подтвердить у заказчика */
  provisional?: boolean;
};

/** Толщина, мм (список из бланка заказа). Надбавка к 16 мм; 10 мм считается по своей таблице */
export const THICKNESS: (VariantConfig & { table?: "thin" })[] = [
  { id: "10", label: "10", table: "thin" },
  { id: "16", label: "16" },
  { id: "19", label: "19", add: 600 },
  { id: "22", label: "22", add: 1600 },
  { id: "24", label: "24", add: 2400 },
  // 26 и 32 мм есть в бланке, но в прайсе их цен нет: взяты по ближайшей известной толщине
  { id: "26", label: "26", add: 2400, provisional: true },
  { id: "32", label: "32", add: 3200, days: 5, provisional: true },
];
export const DEFAULT_THICKNESS_ID = "16";

/** Радиус завала торца, мм (список из бланка заказа; R 0 — без завала). На цену не влияет */
export const EDGE_RADII = [0, 1, 2, 3, 6, 9];
export const DEFAULT_EDGE_ID = "1";

/** Интегрированная ручка: профиль и сторона, по которой она идёт. Цена за погонный метр, ₽ */
export type HandleConfig = { id: string; label: string; side?: "height" | "width"; perMeter?: number; provisional?: boolean };

const HANDLE_PRICE = { L: 1200, U: 1200, C: 1800 };
export const HANDLES: HandleConfig[] = [
  { id: "none", label: "Нет" },
  { id: "L-h", label: "L, по высоте", side: "height", perMeter: HANDLE_PRICE.L, provisional: true },
  { id: "U-h", label: "U, по высоте", side: "height", perMeter: HANDLE_PRICE.U, provisional: true },
  { id: "C-h", label: "C, по высоте", side: "height", perMeter: HANDLE_PRICE.C, provisional: true },
  { id: "L-w", label: "L, по ширине", side: "width", perMeter: HANDLE_PRICE.L, provisional: true },
  { id: "U-w", label: "U, по ширине", side: "width", perMeter: HANDLE_PRICE.U, provisional: true },
  { id: "C-w", label: "C, по ширине", side: "width", perMeter: HANDLE_PRICE.C, provisional: true },
];

/** Срочное изготовление прямых фасадов: множитель цены и срока */
export const RUSH = [
  { id: "normal", label: "Обычная" },
  { id: "rush25", label: "Быстрее на 25% (+25% к цене)", mult: 1.25, daysMult: 0.75 },
  { id: "rush50", label: "Быстрее на 50% (+50% к цене)", mult: 1.5, daysMult: 0.5 },
];

/** Цены «от» для каталога */
export const PRICE_FROM = {
  /** Радиусный фасад высотой до 150 мм, матовый, ₽ за штуку */
  radius: 1600,
};
