"use client";

import { useMemo, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import CalcPreview from "./CalcPreview";
import FacadeThumb from "./FacadeThumb";
import { exportExcel } from "./exportExcel";
import { PRICES_ARE_PLACEHOLDER, isVisible, newRow, newRowId, optionOf, params, sizeLimits, totals, type Param, type Row } from "@/lib/pricing";
import { rub } from "@/lib/offer";
import { advantages } from "@/lib/catalog";

const label = "text-xs font-semibold uppercase tracking-[0.14em] text-cocoa/60";
const input =
  "w-full rounded-2xl border border-cocoa/15 bg-cream px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-taupe focus:bg-paper";

const area = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

type Totals = ReturnType<typeof totals>;

export default function OrderCalculator() {
  const [rows, setRows] = useState<Row[]>(() => [newRow("first")]);
  const [activeId, setActiveId] = useState("first");
  const [prefill, setPrefill] = useState<{ short: string; comment: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const t = useMemo(() => totals(rows), [rows]);
  const activeIndex = Math.max(0, rows.findIndex((r) => r.id === activeId));
  const active = rows[activeIndex];

  const patch = (id: string, change: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...change } : r)));
  const setValue = (id: string, key: string, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, values: { ...r.values, [key]: value } } : r)));
  const num = (raw: string): number | "" => (raw === "" ? "" : Math.max(0, Math.floor(Number(raw)) || 0));

  const add = () => {
    const row = newRow();
    setRows((rs) => [...rs, row]);
    setActiveId(row.id);
  };
  const duplicate = (row: Row) => {
    const copy: Row = { ...row, id: newRowId(), values: { ...row.values } };
    setRows((rs) => {
      const i = rs.findIndex((r) => r.id === row.id);
      return [...rs.slice(0, i + 1), copy, ...rs.slice(i + 1)];
    });
    setActiveId(copy.id);
  };
  const remove = (id: string) => {
    if (rows.length <= 1) {
      const fresh = newRow();
      setRows([fresh]);
      setActiveId(fresh.id);
      return;
    }
    setRows((rs) => rs.filter((r) => r.id !== id));
  };

  const order = () => {
    const lines = rows.map((row, i) => {
      const c = t.calcs[i];
      const parts = params.filter((p) => isVisible(p, row.values)).map((p) => optionOf(p, row.values).label);
      return `${i + 1}. ${parts.join(", ")}, ${c.width}×${c.height} мм × ${c.qty} шт = ${rub(c.total)}`;
    });
    const header = `Калькулятор заказа. Итого ориентировочно ${rub(t.total)} (окончательно после замера).`;
    let comment = [header, ...lines].join("\n");
    if (comment.length > 1900) comment = comment.slice(0, 1890) + "\n…";
    setPrefill({ short: `Заказ по калькулятору: ${rows.length} поз., ${t.pieces} шт., ≈ ${rub(t.total)}`, comment });
  };

  const download = async () => {
    setExporting(true);
    try {
      await exportExcel(rows);
    } finally {
      setExporting(false);
    }
  };

  const summary = <Summary t={t} count={rows.length} exporting={exporting} onOrder={order} onDownload={download} />;

  return (
    <div>
      {PRICES_ARE_PLACEHOLDER && (
        <p className="mb-6 rounded-2xl bg-amber-100 px-5 py-3 text-sm text-cocoa ring-1 ring-amber-300/70">
          Демо-версия: цены условные, реальный прайс внесём после получения от заказчика. Суммы не являются предложением.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_26rem] lg:items-start">
        {/* на телефоне просмотр сверху, на компьютере закреплён справа */}
        <aside className="order-first grid gap-4 lg:sticky lg:top-24 lg:order-none lg:col-start-2 lg:row-start-1">
          <CalcPreview row={active} calc={t.calcs[activeIndex]} index={activeIndex} />
          <div className="hidden lg:block">{summary}</div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-1">
          <ol className="grid gap-4">
            {rows.map((row, i) => {
              const c = t.calcs[i];
              const isActive = row.id === active.id;
              return (
                <li
                  key={row.id}
                  onClick={() => setActiveId(row.id)}
                  onFocusCapture={() => setActiveId(row.id)}
                  className={`@container rounded-[1.75rem] bg-sand p-5 transition-shadow sm:p-7 ${isActive ? "ring-2 ring-taupe" : "ring-1 ring-transparent hover:ring-cocoa/15"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-3 text-lg font-semibold text-cocoa">
                      <span className="grid size-8 place-items-center rounded-full bg-cocoa text-sm text-white">{i + 1}</span>
                      Фасад
                      {isActive && <span className="rounded-full bg-taupe/15 px-3 py-0.5 text-xs font-semibold text-taupe">в просмотре</span>}
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicate(row);
                        }} className="rounded-full border border-cocoa/15 px-4 py-2 font-medium transition-colors hover:border-cocoa">
                        Дублировать
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(row.id);
                        }}
                        aria-label={`Удалить фасад ${i + 1}`}
                        className="rounded-full border border-cocoa/15 px-4 py-2 font-medium text-cocoa/70 transition-colors hover:border-red-700 hover:text-red-700"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 @lg:grid-cols-[8.5rem_1fr]">
                    <FacadeThumb row={row} calc={c} />
                    <div className="grid gap-4 @xl:grid-cols-2">
                    {params
                      .filter((p) => isVisible(p, row.values))
                      .map((p) => (
                        <Field key={p.id} param={p} row={row} onChange={(v) => setValue(row.id, p.id, v)} />
                      ))}
                    <Size
                      id={`w-${row.id}`}
                      label="Ширина, мм"
                      hint={`до ${sizeLimits.width[1]}`}
                      value={row.width}
                      error={c.errors.width}
                      onChange={(v) => patch(row.id, { width: num(v) })}
                    />
                    <Size
                      id={`h-${row.id}`}
                      label="Высота, мм"
                      hint={`до ${sizeLimits.height[1]}`}
                      value={row.height}
                      error={c.errors.height}
                      onChange={(v) => patch(row.id, { height: num(v) })}
                    />
                    <Size id={`q-${row.id}`} label="Количество, шт" value={row.qty} error={c.errors.qty} onChange={(v) => patch(row.id, { qty: num(v) })} />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-cocoa/10 pt-4">
                    <p className="text-sm text-cocoa/65">
                      {area(c.area)} м²
                      {c.billedArea > c.area ? ` (в расчёте ${area(c.billedArea)} м²)` : ""} · {rub(c.rate)}/м² · {rub(c.unit)} за штуку · срок {c.days} дн.
                    </p>
                    <p className="text-xl font-semibold tabular-nums text-cocoa">{rub(c.total)}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={add}
            className="mt-4 w-full rounded-full border border-dashed border-cocoa/30 px-6 py-4 text-sm font-semibold text-cocoa transition-colors hover:border-cocoa hover:bg-sand"
          >
            + Добавить ещё фасад
          </button>

          <div className="mt-6 lg:hidden">{summary}</div>
        </div>
      </div>

      <section id="calc-order" className="mt-12 grid gap-10 rounded-[2rem] bg-sand p-6 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-cocoa">Отправить заказ</h2>
          <p className="mt-4 max-w-sm text-cocoa/70">Список фасадов и сумма подставятся в заявку. Менеджер уточнит детали и сделает замер.</p>
        </div>
        <div className="rounded-[1.5rem] bg-paper p-6 sm:p-8">
          <LeadForm key={prefill?.short ?? "empty"} facade={prefill?.short ?? ""} comment={prefill?.comment ?? ""} />
        </div>
      </section>
    </div>
  );
}

function Summary({
  t,
  count,
  exporting,
  onOrder,
  onDownload,
}: {
  t: Totals;
  count: number;
  exporting: boolean;
  onOrder: () => void;
  onDownload: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] bg-cocoa p-6 text-white" aria-label="Итог">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand/70">Ваш заказ</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{rub(t.total)}</p>
      <p className="mt-2 text-sm text-white/65">
        {count} {count === 1 ? "позиция" : "позиций"} · {t.pieces} шт. · {area(t.area)} м²
      </p>
      <p className="mt-1 text-sm text-white/85">
        Срок изготовления: <span className="font-semibold">{t.days} дн.</span>
      </p>
      {!t.valid && <p className="mt-3 text-sm font-semibold text-amber-300">Исправьте поля с ошибками: суммы посчитаны по допустимым пределам.</p>}
      <div className="mt-5 grid gap-3">
        <a
          href="#calc-order"
          onClick={onOrder}
          className="rounded-full bg-white px-6 py-3.5 text-center text-sm font-semibold text-cocoa transition-colors hover:bg-sand"
        >
          Заказать
        </a>
        <button
          type="button"
          onClick={onDownload}
          disabled={exporting}
          className="rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          {exporting ? "Готовим файл…" : "Распечатать (Excel)"}
        </button>
      </div>
      <ul className="mt-5 space-y-1.5 border-t border-white/15 pt-4 text-xs text-white/65">
        {advantages.slice(0, 3).map((a) => (
          <li key={a} className="flex gap-2">
            <span className="text-sand">✓</span>
            {a}
          </li>
        ))}
      </ul>
      <ul className="mt-4 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-white/55">
        <li>Розничная цена. Окончательная стоимость определяется после замера и уточнения параметров.</li>
        <li>В стоимость входят изготовление, расходные материалы, краска и лак; подготовка и покраска торцов бесплатно.</li>
        <li>Площадь считается от 0,5 м² на фасад, кроме белого RAL 9003.</li>
        <li>Цвет по каталогу RAL, NCS, Wood Color, Color System. Фрезеровки вне каталога, стекло, патина, рисунок и сложные формы обсуждаются отдельно.</li>
        <li>Бесплатная доставка по городу: вторник и четверг, 13:00–15:00.</li>
      </ul>
    </section>
  );
}

function Field({ param, row, onChange }: { param: Param; row: Row; onChange: (v: string) => void }) {
  const id = `${param.id}-${row.id}`;
  const current = optionOf(param, row.values);

  // главный выбор показываем кнопками: быстрее и нагляднее, чем выпадающий список
  if (param.id === "type") {
    return (
      <div className="@xl:col-span-2">
        <span className={label}>{param.label}</span>
        <div className="mt-1.5 inline-flex w-full rounded-full border border-cocoa/15 bg-cream p-1" role="radiogroup" aria-label={param.label}>
          {param.options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={o.id === current.id}
              onClick={() => onChange(o.id)}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                o.id === current.id ? "bg-cocoa text-white" : "text-cocoa/70 hover:text-cocoa"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={label}>
        {param.label}
      </label>
      <div className="relative mt-1.5">
        {current.hex && <span aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 rounded-full border border-black/15" style={{ background: current.hex }} />}
        <select id={id} value={current.id} onChange={(e) => onChange(e.target.value)} className={`${input} ${current.hex ? "pl-10" : ""}`}>
          {param.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Size({
  id,
  label: text,
  hint,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number | "";
  error?: string;
  onChange: (raw: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        placeholder={hint}
        className={`${input} mt-1.5 tabular-nums ${error ? "border-red-700 focus:border-red-700" : ""}`}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
