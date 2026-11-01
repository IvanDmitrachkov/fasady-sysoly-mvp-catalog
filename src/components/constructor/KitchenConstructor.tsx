"use client";

import { useEffect, useMemo, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import KitchenViewer, { type Mood } from "./KitchenViewer";
import {
  WALL_RANGE,
  WALL_STEP,
  defaultProject,
  facadeStyles,
  facadeSummary,
  kindLabels,
  makeColumn,
  summaryText,
  usedWidth,
  widthOptions,
  type Column,
  type ColumnKind,
  type FacadeStyle,
  type Project,
} from "@/lib/kitchen";
import { finishes, swatchById, swatches } from "@/lib/palette";
import { profiles } from "@/lib/profiles";

const STORAGE_KEY = "fasady-kitchen-v1";

function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProject();
    const p = JSON.parse(raw) as Project;
    const okStyle = (s: FacadeStyle) => s && s.profile in profiles && swatches.some((x) => x.id === s.swatchId);
    const okCol = (c: Column) =>
      c && c.kind in kindLabels && typeof c.width === "number" && (!c.override || okStyle(c.override));
    if (typeof p.wall === "number" && okStyle(p.style) && Array.isArray(p.columns) && p.columns.every(okCol)) return p;
  } catch {
    /* повреждённое сохранение: начинаем с шаблона */
  }
  return defaultProject();
}

