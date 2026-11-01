"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { facadeBySlug } from "@/lib/catalog";
import { optionOf, params, type Row, type RowCalc } from "@/lib/pricing";
import { swatchById } from "@/lib/palette";
import type { ProfileId } from "@/lib/profiles";

const FacadeViewer = dynamic(() => import("@/components/viewer/FacadeViewer"), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center text-sm text-white/60">Загружаем 3D…</div>,
});

const param = (id: string) => params.find((p) => p.id === id)!;

/** Профиль для 3D по выбору в калькуляторе; null, если у фрезеровки пока нет 3D-модели */
export function profileOf(row: Row): { profile: ProfileId | null; name: string; photo?: string } {
  if (row.values.type !== "milled") return { profile: "flat", name: "Прямой фасад" };
  const f = facadeBySlug(row.values.profile);
  return { profile: f?.profile ?? null, name: f?.name ?? "Фрезеровка", photo: f?.photos[0] };
}

export default function CalcPreview({ row, calc, index }: { row: Row; calc: RowCalc; index: number }) {
  const { profile, name, photo } = profileOf(row);
  const swatch = swatchById(row.values.color);
  const gloss = row.values.coating === "gloss";
  const thickness = Number(optionOf(param("thickness"), row.values).id);
  // слишком мелкие значения при вводе не ломают геометрию
  const w = Math.max(60, calc.width);
  const h = Math.max(60, calc.height);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#4a3f36] to-cocoa sm:h-[420px] lg:h-[470px]">
      {profile ? (
        <FacadeViewer
          className="!absolute inset-0 touch-pan-y"
          profile={profile}
          width={w}
          height={h}
          thickness={thickness}
          swatch={swatch}
          finish={gloss ? "gloss" : "matte"}
        />
      ) : (
        <div className="absolute inset-0">
          {photo && <Image src={photo} alt={`Фасад «${name}»`} fill sizes="(min-width:1024px) 26rem, 100vw" className="object-cover opacity-80" />}
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/90 via-cocoa/30 to-transparent" />
          <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl bg-cocoa/70 p-4 text-center text-sm text-white backdrop-blur">
            3D-модель для фрезеровки «{name}» в разработке. Цена считается как обычно.
          </p>
        </div>
      )}

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-cocoa backdrop-blur">
        Фасад {index + 1} · {name}
      </span>
      {profile && (
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
          Потяните, чтобы повернуть
        </span>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-10 text-white">
        <p className="text-sm font-semibold">
          {calc.width} × {calc.height} × {thickness} мм
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-white/75">
          <span className="size-3 rounded-full border border-white/40" style={{ background: swatch.hex }} />
          {swatch.code === "Wood Color" ? "Wood Color" : swatch.code} · {swatch.name}, {gloss ? "глянец" : "мат"}
        </p>
      </div>
    </div>
  );
}
