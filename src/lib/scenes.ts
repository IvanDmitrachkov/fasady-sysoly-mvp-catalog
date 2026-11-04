export type Surface = {
  id: string;
  name: string;
  /** null — оставить как на фото */
  hex: string | null;
  grain?: boolean;
};

export type KitchenScene = {
  id: string;
  name: string;
  /** Файлы из public/scenes/<id>, делаются скриптом tools/make_masks.py */
  base: string;
  masks: string;
  /** Маска акцентных зон, если они размечены в сцене */
  masks2?: string;
  accentLabel?: string;
  /**
   * Другие фото той же кухни: ключ — slug фрезеровки из каталога.
   * «Прямой» всегда берётся из base. Нет файла — в демо фрезеровка недоступна.
   */
  variants?: Record<string, string>;
  width: number;
  height: number;
  alt: string;
};

export const scenes: KitchenScene[] = [
  {
    id: "corner-1",
    name: "Угловая кухня",
    base: "/scenes/corner-1/base.jpg",
    masks: "/scenes/corner-1/masks.png",
    masks2: "/scenes/corner-1/masks2.png",
    accentLabel: "Акцент: колонны",
    variants: {
      step: "/scenes/corner-1/step.jpg",
      "volna-1": "/scenes/corner-1/volna-1.jpg",
    },
    width: 1472,
    height: 1840,
    alt: "Угловая кухня с светлыми безручковыми фасадами",
  },
  {
    id: "straight-1",
    name: "Прямая кухня",
    base: "/scenes/straight-1/base.jpg",
    masks: "/scenes/straight-1/masks.png",
    width: 1128,
    height: 1380,
    alt: "Прямая кухня с безручковыми фасадами",
  },
];

export const worktops: Surface[] = [
  { id: "orig", name: "Как на фото", hex: null },
  { id: "white", name: "Белый камень", hex: "#e9e7e2" },
  { id: "light", name: "Светло-серый", hex: "#bdbdba" },
  { id: "beige", name: "Бежевый", hex: "#cbbda3" },
  { id: "black", name: "Чёрный", hex: "#19191b" },
  { id: "oak", name: "Дуб", hex: "#b58f62", grain: true },
  { id: "walnut", name: "Орех", hex: "#6b4a33", grain: true },
];

export const backsplashes: Surface[] = [
  { id: "orig", name: "Как на фото", hex: null },
  { id: "white", name: "Белый", hex: "#ece9e3" },
  { id: "concrete", name: "Светлый бетон", hex: "#b5b5b3" },
  { id: "beige", name: "Бежевый", hex: "#d4c8b2" },
  { id: "graphite", name: "Графит", hex: "#3b3d40" },
  { id: "green", name: "Зелёный", hex: "#7f9a84" },
  { id: "terracotta", name: "Терракота", hex: "#b86f55" },
];
