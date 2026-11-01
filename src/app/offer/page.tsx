import type { Metadata } from "next";
import ReviewMap from "@/components/offer/ReviewMap";

export const metadata: Metadata = {
  title: "Доработки",
  description: "Доработки, которые можно добавлять по мере необходимости.",
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-14 sm:px-5 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">Предложение</p>
      <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-tight tracking-tight text-cocoa">
        Что можно <span className="text-taupe">доработать</span>
      </h1>
      <p className="mt-5 mb-10 max-w-2xl text-lg text-cocoa/70">
        Дополнительные модули можно подключать по одному, когда появятся материалы и задачи. Это доп. модули, они
        оплачиваются отдельно.
      </p>
      <ReviewMap />
    </div>
  );
}
