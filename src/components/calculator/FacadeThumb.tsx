"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { optionOf, params, type Row, type RowCalc } from "@/lib/pricing";
import { swatchById } from "@/lib/palette";
import { profileOf } from "./CalcPreview";

const thicknessParam = params.find((p) => p.id === "thickness")!;

/** Миниатюра фасада в карточке позиции: снимок общего рендерера, обновляется при смене параметров */
export default function FacadeThumb({ row, calc }: { row: Row; calc: RowCalc }) {
  const { profile, name, photo } = profileOf(row);
  const swatch = swatchById(row.values.color);
  const gloss = row.values.coating === "gloss";
  const thickness = Number(optionOf(thicknessParam, row.values).id);
  const w = Math.max(60, calc.width);
  const h = Math.max(60, calc.height);
  const [shot, setShot] = useState<{ key: string; url: string | null } | null>(null);

  const key = `${profile}|${w}|${h}|${thickness}|${swatch.id}|${gloss}`;

  useEffect(() => {
    if (!profile) return;
    // небольшая задержка: при наборе размера не пересобираем геометрию на каждую цифру
    const id = setTimeout(async () => {
      const { snapshotFacade } = await import("@/lib/facadeSnapshot");
      const url = snapshotFacade({ profile, width: w, height: h, thickness, swatch, finish: gloss ? "gloss" : "matte" });
      setShot({ key, url });
    }, 150);
    return () => clearTimeout(id);
  }, [key, profile, w, h, thickness, swatch, gloss]);

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[8.5rem] overflow-hidden rounded-2xl bg-gradient-to-b from-[#4a3f36] to-cocoa @lg:mx-0 @lg:max-w-none">
      {profile ? (
        shot?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot.url} alt={`Фасад «${name}», ${swatch.name}`} className="absolute inset-0 h-full w-full object-contain" />
        ) : shot ? (
          <div className="absolute inset-0" style={{ background: swatch.hex }} />
        ) : (
          <div className="grid h-full place-items-center text-[11px] text-white/50">3D…</div>
        )
      ) : (
        <>
          {photo && <Image src={photo} alt={`Фасад «${name}»`} fill sizes="9rem" className="object-cover opacity-85" />}
          <span className="absolute inset-x-1 bottom-1 rounded-md bg-cocoa/75 px-1.5 py-1 text-center text-[10px] leading-tight text-white">
            3D в разработке
          </span>
        </>
      )}
      <span className="absolute right-1.5 top-1.5 rounded-full bg-black/35 px-1.5 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur">3D</span>
    </div>
  );
}
