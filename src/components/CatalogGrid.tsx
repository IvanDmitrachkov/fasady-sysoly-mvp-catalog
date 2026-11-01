"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categories, isReady, type CategoryId, type Facade } from "@/lib/catalog";
import { DemoPhotoBadge, DevPlaceholder } from "@/components/InDevelopment";
import { priceHint } from "@/lib/priceHints";

const categoryName = (f: Facade) => categories.find((c) => c.id === f.category)?.name ?? "";

export function CatalogGrid({ items }: { items: Facade[] }) {
  const [active, setActive] = useState<CategoryId | "all">("all");

  const filtered = active === "all" ? items : items.filter((f) => f.category === active);
  // готовые позиции выше, «В разработке» в конце (порядок внутри групп сохраняется)
  const visible = [...filtered].sort((a, b) => Number(isReady(b)) - Number(isReady(a)));
  const chips: { id: CategoryId | "all"; name: string }[] = [{ id: "all", name: "Все" }, ...categories];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по типу">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={active === c.id}
            onClick={() => setActive(c.id)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
              active === c.id ? "border-cocoa bg-cocoa text-white" : "border-cocoa/15 hover:border-cocoa"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((f) => (
          <li key={f.slug}>
            <Link
              href={`/catalog/${f.slug}`}
              className="group block h-full rounded-[1.75rem] bg-sand p-3 transition-shadow hover:shadow-[0_20px_40px_-20px_rgba(47,38,31,0.4)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-cream">
                {isReady(f) ? (
                  <>
                    <Image
                      src={f.photos[0]}
                      alt={`Фасад «${f.name}»`}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <DemoPhotoBadge />
                    <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold text-cocoa backdrop-blur">
                      3D-просмотр
                    </span>
                  </>
                ) : (
                  <DevPlaceholder />
                )}
              </div>
              <div className="px-3 pb-3 pt-4">
                <h3 className="text-lg font-semibold leading-snug text-cocoa">{f.name}</h3>
                {isReady(f) ? (
                  <>
                    <p className="mt-1 line-clamp-2 text-sm text-cocoa/60">{f.blurb}</p>
                    {priceHint(f) && <p className="mt-2 text-sm font-semibold text-taupe">{priceHint(f)}</p>}
                  </>
                ) : (
                  <p className="mt-1 text-sm text-cocoa/45">{categoryName(f)}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
