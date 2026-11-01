"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { finishes, groupLabels, swatchById, swatches, type Finish, type Swatch, type SwatchGroup } from "@/lib/palette";

const tabs: SwatchGroup[] = ["RAL", "NCS", "Wood", "ColorSystem", "Custom"];

/** Семейства оттенков считаются из HEX, поэтому новые цвета попадают в фильтр сами */
const families = ["Белые", "Серые", "Чёрные", "Бежевые и жёлтые", "Коричневые", "Красные и розовые", "Зелёные", "Синие", "Фиолетовые"] as const;
type Family = (typeof families)[number];

function familyOf(hex: string): Family {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.12) return l > 0.85 ? "Белые" : l < 0.18 ? "Чёрные" : "Серые";
  let h = 0;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 15 || h >= 345) return "Красные и розовые";
  if (h < 70) return l < 0.4 ? "Коричневые" : "Бежевые и жёлтые";
  if (h < 170) return "Зелёные";
  if (h < 260) return "Синие";
  return h < 345 ? "Фиолетовые" : "Красные и розовые";
}

const RECENT_KEY = "fasady-recent-colors";
const RECENT_EVENT = "fasady-recent-colors";
const BIG_LIST = 24;

const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
const subscribeRecent = (cb: () => void) => {
  window.addEventListener(RECENT_EVENT, cb);
  return () => window.removeEventListener(RECENT_EVENT, cb);
};
const parseRecent = (raw: string): string[] => {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((id) => swatches.some((s) => s.id === id && s.group !== "Custom")) : [];
  } catch {
    return [];
  }
};

type Props = {
  value: string | null;
  onChange: (id: string) => void;
  /** Покрытие: у глянцевых плиток рисуется блик */
  finish?: Finish;
  /** Текст для «Подбор» */
  note?: string;
  onNoteChange?: (note: string) => void;
  /** Показать «Как на фото» (value === null) */
  onReset?: () => void;
  /** Показывать вкладку «Подбор» (в примерочной на фото она не нужна) */
  allowCustom?: boolean;
  /** Фон родителя, чтобы кольцо выбора не выбивалось */
  ringOffset?: "cream" | "sand";
  label?: string;
};

function Tile({ s, active, finish, onClick, offset }: { s: Swatch; active: boolean; finish: Finish; onClick: () => void; offset: string }) {
  const wood = s.grain
    ? "repeating-linear-gradient(92deg, rgba(0,0,0,.14) 0 1px, transparent 1px 5px), repeating-linear-gradient(88deg, rgba(255,255,255,.12) 0 2px, transparent 2px 9px)"
    : "";
  const gloss = finish === "gloss" ? "linear-gradient(135deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 42%)" : "";
  const bg = [gloss, wood].filter(Boolean).concat(s.hex).join(", ");
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={`${s.code} ${s.name}`}
      title={`${s.code} · ${s.name}`}
      onClick={onClick}
      className="group flex w-[4.25rem] flex-col items-center gap-1.5 text-center focus-visible:outline-none"
    >
      <span
        className={`block size-14 rounded-xl border transition-transform duration-200 group-hover:scale-105 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-cocoa ${
          active ? `border-cocoa ring-2 ring-taupe ring-offset-2 ${offset}` : "border-black/15"
        }`}
        style={{ background: bg }}
      />
      <span className={`text-[10px] leading-tight ${active ? "font-semibold text-cocoa" : "text-cocoa/60"}`}>
        {s.group === "Wood" ? s.name : s.code.replace(/^(RAL|NCS) /, "")}
      </span>
    </button>
  );
}

