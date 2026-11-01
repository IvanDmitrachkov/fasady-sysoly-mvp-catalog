"use client";

import { useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoNotes, type DemoNoteId } from "@/lib/demoNotes";
import { addonById } from "@/lib/offer";

const KEY = "fasady-demo";
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

function useDemo() {
  const on = useSyncExternalStore(subscribe, read, () => false);
  const set = (value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      /* хранилище недоступно */
    }
    listeners.forEach((l) => l());
  };
  return [on, set] as const;
}

/** Кнопка включения режима демо: стикеры с пояснениями на блоках страниц */
export function DemoToggle() {
  const [on, set] = useDemo();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {on && (
        <Link
          href="/offer"
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-cocoa shadow-lg ring-1 ring-cocoa/15 transition-colors hover:bg-sand"
        >
          Доработки
        </Link>
      )}
      <button
        type="button"
        onClick={() => set(!on)}
        aria-pressed={on}
        className={`rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-colors ${
          on ? "bg-amber-300 text-cocoa" : "bg-cocoa text-white hover:bg-taupe"
        }`}
      >
        {on ? "Режим демо: вкл" : "Режим демо"}
      </button>
    </div>
  );
}

/** Карточка не должна вылезать за края окна: сдвигаем по горизонтали */
function fit(el: HTMLDivElement | null) {
  if (!el) return;
  el.style.transform = "";
  const r = el.getBoundingClientRect();
  const m = 12;
  const top = 76; // под закреплённой шапкой
  const bottom = window.innerHeight - 76; // над кнопками демо
  let dx = 0;
  let dy = 0;
  if (r.right > window.innerWidth - m) dx = window.innerWidth - m - r.right;
  if (r.left + dx < m) dx = m - r.left;
  if (r.bottom > bottom) dy = bottom - r.bottom;
  if (r.top + dy < top) dy = top - r.top;
  if (dx || dy) el.style.transform = `translate(${dx}px, ${dy}px)`;
}

/**
 * Стикер на блоке. Родитель должен быть позиционирован (relative).
 * Его можно перетащить: смещение живёт только в памяти страницы и не сохраняется.
 */
export function NotePin({ id, className = "left-3 top-3" }: { id: DemoNoteId; className?: string }) {
  const [on] = useDemo();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number; moved: boolean } | null>(null);
  // на самой странице доработок стикеры только мешают
  if (!on || pathname === "/offer") return null;
  const n = demoNotes[id];
  const list = n.addons.map((a) => addonById(a));
  const label = list.length
    ? "ⓘ доп. модуль"
    : "ⓘ в минимуме";

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    setOffset({ x: d.ox + dx, y: d.oy + dy });
  };
  const onUp = () => {
    const moved = drag.current?.moved;
    drag.current = null;
    if (!moved) setOpen((v) => !v);
  };

  return (
    <div className={`absolute z-30 ${className}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
      <button
        type="button"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen((v) => !v))}
        aria-expanded={open}
        title="Нажмите, чтобы открыть. Можно перетащить"
        className="-rotate-2 cursor-grab touch-none select-none whitespace-nowrap rounded-lg bg-amber-300 px-4 py-2.5 text-base font-bold text-cocoa shadow-lg ring-1 ring-amber-500/50 transition-transform hover:rotate-0 active:cursor-grabbing"
      >
        {open ? "Закрыть" : label}
      </button>
      {open && (
        <div
          ref={fit}
          role="dialog"
          aria-label={n.title}
          className="relative mt-2 w-[min(26rem,calc(100vw-1.5rem))] rounded-2xl bg-amber-100 p-5 text-left text-[15px] leading-relaxed text-cocoa shadow-2xl ring-1 ring-amber-400/60"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-xl leading-none hover:bg-amber-200"
          >
            ×
          </button>
          <p className="pr-8 text-lg font-bold">{n.title}</p>
          <p className="mt-2">{n.what}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-cocoa/60">В минимуме</p>
          <p>{n.inBase}</p>
          {list.length > 0 && (
            <>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-cocoa/60">Можно добавить</p>
              <ul className="mt-1 space-y-2">
                {list.map((a) => (
                  <li key={a.id}>
                    <Link href={`/offer#${a.id}`} className="font-semibold underline underline-offset-2 hover:no-underline">
                      {a.title}
                    </Link>
                    <span className="ml-2 whitespace-nowrap text-sm">доп. модуль, за отдельную плату</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-cocoa/60">Подводные камни</p>
          <ul className="list-disc space-y-1.5 pl-5">
            {n.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-cocoa/55">Доп. модули подключаются отдельно, за отдельную плату.</p>
        </div>
      )}
    </div>
  );
}
