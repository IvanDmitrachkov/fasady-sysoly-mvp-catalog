/**
 * Цвета для превью. HEX приблизительные: на экране цвет всегда условный,
 * реальный оттенок заказчик подбирает по физическим образцам RAL / NCS.
 */
export type SwatchGroup = "RAL" | "NCS" | "Wood" | "ColorSystem" | "Custom";

export type Swatch = {
  id: string;
  name: string;
  code: string;
  hex: string;
  group: SwatchGroup;
  /** Имитация древесного рисунка (плёнка / Wood Color) */
  grain?: boolean;
};

export const swatches: Swatch[] = [
  { id: "ral-9003", name: "Сигнальный белый", code: "RAL 9003", hex: "#f2f2ef", group: "RAL" },
  { id: "ral-1013", name: "Жемчужно-белый", code: "RAL 1013", hex: "#e6e1cd", group: "RAL" },
  { id: "ral-7044", name: "Шелково-серый", code: "RAL 7044", hex: "#c7c3b6", group: "RAL" },
  { id: "ral-7035", name: "Светло-серый", code: "RAL 7035", hex: "#c5c9c7", group: "RAL" },
  { id: "ral-7040", name: "Серый оконный", code: "RAL 7040", hex: "#9da3a6", group: "RAL" },
  { id: "ral-7016", name: "Антрацит", code: "RAL 7016", hex: "#383e42", group: "RAL" },
  { id: "ral-9005", name: "Чёрный янтарь", code: "RAL 9005", hex: "#16171a", group: "RAL" },
  { id: "ral-6021", name: "Бледно-зелёный", code: "RAL 6021", hex: "#8fae7e", group: "RAL" },
  { id: "ral-6011", name: "Резедово-зелёный", code: "RAL 6011", hex: "#6c7c59", group: "RAL" },
  { id: "ral-5014", name: "Голубино-синий", code: "RAL 5014", hex: "#637d96", group: "RAL" },
  { id: "ral-5003", name: "Сапфирово-синий", code: "RAL 5003", hex: "#1f3a5a", group: "RAL" },
  { id: "ral-3014", name: "Розовый антик", code: "RAL 3014", hex: "#d36e70", group: "RAL" },
  { id: "ral-8019", name: "Серо-коричневый", code: "RAL 8019", hex: "#403a38", group: "RAL" },
  { id: "wood-oak", name: "Дуб светлый", code: "Wood Color", hex: "#c9a57a", group: "Wood", grain: true },
  { id: "wood-walnut", name: "Орех", code: "Wood Color", hex: "#7a553a", group: "Wood", grain: true },
  { id: "wood-wenge", name: "Венге", code: "Wood Color", hex: "#3b2b25", group: "Wood", grain: true },
  // NCS: коды настоящие, HEX приблизительные (сверить с веером NCS)
  { id: "ncs-0500-n", name: "Белый нейтральный", code: "NCS S 0500-N", hex: "#eef0ee", group: "NCS" },
  { id: "ncs-1500-n", name: "Светло-серый", code: "NCS S 1500-N", hex: "#d5d6d5", group: "NCS" },
  { id: "ncs-3000-n", name: "Серый", code: "NCS S 3000-N", hex: "#b4b5b4", group: "NCS" },
  { id: "ncs-5000-n", name: "Тёмно-серый", code: "NCS S 5000-N", hex: "#858585", group: "NCS" },
  { id: "ncs-7500-n", name: "Графит", code: "NCS S 7500-N", hex: "#444546", group: "NCS" },
  { id: "ncs-9000-n", name: "Почти чёрный", code: "NCS S 9000-N", hex: "#26272a", group: "NCS" },
  { id: "ncs-0502-y", name: "Тёплый белый", code: "NCS S 0502-Y", hex: "#ece9e0", group: "NCS" },
  { id: "ncs-1005-y20r", name: "Песочный", code: "NCS S 1005-Y20R", hex: "#dbd0bc", group: "NCS" },
  { id: "ncs-3010-y30r", name: "Бежево-коричневый", code: "NCS S 3010-Y30R", hex: "#a69276", group: "NCS" },
  { id: "ncs-2010-b", name: "Дымчато-голубой", code: "NCS S 2010-B", hex: "#b4c2c9", group: "NCS" },
  { id: "ncs-4020-g", name: "Глубокий зелёный", code: "NCS S 4020-G", hex: "#4f7f6a", group: "NCS" },
  // «Подбор»: цвет назовёт клиент, на превью нейтральная заглушка
  { id: "custom", name: "Подбор по образцу", code: "Подбор", hex: "#b9b5ac", group: "Custom" },
];

export const swatchById = (id: string): Swatch =>
  swatches.find((s) => s.id === id) ?? swatches[0];

export type Finish = "matte" | "gloss";

export const finishes: { id: Finish; label: string }[] = [
  { id: "matte", label: "Матовый" },
  { id: "gloss", label: "Глянцевый" },
];

export const groupLabels: Record<SwatchGroup, string> = {
  RAL: "RAL",
  NCS: "NCS",
  Wood: "Wood Color",
  ColorSystem: "Color System",
  Custom: "Подбор",
};

/** Код для заявки: у «деревьев» код общий, поэтому берём название */
export const swatchLabel = (s: Swatch, note?: string) =>
  s.group === "Custom"
    ? `Подбор${note?.trim() ? `: ${note.trim()}` : ""}`
    : `${s.group === "Wood" ? "Wood" : s.code} ${s.name}`;
