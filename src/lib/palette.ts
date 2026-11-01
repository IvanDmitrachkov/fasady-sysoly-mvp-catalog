/**
 * Цвета для превью. HEX приблизительные: на экране цвет всегда условный,
 * реальный оттенок заказчик подбирает по физическим образцам RAL / NCS.
 */
export type SwatchGroup = "RAL" | "NCS" | "Wood";

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
];

export const swatchById = (id: string): Swatch =>
  swatches.find((s) => s.id === id) ?? swatches[0];

export type Finish = "matte" | "gloss";

export const finishes: { id: Finish; label: string }[] = [
  { id: "matte", label: "Матовый" },
  { id: "gloss", label: "Глянцевый" },
];
