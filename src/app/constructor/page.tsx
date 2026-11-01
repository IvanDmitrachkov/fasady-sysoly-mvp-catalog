import type { Metadata } from "next";
import { ConstructorClient } from "@/components/constructor/ConstructorClient";
import { NotePin } from "@/components/demo/Demo";

export const metadata: Metadata = {
  title: "Конструктор кухни",
  description: "Соберите прямую кухню из типовых модулей, выберите фрезеровку и цвет фасадов и получите список фасадов для заказа.",
};

export default function ConstructorPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-3 py-14 sm:px-5 sm:py-16">
      <NotePin id="constructor" className="right-3 top-4" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Конструктор</p>
      <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-tight tracking-tight text-cocoa">
        Соберите <span className="text-taupe">свою кухню</span>
      </h1>
      <p className="mt-5 mb-10 max-w-xl text-lg text-cocoa/70">
        Задайте длину стены, расставьте модули и выберите фасады. Мы получим список фасадов с размерами.
      </p>
      <ConstructorClient />
    </div>
  );
}
