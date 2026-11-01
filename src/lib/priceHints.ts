import type { Facade } from "./catalog";
import { priceFrom } from "./pricing";

const num = (v: number) => v.toLocaleString("ru-RU").replace(/\u00a0| /g, "\u00a0");

/** Короткая подсказка о цене для карточки: розничные цены из прайса, «от» */
export function priceHint(f: Facade): string | null {
  switch (f.category) {
    case "straight":
      return `от ${num(priceFrom.straight)}\u00a0₽/м²`;
    case "milled":
      return `от ${num(priceFrom.milled)}\u00a0₽/м²`;
    case "handles":
      return `от ${num(priceFrom.straight)}\u00a0₽/м² + ручка ${num(priceFrom.handle)}\u00a0₽/м.п.`;
    case "radius":
      return `от ${num(priceFrom.radius)}\u00a0₽/шт`;
    default:
      return null;
  }
}
