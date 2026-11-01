import type { Metadata } from "next";
import KitchenTryOn from "@/components/scene/KitchenTryOn";
import { NotePin } from "@/components/demo/Demo";

export const metadata: Metadata = {
  title: "Примерить на кухне",
  description: "Подберите цвет фасадов, столешницы и фартука и сразу увидьте кухню целиком.",
};

export default function KitchenPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-3 py-14 sm:px-5 sm:py-16">
      <NotePin id="tryon" className="right-3 top-4" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Примерочная</p>
      <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-tight tracking-tight text-cocoa">
        Примерить <span className="text-taupe">на кухне</span>
      </h1>
      <p className="mt-5 mb-10 max-w-xl text-lg text-cocoa/70">
        Выберите цвет фасадов, столешницу и фартук. Свет и тени на фото остаются настоящими.
      </p>
      <KitchenTryOn />
    </div>
  );
}
