import type { Metadata } from "next";
import OrderCalculator from "@/components/calculator/OrderCalculator";
import { NotePin } from "@/components/demo/Demo";

export const metadata: Metadata = {
  title: "Калькулятор заказа",
  description: "Выберите тип фасада, цвет, покрытие и размеры, и сразу узнайте ориентировочную стоимость заказа.",
};

export default function CalculatorPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-3 py-14 sm:px-5 sm:py-16">
      <NotePin id="calculator" className="right-3 top-4" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Калькулятор</p>
      <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-tight tracking-tight text-cocoa">
        Рассчитайте <span className="text-taupe">стоимость заказа</span>
      </h1>
      <p className="mt-5 mb-10 max-w-2xl text-lg text-cocoa/70">
        Добавьте нужные фасады, задайте параметры и количество. Сумма считается сразу, а расчёт можно отправить в заявку или
        скачать в Excel.
      </p>
      <OrderCalculator />
    </div>
  );
}
