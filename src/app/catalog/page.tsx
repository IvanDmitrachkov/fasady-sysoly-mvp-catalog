import type { Metadata } from "next";
import { CatalogGrid } from "@/components/CatalogGrid";
import { NotePin } from "@/components/demo/Demo";
import { facades } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог фасадов",
  description: "МДФ фасады: прямые, с фрезеровкой, с интегрированными ручками, радиусные. Просмотр в 3D, любые цвета.",
};

export default function CatalogPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-3 py-14 sm:px-5 sm:py-16">
      <NotePin id="catalog" className="right-3 top-4" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Каталог</p>
      <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-tight tracking-tight text-cocoa">
        Каталог <span className="text-taupe">фасадов</span>
      </h1>
      <p className="mt-5 mb-10 max-w-xl text-lg text-cocoa/70">
        Толщина 10–40 мм, высота до 2750 мм, ширина до 2050 мм. Цвет по RAL, NCS, Wood Color, Color System или по
        образцу.
      </p>
      <CatalogGrid items={facades} />
    </div>
  );
}
