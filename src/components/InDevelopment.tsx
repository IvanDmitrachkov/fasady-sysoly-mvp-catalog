/** Заглушка для позиций и функций, которых пока нет в демо-версии */
export const IN_DEVELOPMENT = "В разработке";
export const NOT_IN_DEMO = "Недоступно в демо-режиме";

/** Плашка поверх карточки или картинки */
export function DevBadge({ className = "left-3 top-3" }: { className?: string }) {
  return (
    <span
      className={`absolute rounded-full bg-cocoa/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur ${className}`}
    >
      {IN_DEVELOPMENT}
    </span>
  );
}

/** Пустое место вместо фото или 3D, пока материалов нет */
export function DevPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 grid place-items-center bg-gradient-to-br from-sand to-cream p-6 text-center ${className}`}
    >
      <div>
        <p className="text-lg font-semibold text-cocoa">{IN_DEVELOPMENT}</p>
        <p className="mt-1 text-xs text-cocoa/55">{NOT_IN_DEMO}</p>
      </div>
    </div>
  );
}

/** Баннер над разделом, чьи возможности в демо урезаны */
export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 max-w-2xl rounded-2xl border border-cocoa/10 bg-sand px-5 py-3 text-sm text-cocoa/70">
      <span className="mr-2 rounded-full bg-cocoa px-2.5 py-0.5 text-[11px] font-semibold text-white">Демо</span>
      {children}
    </p>
  );
}

/** Метка на временных фото: картинки в демо заменим на финальные */
export function DemoPhotoBadge({ className = "bottom-3 right-3" }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute z-10 rounded-full bg-amber-200/95 px-2.5 py-1 text-[10px] font-semibold text-cocoa shadow-sm ${className}`}
    >
      Демо-фото
    </span>
  );
}
