import type { ProfileId } from "./profiles";

export type CategoryId = "straight" | "milled" | "handles" | "radius" | "worktops";

export const categories: { id: CategoryId; name: string; hint: string }[] = [
  { id: "straight", name: "Прямые", hint: "Гладкий МДФ без фрезеровки" },
  { id: "milled", name: "С фрезеровкой", hint: "Рамки, волны, рейки" },
  { id: "handles", name: "С интегрированной ручкой", hint: "Профиль-ручка в самом фасаде" },
  { id: "radius", name: "Радиусные", hint: "Наружные и внутренние" },
  { id: "worktops", name: "Столешницы", hint: "Профили кромки" },
];

export type Facade = {
  slug: string;
  name: string;
  category: CategoryId;
  /** Профиль для 3D. Если не задан, показываем только фото. */
  profile?: ProfileId;
  blurb: string;
  /** Файлы из public/pdf; первое — обложка карточки */
  photos: string[];
  /** Схема профиля или эскиз фасада из каталога */
  swatch?: string;
};

/** Общие габариты из каталога, мм */
export const limits = {
  thickness: [10, 40],
  height: [1, 2750],
  width: [1, 2050],
} as const;

const p = (name: string) => `/pdf/${name}.jpg`;

export const facades: Facade[] = [
  {
    slug: "pryamoy",
    name: "Фасад прямой",
    category: "straight",
    profile: "flat",
    blurb: "Гладкий МДФ-фасад без фрезеровки. Основа минималистичных кухонь: цвет и покрытие решают всё.",
    photos: [p("p02-5"), p("p02-3"), p("p02-1")],
    swatch: p("p02-6"),
  },

  {
    slug: "premier",
    name: "Премьер",
    category: "milled",
    profile: "premier",
    blurb: "Классическая рамочная фрезеровка с мягкой лепниной по контуру филёнки.",
    photos: [p("p11-3")],
    swatch: p("p11-1"),
  },
  {
    slug: "volna-1",
    name: "Волна 1",
    category: "milled",
    profile: "wave1",
    blurb: "Вертикальные волны по всей поверхности. Фасад с рельефом, который играет со светом.",
    photos: [p("p12-1")],
    swatch: p("p12-4"),
  },
  {
    slug: "volna-2",
    name: "Волна 2",
    category: "milled",
    blurb: "Вариант волнистой фрезеровки с другим шагом и рисунком рельефа.",
    photos: [p("p13-6"), p("p13-0")],
    swatch: p("p13-1"),
  },
  {
    slug: "step",
    name: "Степ",
    category: "milled",
    profile: "step",
    blurb: "Рамка со ступенчатым переходом к утопленной филёнке. Сдержанная современная классика.",
    photos: [p("p14-2")],
    swatch: p("p14-1"),
  },
  {
    slug: "baden",
    name: "Баден",
    category: "milled",
    profile: "baden",
    blurb: "Широкая рамка и утопленная филёнка: спокойный профиль в стиле шейкер.",
    photos: [p("p15-2")],
    swatch: p("p15-1"),
  },
  {
    slug: "kant",
    name: "Кант",
    category: "milled",
    profile: "kant",
    blurb: "Тонкий кант по периметру, утопленная филёнка. Лёгкий рельеф без лишнего.",
    photos: [p("p16-2")],
    swatch: p("p16-0"),
  },
  {
    slug: "reyki",
    name: "Рейки",
    category: "milled",
    profile: "rails",
    blurb: "Вертикальные рейки по всей ширине фасада. Выразительная фактура для акцентных зон.",
    photos: [p("p17-1"), p("p17-3")],
    swatch: p("p17-2"),
  },
  {
    slug: "kaprichcho",
    name: "Каприччо",
    category: "milled",
    blurb: "Рамочная фрезеровка с декоративным рисунком по контуру.",
    photos: [p("p18-0")],
    swatch: p("p18-2"),
  },
  {
    slug: "brilon",
    name: "Брилон",
    category: "milled",
    blurb: "Классический профиль с выразительным рельефом рамки.",
    photos: [p("p18-3")],
    swatch: p("p18-4"),
  },
  {
    slug: "albero",
    name: "Альберо",
    category: "milled",
    blurb: "Фрезеровка с объёмной рамкой и мягкими переходами.",
    photos: [p("p19-3"), p("p19-2")],
    swatch: p("p19-0"),
  },
  {
    slug: "vyborka-s-konusom",
    name: "Выборка с конусом",
    category: "milled",
    blurb: "Выборка по периметру с конусным переходом к филёнке.",
    photos: [p("p19-6"), p("p19-5")],
    swatch: p("p19-1"),
  },
  {
    slug: "vyborka",
    name: "Выборка",
    category: "milled",
    blurb: "Простая выборка по контуру: чёткая рамка без лишних деталей.",
    photos: [p("p20-0")],
    swatch: p("p20-1"),
  },
  {
    slug: "les",
    name: "Лес",
    category: "milled",
    blurb: "Фрезеровка «ёлочка»: графичный узор для акцентных поверхностей.",
    photos: [p("p20-2")],
  },

  {
    slug: "ruchka-l",
    name: "Ручка «L» на всю ширину",
    category: "handles",
    blurb: "Интегрированная ручка вдоль всей ширины фасада. Рекомендуется МДФ от 19 мм.",
    photos: [p("p03-1"), p("p03-3")],
    swatch: p("p03-5"),
  },
  {
    slug: "ruchka-a1-90",
    name: "Ручка A1 по центру, угол 90°",
    category: "handles",
    blurb: "Врезная ручка по центру фасада с прямым углом.",
    photos: [p("p04-2")],
    swatch: p("p04-5"),
  },
  {
    slug: "ruchka-a1-45",
    name: "Ручка A1 по центру, угол 45°",
    category: "handles",
    blurb: "Ручка по центру со скосом под 45°: мягче захват, аккуратнее вид.",
    photos: [p("p05-3"), p("p05-1")],
    swatch: p("p05-4"),
  },
  {
    slug: "ruchka-side-90",
    name: "Ручка слева или справа, угол 90°",
    category: "handles",
    blurb: "Ручка у края фасада, прямой угол.",
    photos: [p("p06-1"), p("p06-2")],
    swatch: p("p06-3"),
  },
  {
    slug: "ruchka-side-45",
    name: "Ручка слева или справа, угол 45°",
    category: "handles",
    blurb: "Ручка у края фасада со скосом 45°.",
    photos: [p("p07-1"), p("p07-3")],
    swatch: p("p07-4"),
  },
  {
    slug: "ruchka-v",
    name: "Ручка V",
    category: "handles",
    blurb: "Интегрированная ручка V-образного профиля.",
    photos: [p("p08-0")],
    swatch: p("p08-3"),
  },
  {
    slug: "ruchka-c",
    name: "Ручка C",
    category: "handles",
    blurb: "Интегрированная ручка C-образного профиля.",
    photos: [p("p09-1")],
    swatch: p("p09-0"),
  },
  {
    slug: "ruchka-vnutr-45",
    name: "Ручка внутренняя, спил 45°",
    category: "handles",
    blurb: "Внутренняя ручка со спилом под 45°.",
    photos: [p("p10-1"), p("p10-3")],
    swatch: p("p10-4"),
  },

  {
    slug: "radiusnyy-naruzhnyy",
    name: "Радиусный наружный",
    category: "radius",
    blurb: "Наружный радиусный фасад по вашему радиусу. Допуск по хорде ±2 мм, по высоте ±0,5 мм.",
    photos: [p("p22-0")],
  },
  {
    slug: "radiusnyy-vnutrenniy",
    name: "Радиусный внутренний",
    category: "radius",
    blurb: "Внутренний радиусный фасад для угловых кухонь. Допуск по толщине ±1 мм.",
    photos: [p("p22-1")],
  },

  {
    slug: "stoleshnitsa",
    name: "Столешница",
    category: "worktops",
    blurb: "Столешницы толщиной 10–100 мм, до 2800 мм в длину. Несколько вариантов профиля кромки.",
    photos: [p("p21-0"), p("p21-3")],
    swatch: p("p21-4"),
  },
];

export const facadeBySlug = (slug: string) => facades.find((f) => f.slug === slug);
export const categoryById = (id: CategoryId) => categories.find((c) => c.id === id)!;

export const contacts = {
  phone: "8 (8212) 569-884",
  phoneHref: "tel:+78212569884",
  messengers: "8-904-868-61-63",
  messengersHref: "tel:+79048686163",
  email: "tsentrtsveta@yandex.ru",
  address: "Сыктывкар, ул. Гаражная, 9/5",
} as const;

export const advantages = [
  "Бесплатная доставка по городу",
  "Гарантия 4 года",
  "Без посредников, без переплат",
  "Постоянным клиентам скидка 20%",
] as const;