const label = "text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60";
const chip = (active: boolean, disabled = false) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
    active ? "border-cocoa bg-cocoa text-white" : "border-cocoa/15 hover:border-cocoa"
  } ${disabled ? "pointer-events-none opacity-35" : ""}`;

export default function KitchenConstructor() {
  const [project, setProject] = useState<Project>(loadProject);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("day");
  const [prefill, setPrefill] = useState<{ short: string; comment: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* хранилище недоступно: проект живёт до перезагрузки */
    }
  }, [project]);

  const used = usedWidth(project.columns);
  const free = project.wall - used;
  const selected = project.columns.find((c) => c.id === selectedId) ?? null;
  const rows = useMemo(() => facadeSummary(project), [project]);
  const total = rows.reduce((s, r) => s + r.count, 0);

  const patchColumn = (id: string, patch: Partial<Column>) =>
    setProject((p) => ({ ...p, columns: p.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  const addColumn = (kind: ColumnKind) => {
    const width = [...widthOptions[kind]].reverse().find((w) => w <= free);
    if (!width) return;
    const col = makeColumn(kind, width);
    setProject((p) => ({ ...p, columns: [...p.columns, col] }));
    setSelectedId(col.id);
  };

  const removeColumn = (id: string) => {
    setProject((p) => ({ ...p, columns: p.columns.filter((c) => c.id !== id) }));
    setSelectedId(null);
  };

  const moveColumn = (id: string, dir: -1 | 1) =>
    setProject((p) => {
      const i = p.columns.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.columns.length) return p;
      const columns = [...p.columns];
      [columns[i], columns[j]] = [columns[j], columns[i]];
      return { ...p, columns };
    });

  const changeKind = (c: Column, kind: ColumnKind) => {
    const options = widthOptions[kind];
    const room = free + c.width;
    const width = options.includes(c.width) && c.width <= room ? c.width : ([...options].reverse().find((w) => w <= room) ?? c.width);
    patchColumn(c.id, { kind, width, upper: kind === "tall" ? false : c.upper || c.kind === "tall" });
  };

  const setStyle = (patch: Partial<Project["style"]>) => setProject((p) => ({ ...p, style: { ...p.style, ...patch } }));

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div
          className={`relative h-[420px] overflow-hidden rounded-[1.75rem] bg-gradient-to-b transition-colors duration-500 sm:h-[520px] lg:sticky lg:top-24 lg:h-[640px] ${
            mood === "day" ? "from-sand to-[#d9cdb9]" : "from-[#3b322b] to-[#241e19]"
          }`}
        >
          <KitchenViewer project={project} selectedId={selectedId} mood={mood} onSelect={setSelectedId} />
          <div className="absolute right-4 top-4 inline-flex rounded-full bg-cream/85 p-1 backdrop-blur" role="radiogroup" aria-label="Освещение">
            {([["day", "День"], ["evening", "Вечер"]] as const).map(([id, name]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={mood === id}
                onClick={() => setMood(id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mood === id ? "bg-cocoa text-white" : "text-cocoa/70 hover:text-cocoa"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-cream/80 px-3 py-1 text-[11px] font-medium text-cocoa/70 backdrop-blur">
            Потяните, чтобы повернуть · нажмите на модуль, чтобы выбрать
          </span>
        </div>

        <div className="grid gap-6">
          <section className="rounded-[1.5rem] bg-sand p-6">
            <label className="block">
              <span className="mb-2 flex items-baseline justify-between">
                <span className={label}>Длина стены</span>
                <span className="text-sm font-semibold tabular-nums">{project.wall} мм</span>
              </span>
              <input
                type="range"
                className="range w-full"
                min={WALL_RANGE[0]}
                max={WALL_RANGE[1]}
                step={WALL_STEP}
                value={project.wall}
                onChange={(e) => setProject((p) => ({ ...p, wall: Number(e.target.value) }))}
              />
            </label>
            <p className={`mt-3 text-sm ${free < 0 ? "font-semibold text-red-700" : "text-cocoa/65"}`}>
              {free < 0 ? `Модули не помещаются: лишние ${-free} мм` : `Занято ${used} мм, свободно ${free} мм`}
            </p>
          </section>

          <section className="rounded-[1.5rem] bg-sand p-6">
            <h2 className={label}>Фасады всей кухни</h2>
            <StylePicker value={project.style} onChange={(s) => setStyle(s)} />
            <div className="mt-5 inline-flex rounded-full border border-cocoa/15 bg-cream p-1" role="radiogroup" aria-label="Покрытие">
              {finishes.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={f.id === project.style.finish}
                  onClick={() => setStyle({ finish: f.id })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    f.id === project.style.finish ? "bg-cocoa text-white" : "text-cocoa/70 hover:text-cocoa"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] bg-sand p-6">
            <h2 className={label}>Модули слева направо</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.columns.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={c.id === selectedId}
                    onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                    className={chip(c.id === selectedId)}
                  >
                    {i + 1}. {shortKind(c.kind)} {c.width}
                  </button>
                </li>
              ))}
              {project.columns.length === 0 && <li className="text-sm text-cocoa/60">Добавьте первый модуль</li>}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(kindLabels) as ColumnKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => addColumn(k)}
                  disabled={!widthOptions[k].some((w) => w <= free)}
                  className="rounded-full bg-taupe px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cocoa disabled:pointer-events-none disabled:opacity-35"
                >
                  + {kindLabels[k]}
                </button>
              ))}
            </div>

            {selected && (
              <div className="mt-6 grid gap-5 border-t border-cocoa/10 pt-5">
                <div>
                  <div className={label}>Тип</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Object.keys(kindLabels) as ColumnKind[]).map((k) => (
                      <button key={k} type="button" onClick={() => changeKind(selected, k)} className={chip(selected.kind === k)}>
                        {kindLabels[k]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className={label}>Ширина, мм</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {widthOptions[selected.kind].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => patchColumn(selected.id, { width: w })}
                        className={chip(selected.width === w, w - selected.width > free)}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                {selected.kind !== "tall" && (
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={selected.upper}
                      onChange={(e) => patchColumn(selected.id, { upper: e.target.checked })}
                      className="size-4 accent-[#a98a6a]"
                    />
                    Навесной шкаф сверху
                  </label>
                )}
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={!!selected.override}
                    onChange={(e) => patchColumn(selected.id, { override: e.target.checked ? { ...project.style } : undefined })}
                    className="size-4 accent-[#a98a6a]"
                  />
                  Свой фасад у этого модуля
                </label>
                {selected.override && (
                  <StylePicker value={selected.override} onChange={(s) => patchColumn(selected.id, { override: { ...selected.override!, ...s } })} />
                )}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => moveColumn(selected.id, -1)} className={chip(false)} aria-label="Сдвинуть влево">
                    ← Влево
                  </button>
                  <button type="button" onClick={() => moveColumn(selected.id, 1)} className={chip(false)} aria-label="Сдвинуть вправо">
                    Вправо →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeColumn(selected.id)}
                    className="rounded-full border border-red-700/30 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-700 hover:text-white"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="relative mt-12 rounded-[2rem] bg-sand p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-cocoa">Список фасадов</h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-cocoa/65">Добавьте модули, и здесь появится список фасадов с размерами.</p>
        ) : (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.12em] text-cocoa/55">
                    <th className="pb-3 font-semibold">Фасад</th>
                    <th className="pb-3 font-semibold">Цвет</th>
                    <th className="pb-3 font-semibold">Размер, мм</th>
                    <th className="pb-3 text-right font-semibold">Шт</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/10">
                  {rows.map((r) => (
                    <tr key={`${r.name}${r.swatch}${r.w}${r.h}`}>
                      <td className="py-3 font-medium">{r.name}</td>
                      <td className="py-3 text-cocoa/70">
                        {r.swatch}, {r.finish}
                      </td>
                      <td className="py-3 tabular-nums">
                        {r.w} × {r.h}
                      </td>
                      <td className="py-3 text-right tabular-nums">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-cocoa/55">
              Размеры предварительные: у фасадов учтён зазор 3 мм, габариты модулей условные. Точные размеры и цвет
              уточнит менеджер по замеру.
            </p>
            <a
              href="#constructor-order"
              onClick={() => setPrefill(summaryText(project, rows))}
              className="mt-6 inline-block rounded-full bg-taupe px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-cocoa"
            >
              Заказать эту кухню ({total} фасадов)
            </a>
          </>
        )}
      </section>

      <section id="constructor-order" className="mt-12 grid gap-10 rounded-[2rem] bg-sand p-6 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-cocoa">Рассчитать стоимость</h2>
          <p className="mt-4 max-w-sm text-cocoa/70">Список фасадов подставится в заявку. Остальное уточним по телефону.</p>
        </div>
        <div className="rounded-[1.5rem] bg-paper p-6 sm:p-8">
          <LeadForm key={prefill?.short ?? "empty"} facade={prefill?.short ?? ""} comment={prefill?.comment ?? ""} />
        </div>
      </section>
    </div>
  );
}

function shortKind(kind: ColumnKind) {
  return kind === "doors" ? "Дверцы" : kind === "drawers" ? "Ящики" : "Пенал";
}

function StylePicker({ value, onChange }: { value: FacadeStyle; onChange: (patch: Partial<FacadeStyle>) => void }) {
  return (
    <div className="mt-3 grid gap-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Фрезеровка">
        {facadeStyles.map((f) => (
          <button
            key={f.profile}
            type="button"
            role="radio"
            aria-checked={f.profile === value.profile}
            onClick={() => onChange({ profile: f.profile })}
            className={chip(f.profile === value.profile)}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Цвет">
          {swatches.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={s.id === value.swatchId}
              aria-label={`${s.code} ${s.name}`}
              title={`${s.code} · ${s.name}`}
              onClick={() => onChange({ swatchId: s.id })}
              className={`size-8 rounded-full border transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa ${
                s.id === value.swatchId ? "scale-110 border-cocoa ring-2 ring-taupe ring-offset-2 ring-offset-sand" : "border-black/15"
              }`}
              style={{ background: s.hex }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-cocoa/55">
          {swatchById(value.swatchId).code} · {swatchById(value.swatchId).name}. Цвет на экране условный.
        </p>
      </div>
    </div>
  );
}
