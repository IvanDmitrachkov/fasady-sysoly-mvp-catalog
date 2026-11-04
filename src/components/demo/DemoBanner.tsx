"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "fasady-banner-closed";
const EVENT = "fasady-banner";

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const read = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/** Тонкая полоса над шапкой: сайт демо, картинки временные. Закрывается до конца сессии браузера */
export function DemoBanner() {
  const closed = useSyncExternalStore(subscribe, read, () => false);
  if (closed) return null;
  return (
    <div className="bg-amber-200 px-3 py-2 text-center text-xs text-cocoa sm:text-sm" role="note">
      <span className="font-semibold">Демо-версия.</span> Картинки и материалы временные, мы ещё доработаем их.{" "}
      <Link href="/offer" className="font-semibold underline underline-offset-2 hover:no-underline">
        План внедрения
      </Link>
      <button
        type="button"
        aria-label="Скрыть сообщение"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            /* хранилище недоступно: закроется до перезагрузки не будет */
          }
          window.dispatchEvent(new Event(EVENT));
        }}
        className="ml-3 rounded-full px-2 py-0.5 font-semibold text-cocoa/70 hover:bg-cocoa/10"
      >
        ×
      </button>
    </div>
  );
}
