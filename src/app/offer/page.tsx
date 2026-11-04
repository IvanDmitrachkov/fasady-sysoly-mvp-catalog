import type { Metadata } from "next";
import ImplementationPlan from "@/components/offer/ImplementationPlan";

export const metadata: Metadata = {
  title: "План внедрения",
  description: "Этапы запуска сайта: каталог фасадов, PDF-каталог и калькулятор стоимости.",
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-14 sm:px-5 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Проект</p>
      <h1 className="mt-3 text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-tight tracking-tight text-cocoa">
        План <span className="text-taupe">внедрения</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-cocoa/70">
        Согласованный порядок работ для боевого сайта: сначала каталог и заявки, затем PDF-каталог и калькулятор.
      </p>
      <ImplementationPlan />
    </div>
  );
}
