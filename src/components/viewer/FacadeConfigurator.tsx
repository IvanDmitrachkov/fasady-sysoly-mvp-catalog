"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ColorPicker, { FinishToggle } from "@/components/ColorPicker";
import { swatchById, type Finish } from "@/lib/palette";
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
  const [note, setNote] = useState("");
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
          {swatch.group === "Custom" ? `Подбор${note.trim() ? `: ${note.trim()}` : ""}` : `${swatch.code} · ${swatch.name}`}
        </span>
      </div>

      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60">Цвет</div>
        <ColorPicker
          value={swatchId}
          finish={finish}
          note={note}
          onNoteChange={setNote}
          onChange={(id) => {
            setSwatchId(id);
            emit({ swatchId: id });
          }}
        />
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60">Покрытие</div>
        <FinishToggle
          value={finish}
          onChange={(f) => {
            setFinish(f);
            emit({ finish: f });
          }}
        />
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
