"use client";

import { useMemo, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { BASE_PRICE, addonGroups, addons, baseIncluded, baseNotIncluded, plusK, rub, type AddonGroup } from "@/lib/offer";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.2em] text-taupe";

export default function OfferCalculator() {
  /** id → количество; нет ключа — не выбрано */
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [prefill, setPrefill] = useState<{ short: string; comment: string } | null>(null);

  const lines = useMemo(
    () =>
      addons
        .filter((a) => picked[a.id])
        .map((a) => {
          const discount = a.discountWith && picked[a.discountWith.id] ? a.discountWith.amount : 0;
          return { addon: a, qty: picked[a.id], discount, sum: a.price * picked[a.id] - discount };
        }),
    [picked],
  );
  const extras = lines.reduce((s, l) => s + l.sum, 0);
  const total = BASE_PRICE + extras;

  const toggle = (id: string) =>
    setPicked((p) => {
      const next = { ...p };
      const addon = addons.find((x) => x.id === id);
      if (next[id]) {
        delete next[id];
        // без основной доработки зависимые не нужны
        for (const dep of addons) if (dep.requires === id) delete next[dep.id];
      } else {
        next[id] = 1;
        // варианты «на выбор»: остальные из группы снимаются
        if (addon?.exclusive) for (const o of addons) if (o.exclusive === addon.exclusive && o.id !== id) delete next[o.id];
        if (addon?.requires && !next[addon.requires]) next[addon.requires] = 1;
      }
      return next;
    });
  const setQty = (id: string, qty: number, max: number) =>
    setPicked((p) => {
      const next = { ...p };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, max);
      return next;
    });

  const order = () =>
    setPrefill({
      short: `Доработки сайта: итого ${rub(total)}`,
      comment: [
        `Минимум: ${rub(BASE_PRICE)}`,
        ...lines.map((l) => `${l.addon.title}${l.addon.unit ? ` × ${l.qty}` : ""}: ${rub(l.sum)}`),
        `Итого: ${rub(total)}`,
      ].join("\n"),
    });

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="grid gap-5">
          <section className="rounded-[1.75rem] bg-cocoa p-7 text-white sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand/70">Минимум для запуска</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">до {rub(BASE_PRICE)}</p>
            <p className="mt-3 max-w-xl text-white/70">
              Всё, что есть на сайте сейчас, плюс то, без чего его нельзя публиковать. Остальное добавляется по желанию и в
              любой момент.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-sand">Входит</h3>
                <ul className="mt-2 space-y-2 text-sm text-white/80">
                  {baseIncluded.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-sand">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-sand">Не входит</h3>
                <ul className="mt-2 space-y-2 text-sm text-white/60">
                  {baseNotIncluded.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span>–</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {(Object.keys(addonGroups) as AddonGroup[]).map((g) => (
            <section key={g} className="rounded-[1.75rem] bg-sand p-6 sm:p-8">
              <p className={eyebrow}>{addonGroups[g]}</p>
              <ul className="mt-4 divide-y divide-cocoa/10">
                {addons
                  .filter((a) => a.group === g)
                  .map((a) => {
                    const qty = picked[a.id] ?? 0;
                    return (
                      <li key={a.id} id={a.id} className="scroll-mt-24 py-5 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={qty > 0}
                            onChange={() => toggle(a.id)}
                            aria-label={`Добавить: ${a.title}`}
                            className="mt-1.5 size-5 shrink-0 accent-[#a98a6a]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                              <h3 className="text-lg font-semibold text-cocoa">{a.title}</h3>
                              <span className="whitespace-nowrap text-lg font-bold text-cocoa">
                                {plusK(a.price - (a.discountWith && picked[a.discountWith.id] ? a.discountWith.amount : 0))}
                                {a.unit ? <span className="text-sm font-medium text-cocoa/60"> за {a.unit.label}</span> : null}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-cocoa/75">{a.what}</p>
                            {a.discountWith && picked[a.discountWith.id] && <p className="mt-1 text-xs font-semibold text-taupe">Со скидкой {plusK(a.discountWith.amount).replace("+", "")}: калькулятор уже выбран</p>}
                            {a.exclusive && <p className="mt-1 text-xs font-semibold text-taupe">Один из трёх вариантов: выбор заменяет остальные</p>}
                            {a.requires && <p className="mt-1 text-xs font-semibold text-taupe">Нужна «{addons.find((x) => x.id === a.requires)?.title}», добавится сама</p>}
                            <p className="mt-2 text-xs text-cocoa/60">
                              <span className="font-semibold">От вас:</span> {a.needs}
                            </p>
                            {a.risk && (
                              <p className="mt-1 text-xs text-cocoa/60">
                                <span className="font-semibold">Важно:</span> {a.risk}
                              </p>
                            )}
                            {a.unit && qty > 0 && (
                              <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-cream px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => setQty(a.id, qty - 1, a.unit!.max)}
                                  aria-label="Меньше"
                                  className="size-8 rounded-full text-lg font-semibold hover:bg-sand"
                                >
                                  −
                                </button>
                                <span className="min-w-16 text-center text-sm font-semibold tabular-nums">
                                  {qty} шт.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(a.id, qty + 1, a.unit!.max)}
                                  disabled={qty >= a.unit.max}
                                  aria-label="Больше"
                                  className="size-8 rounded-full text-lg font-semibold hover:bg-sand disabled:opacity-35"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>

        <aside className="rounded-[1.75rem] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(47,38,31,0.45)] ring-1 ring-cocoa/10 lg:sticky lg:top-24">
          <p className={eyebrow}>Ваш вариант</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa/70">Минимум для запуска</dt>
              <dd className="whitespace-nowrap font-semibold">{rub(BASE_PRICE)}</dd>
            </div>
            {lines.map((l) => (
              <div key={l.addon.id} className="flex justify-between gap-4">
                <dt className="text-cocoa/70">
                  {l.addon.title}
                  {l.addon.unit ? ` × ${l.qty}` : ""}
                  {l.discount ? ` (скидка ${plusK(l.discount).replace("+", "−")})` : ""}
                </dt>
                <dd className="whitespace-nowrap font-semibold">+{rub(l.sum)}</dd>
              </div>
            ))}
          </dl>
          {lines.length === 0 && <p className="mt-3 text-sm text-cocoa/55">Отметьте доработки слева, и цена пересчитается.</p>}
          <div className="mt-5 border-t border-cocoa/10 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">Итого</span>
              <span className="text-3xl font-semibold tracking-tight">{rub(total)}</span>
            </div>
          </div>
          <a
            href="#offer-order"
            onClick={order}
            className="mt-5 block rounded-full bg-taupe px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-cocoa"
          >
            Обсудить этот вариант
          </a>
          <p className="mt-3 text-xs leading-relaxed text-cocoa/55">
            Цены ориентировочные и уточняются после получения материалов (чертежи, фото, тексты, прайс).
          </p>
        </aside>
      </div>

      <section id="offer-order" className="mt-12 grid gap-10 rounded-[2rem] bg-sand p-6 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-cocoa">Обсудить доработки</h2>
          <p className="mt-4 max-w-sm text-cocoa/70">Выбранный вариант подставится в заявку, сроки и детали согласуем по телефону.</p>
        </div>
        <div className="rounded-[1.5rem] bg-paper p-6 sm:p-8">
          <LeadForm key={prefill?.short ?? "empty"} facade={prefill?.short ?? ""} comment={prefill?.comment ?? ""} />
        </div>
      </section>
    </div>
  );
}
