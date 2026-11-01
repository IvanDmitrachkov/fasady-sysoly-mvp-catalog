import type { Metadata } from "next";
import OfferCalculator from "@/components/offer/OfferCalculator";
import ReviewMap from "@/components/offer/ReviewMap";

export const metadata: Metadata = {
  title: "Доработки и стоимость",
  description: "Минимальный запуск сайта и доработки, которые можно добавлять по мере необходимости.",
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-14 sm:px-5 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Предложение</p>
      <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-tight tracking-tight text-cocoa">
        Запуск сайта и <span className="text-taupe">доработки</span>
      </h1>
      <p className="mt-5 mb-10 max-w-2xl text-lg text-cocoa/70">
        Начните с минимума и добавляйте только то, что нужно сейчас. Каждая доработка независима, их можно подключать по
        одной, когда появятся материалы и задачи.
      </p>
      <ReviewMap />
      <OfferCalculator />
    </div>
  );
}