export default function ColorPicker({
  value,
  onChange,
  finish = "matte",
  note = "",
  onNoteChange,
  onReset,
  allowCustom = true,
  ringOffset = "cream",
  label = "Цвет",
}: Props) {
  const current = value ? swatchById(value) : null;
  const visibleTabs = tabs.filter((t) => allowCustom || t !== "Custom");
  const [tab, setTab] = useState<SwatchGroup>(current?.group ?? "RAL");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<Family | null>(null);
  const recentRaw = useSyncExternalStore(subscribeRecent, readRecent, () => "[]");
  const recent = useMemo(() => parseRecent(recentRaw), [recentRaw]);
  const offset = ringOffset === "sand" ? "ring-offset-sand" : "ring-offset-cream";

  const pick = (id: string) => {
    onChange(id);
    if (swatchById(id).group === "Custom") return;
    const next = [id, ...recent.filter((x) => x !== id)].slice(0, 8);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(RECENT_EVENT));
    } catch {
      /* хранилище недоступно: «Недавние» не сохраняются */
    }
  };

  const searching = query.trim().length > 0;
  const groupAll = useMemo(() => swatches.filter((s) => s.group === tab), [tab]);
  const big = groupAll.length > BIG_LIST;
  const presentFamilies = useMemo(() => families.filter((f) => groupAll.some((s) => familyOf(s.hex) === f)), [groupAll]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return swatches.filter((s) => s.group !== "Custom" && `${s.code} ${s.name}`.toLowerCase().includes(q));
    return family && big ? groupAll.filter((s) => familyOf(s.hex) === family) : groupAll;
  }, [query, groupAll, family, big]);

  const recentSwatches = useMemo(
    () => recent.map((id) => swatches.find((s) => s.id === id)).filter((s): s is Swatch => !!s),
    [recent],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={`${label}: каталог`}>
        {visibleTabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={!searching && t === tab}
            onClick={() => {
              setTab(t);
              setQuery("");
              setFamily(null);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !searching && t === tab ? "border-cocoa bg-cocoa text-white" : "border-cocoa/15 hover:border-cocoa"
            }`}
          >
            {groupLabels[t]}
          </button>
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Код или название"
          aria-label="Поиск цвета"
          className="ml-auto w-36 rounded-full border border-cocoa/15 bg-transparent px-3 py-1.5 text-xs outline-none focus:border-cocoa"
        />
      </div>

      {!searching && big && tab !== "Custom" && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Фильтр по оттенку">
          <button
            type="button"
            aria-pressed={family === null}
            onClick={() => setFamily(null)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${family === null ? "bg-cocoa text-white" : "bg-cocoa/8 hover:bg-cocoa/15"}`}
          >
            Все
          </button>
          {presentFamilies.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={family === f}
              onClick={() => setFamily(family === f ? null : f)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${family === f ? "bg-cocoa text-white" : "bg-cocoa/8 hover:bg-cocoa/15"}`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {!searching && big && recentSwatches.length > 0 && tab !== "Custom" && (
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cocoa/50">Недавние</div>
          <div className="flex flex-wrap gap-x-2 gap-y-3" role="radiogroup" aria-label="Недавние цвета">
            {recentSwatches.map((s) => (
              <Tile key={s.id} s={s} active={s.id === value} finish={finish} offset={offset} onClick={() => pick(s.id)} />
            ))}
          </div>
        </div>
      )}

      {(searching || big) && tab !== "Custom" && (
        <div className="mt-3 text-[11px] text-cocoa/50" aria-live="polite">
          {list.length} {list.length === 1 ? "цвет" : "цветов"}
        </div>
      )}

      <div className={`mt-3 min-h-[5.5rem] ${list.length > BIG_LIST ? "max-h-[19rem] overflow-y-auto overscroll-contain rounded-xl border border-cocoa/10 p-3" : ""}`}>
        {!searching && tab === "Custom" ? (
          <div className="rounded-2xl border border-dashed border-cocoa/25 p-4">
            <button
              type="button"
              role="radio"
              aria-checked={current?.group === "Custom"}
              onClick={() => pick("custom")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                current?.group === "Custom" ? "border-cocoa bg-cocoa text-white" : "border-cocoa/15 hover:border-cocoa"
              }`}
            >
              Нужен свой цвет
            </button>
            <label className="mt-3 block text-xs text-cocoa/60">
              Код (RAL, NCS) или описание, можно «как на фото»
              <input
                type="text"
                value={note}
                maxLength={120}
                onChange={(e) => {
                  onNoteChange?.(e.target.value);
                  if (current?.group !== "Custom") onChange("custom");
                }}
                placeholder="Например, RAL 7021 или «как на примере»"
                className="mt-1.5 block w-full rounded-xl border border-cocoa/15 bg-cream px-3 py-2 text-sm text-cocoa outline-none focus:border-cocoa"
              />
            </label>
            <p className="mt-2 text-xs text-cocoa/50">На экране показываем нейтральный серый, менеджер уточнит оттенок по образцу.</p>
          </div>
        ) : !searching && tab === "ColorSystem" && list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-cocoa/25 p-4 text-sm text-cocoa/60">
            Образцы Color System появятся после получения каталога от производства. Пока можно выбрать «Подбор».
          </p>
        ) : list.length === 0 ? (
          <p className="text-sm text-cocoa/60">Ничего не найдено. Выберите «Подбор» и напишите код.</p>
        ) : (
          <div className="flex flex-wrap gap-x-2 gap-y-3" role="radiogroup" aria-label={label}>
            {onReset && (
              <button
                type="button"
                role="radio"
                aria-checked={value === null}
                onClick={onReset}
                className="group flex w-[4.25rem] flex-col items-center gap-1.5 text-center"
              >
                <span
                  className={`block size-14 rounded-xl border bg-[repeating-linear-gradient(45deg,#fff,#fff_3px,#ddd_3px,#ddd_5px)] transition-transform group-hover:scale-105 ${
                    value === null ? `border-cocoa ring-2 ring-taupe ring-offset-2 ${offset}` : "border-black/15"
                  }`}
                />
                <span className={`text-[10px] leading-tight ${value === null ? "font-semibold text-cocoa" : "text-cocoa/60"}`}>
                  Как на фото
                </span>
              </button>
            )}
            {list.map((s) => (
              <Tile key={s.id} s={s} active={s.id === value} finish={finish} offset={offset} onClick={() => pick(s.id)} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-cocoa">
        {current ? (
          <>
            {current.group === "Custom" ? `Подбор${note.trim() ? `: ${note.trim()}` : ""}` : `${current.code} · ${current.name}`}
            {finish === "gloss" ? ", глянец" : ", мат"}
          </>
        ) : (
          "Как на фото"
        )}
      </p>
      <p className="mt-1 text-xs text-cocoa/50">Цвет на экране условный. Точный оттенок подбираем по физическим образцам.</p>
    </div>
  );
}

/** Матовый / глянцевый с мини-превью: плоская плитка и плитка с бликом */
export function FinishToggle({ value, onChange, tone = "cream" }: { value: Finish; onChange: (f: Finish) => void; tone?: "cream" | "sand" }) {
  return (
    <div className="inline-flex gap-2" role="radiogroup" aria-label="Покрытие">
      {finishes.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.id)}
            className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors ${
              active ? "border-cocoa bg-cocoa text-white" : `border-cocoa/15 hover:border-cocoa ${tone === "sand" ? "bg-cream" : ""}`
            }`}
          >
            <span
              className="size-7 rounded-full border border-black/15"
              style={{
                background:
                  f.id === "gloss"
                    ? "linear-gradient(135deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,0) 50%), #8c8a85"
                    : "#8c8a85",
              }}
            />
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
