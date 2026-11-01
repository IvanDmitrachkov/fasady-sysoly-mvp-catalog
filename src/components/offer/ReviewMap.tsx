import Link from "next/link";
import { imageNotice, reviewFeatures, statusInfo, type ReviewFeature } from "@/lib/review";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.2em] text-taupe";
const route = reviewFeatures.filter((f) => f.step).sort((a, b) => a.step! - b.step!);

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cocoa/55">{title}</h4>
      <ul className="mt-2 grid gap-1.5 text-sm text-cocoa/80">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className={`mt-[0.45rem] size-1.5 shrink-0 rounded-full ${tone}`} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ f }: { f: ReviewFeature }) {
  const st = statusInfo[f.status];
  return (
    <li id={`review-${f.id}`} className="scroll-mt-24 rounded-[1.5rem] bg-sand p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {f.step && (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cocoa text-sm font-semibold text-white" title="Шаг маршрута">
              {f.step}
            </span>
          )}
          <h3 className="text-lg font-semibold text-cocoa">{f.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {f.step && <span className="rounded-full bg-cocoa px-3 py-1 text-[11px] font-semibold text-white">Обязательно посмотреть</span>}
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${st.badge}`}>{st.label}</span>
        </div>
      </div>

      {f.percent !== undefined && (
        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-cocoa/10"
            role="progressbar"
            aria-valuenow={f.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Готовность: ${f.title}`}
          >
            <div className={`h-full rounded-full ${st.dot}`} style={{ width: `${f.percent}%` }} />
          </div>
          <span className="w-10 text-right text-sm font-semibold tabular-nums text-cocoa">{f.percent}%</span>
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-cocoa/75">{f.what}</p>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <List title="Что посмотреть" items={f.check} tone="bg-taupe" />
        <List title="Что пока не готово" items={f.todo} tone="bg-amber-500" />
        <List title="Что нужно от вас" items={f.ask} tone="bg-cocoa" />
      </div>

      {f.href && (
        <Link
          href={f.href}
          className="mt-5 inline-block rounded-full border border-cocoa/20 px-5 py-2.5 text-sm font-semibold text-cocoa transition-colors hover:border-cocoa hover:bg-cream"
        >
          Открыть →
        </Link>
      )}
    </li>
  );
}

export default function ReviewMap() {
  return (
    <section id="review" className="scroll-mt-24 mb-16" aria-labelledby="review-title">
      <p className={eyebrow}>Карта для заказчика</p>
      <h2 id="review-title" className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-cocoa sm:text-4xl">
        Что посмотреть и насколько это готово
      </h2>
      <p className="mt-4 max-w-2xl text-cocoa/70">
        Сайт сейчас прототип для обсуждения. Ниже все функции, готовность каждой и то, что нужно от вас. Проценты это оценка
        разработчика для ориентира.
      </p>

      <div className="mt-6 rounded-[1.5rem] bg-amber-100 p-5 ring-1 ring-amber-300/70 sm:p-6" role="note">
        <h3 className="text-base font-semibold text-cocoa">{imageNotice.title}</h3>
        <p className="mt-1 text-sm text-cocoa/75">{imageNotice.text}</p>
        <ul className="mt-3 grid gap-1 text-sm text-cocoa/80 sm:grid-cols-2">
          {imageNotice.items.map((i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-amber-600" />
              {i}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-[1.5rem] bg-cocoa p-5 text-white sm:p-7">
        <h3 className="text-lg font-semibold">Маршрут на 10 минут</h3>
        <p className="mt-1 text-sm text-white/65">Если нет времени на всё, пройдите эти шесть шагов по порядку.</p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {route.map((f) => (
            <li key={f.id}>
              <Link
                href={`#review-${f.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/20"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-cocoa">{f.step}</span>
                {f.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-cocoa/70" aria-label="Обозначения">
        {(Object.keys(statusInfo) as (keyof typeof statusInfo)[]).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <span aria-hidden className={`size-2.5 rounded-full ${statusInfo[k].dot}`} />
            <dt className="font-semibold text-cocoa">{statusInfo[k].label}</dt>
            <dd>{statusInfo[k].hint}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 grid gap-4">
        {reviewFeatures.map((f) => (
          <Card key={f.id} f={f} />
        ))}
      </ul>
    </section>
  );
}
