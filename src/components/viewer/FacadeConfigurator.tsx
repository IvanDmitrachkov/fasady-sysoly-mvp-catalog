"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { finishes, swatchById, swatches, type Finish } from "@/lib/palette";
import type { ProfileId } from "@/lib/profiles";

const FacadeViewer = dynamic(() => import("./FacadeViewer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm text-white/60">Загружаем 3D…</div>
  ),
});

type Range = readonly [min: number, max: number];

export type FacadeConfiguratorProps = {
  profile: ProfileId;
  initial?: { width: number; height: number; thickness: number };
  widthRange?: Range;
  heightRange?: Range;
  thicknessRange?: Range;
  /** Показывать ползунки размеров */
  sizes?: boolean;
  className?: string;
  onChange?: (state: { swatchId: string; finish: Finish; width: number; height: number; thickness: number }) => void;
};

export default function FacadeConfigurator({
  profile,
  initial = { width: 450, height: 700, thickness: 19 },
  widthRange = [100, 2050],
  heightRange = [100, 2750],
  thicknessRange = [10, 40],
  sizes = true,
  className = "",
  onChange,
}: FacadeConfiguratorProps) {
  const [swatchId, setSwatchId] = useState("ral-7040");
  const [finish, setFinish] = useState<Finish>("matte");
  const [width, setWidth] = useState(initial.width);
  const [height, setHeight] = useState(initial.height);
  const [thickness, setThickness] = useState(initial.thickness);

  const swatch = swatchById(swatchId);

  const emit = (patch: Partial<{ swatchId: string; finish: Finish; width: number; height: number; thickness: number }>) =>
    onChange?.({ swatchId, finish, width, height, thickness, ...patch });

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-cocoa sm:aspect-[5/4] lg:aspect-auto lg:min-h-[520px] lg:flex-1">
        <FacadeViewer
          className="!absolute inset-0 touch-pan-y"
          profile={profile}
          width={width}
          height={height}
          thickness={thickness}
          swatch={swatch}
          finish={finish}
        />
        <span className="pointer-events-none absolute left-4 top-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
          Потяните, чтобы повернуть
        </span>
        <span className="pointer-events-none absolute bottom-4 left-4 text-xs text-white/70">
          {swatch.code} · {swatch.name}
        </span>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60">Цвет</span>
          <span className="text-xs text-cocoa/50">Цвет на экране условный — смотрите образцы</span>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Цвет фасада">
          {swatches.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={s.id === swatchId}
              aria-label={`${s.code} ${s.name}`}
              title={`${s.code} · ${s.name}`}
              onClick={() => {
                setSwatchId(s.id);
                emit({ swatchId: s.id });
              }}
              className={`size-9 rounded-full border transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa ${
                s.id === swatchId ? "scale-110 border-cocoa ring-2 ring-taupe ring-offset-2 ring-offset-cream" : "border-black/15"
              }`}
              style={{ background: s.hex }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60">Покрытие</div>
          <div className="inline-flex rounded-full border border-cocoa/15 bg-sand p-1" role="radiogroup" aria-label="Покрытие">
            {finishes.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={f.id === finish}
                onClick={() => {
                  setFinish(f.id);
                  emit({ finish: f.id });
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  f.id === finish ? "bg-cocoa text-white" : "text-cocoa/70 hover:text-cocoa"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sizes && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Slider
            label="Ширина"
            value={width}
            range={widthRange}
            onChange={(v) => {
              setWidth(v);
              emit({ width: v });
            }}
          />
          <Slider
            label="Высота"
            value={height}
            range={heightRange}
            onChange={(v) => {
              setHeight(v);
              emit({ height: v });
            }}
          />
          <Slider
            label="Толщина"
            value={thickness}
            range={thicknessRange}
            onChange={(v) => {
              setThickness(v);
              emit({ thickness: v });
            }}
          />
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: Range;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60">
        {label}
        <span className="text-sm font-semibold normal-case tracking-normal text-cocoa tabular-nums">{value} мм</span>
      </span>
      <input
        type="range"
        min={range[0]}
        max={range[1]}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full"
      />
    </label>
  );
}
