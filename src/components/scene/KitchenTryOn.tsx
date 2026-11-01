"use client";

import { useEffect, useRef, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { backsplashes, scenes, worktops, type KitchenScene, type Surface } from "@/lib/scenes";
import { swatchById, swatches } from "@/lib/palette";
import { hexToLinear, prepare, render, type Prepared, type Target } from "@/lib/recolor";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readPixels(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const target = (hex: string | null, contrast: number, grain = false): Target | null =>
  hex ? { linear: hexToLinear(hex), contrast, grain } : null;

export default function KitchenTryOn() {
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const scene = scenes.find((s) => s.id === sceneId) ?? scenes[0];

  return (
    <div>
      {scenes.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Выбор кухни">
          {scenes.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === sceneId}
              onClick={() => setSceneId(s.id)}
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                s.id === sceneId ? "border-cocoa bg-cocoa text-white" : "border-cocoa/15 hover:border-cocoa"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      {/* key сбрасывает выбранные цвета и загруженные маски при смене кухни */}
      <Stage key={scene.id} scene={scene} />
    </div>
  );
}

function Stage({ scene }: { scene: KitchenScene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outRef = useRef<ImageData | null>(null);
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [failed, setFailed] = useState(false);

  const [facadeId, setFacadeId] = useState<string | null>(null);
  const [worktopId, setWorktopId] = useState("orig");
  const [backsplashId, setBacksplashId] = useState("orig");
  const [accentId, setAccentId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState("");

  // null — фасады как на фото
  const facade = facadeId ? swatchById(facadeId) : null;
  const worktop = worktops.find((s) => s.id === worktopId)!;
  const backsplash = backsplashes.find((s) => s.id === backsplashId)!;
  const accent = accentId ? swatchById(accentId) : null;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadImage(scene.base),
      loadImage(scene.masks),
      scene.masks2 ? loadImage(scene.masks2) : Promise.resolve(null),
    ])
      .then(([base, masks, accentMask]) => {
        if (cancelled) return;
        setPrepared(prepare(readPixels(base), readPixels(masks), accentMask ? readPixels(accentMask) : undefined));
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!prepared || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!outRef.current || outRef.current.width !== prepared.width) {
      outRef.current = ctx.createImageData(prepared.width, prepared.height);
    }
    render(
      prepared,
      [
        target(facade?.hex ?? null, 1, facade?.grain),
        target(worktop.hex, 0.55, worktop.grain),
        target(backsplash.hex, 0.8),
        // у колонн на фото свой древесный рисунок: под краску его приглушаем, под дерево оставляем
        target(accent?.hex ?? null, accent?.grain ? 0.85 : 0.4),
      ],
      outRef.current,
    );
    ctx.putImageData(outRef.current, 0, 0);
  }, [prepared, facade, worktop, backsplash, accent]);

  const summary = `Фасады: ${facade ? `${facade.code} ${facade.name}` : "как на фото"}; столешница: ${worktop.name}; фартук: ${backsplash.name}${scene.masks2 ? `; акцент: ${accent ? `${accent.code} ${accent.name}` : "как на фото"}` : ""}`;

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div
          className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-[1.75rem] bg-sand lg:max-w-none"
          style={{ aspectRatio: `${scene.width} / ${scene.height}` }}
        >
          {/* Исходное фото видно сразу и без JS; канвас с перекраской ложится поверх */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scene.base} alt={scene.alt} width={scene.width} height={scene.height} className="absolute inset-0 h-full w-full" />
          <canvas
            ref={canvasRef}
            width={scene.width}
            height={scene.height}
            aria-hidden
            className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${prepared ? "opacity-100" : "opacity-0"}`}
          />
          {failed && (
            <p className="absolute inset-x-0 bottom-0 bg-cocoa/80 p-3 text-center text-sm text-white">
              Не удалось загрузить примерочную. Попробуйте обновить страницу.
            </p>
          )}
        </div>

        <div className="grid gap-8">
          <Group title="Цвет фасадов" hint={facade ? `${facade.code} · ${facade.name}` : "Как на фото"}>
            <SurfaceDot surface={{ id: "orig", name: "Как на фото", hex: null }} active={facadeId === null} onClick={() => setFacadeId(null)} />
            {swatches.map((s) => (
              <Dot key={s.id} label={`${s.code} ${s.name}`} hex={s.hex} active={s.id === facadeId} onClick={() => setFacadeId(s.id)} />
            ))}
          </Group>
          {scene.masks2 && (
            <Group title={scene.accentLabel ?? "Акцент"} hint={accent ? `${accent.code} · ${accent.name}` : "Как на фото"}>
              <SurfaceDot surface={{ id: "orig", name: "Как на фото", hex: null }} active={accentId === null} onClick={() => setAccentId(null)} />
              {swatches.map((s) => (
                <Dot key={s.id} label={`${s.code} ${s.name}`} hex={s.hex} active={s.id === accentId} onClick={() => setAccentId(s.id)} />
              ))}
            </Group>
          )}
          <Group title="Столешница" hint={worktop.name}>
            {worktops.map((s) => (
              <SurfaceDot key={s.id} surface={s} active={s.id === worktopId} onClick={() => setWorktopId(s.id)} />
            ))}
          </Group>
          <Group title="Фартук" hint={backsplash.name}>
            {backsplashes.map((s) => (
              <SurfaceDot key={s.id} surface={s} active={s.id === backsplashId} onClick={() => setBacksplashId(s.id)} />
            ))}
          </Group>

          <p className="text-xs leading-relaxed text-cocoa/50">
            Цвета на экране условные: окончательный оттенок подбирается по физическим образцам RAL и NCS.
          </p>

          <a
            href="#kitchen-order"
            onClick={() => setPrefill(summary)}
            className="inline-block rounded-full bg-taupe px-7 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-cocoa"
          >
            Заказать этот вариант
          </a>
        </div>
      </div>

      <section id="kitchen-order" className="mt-24 grid gap-10 rounded-[2rem] bg-sand p-6 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-cocoa">Рассчитать стоимость</h2>
          <p className="mt-4 max-w-sm text-cocoa/70">
            Выбранные цвета подставятся в заявку. Размеры и фрезеровку уточним по телефону.
          </p>
        </div>
        <LeadForm key={prefill} facade={prefill} />
      </section>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-cocoa/60">{title}</h2>
        <span className="text-sm font-medium">{hint}</span>
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={title}>
        {children}
      </div>
    </div>
  );
}

function Dot({ label, hex, active, onClick }: { label: string; hex: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`size-9 rounded-full border transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa ${
        active ? "scale-110 border-cocoa ring-2 ring-taupe ring-offset-2 ring-offset-cream" : "border-black/15"
      }`}
      style={{ background: hex }}
    />
  );
}

/** «Как на фото» рисуем штриховкой, остальное — цветом */
function SurfaceDot({ surface, active, onClick }: { surface: Surface; active: boolean; onClick: () => void }) {
  if (surface.hex) return <Dot label={surface.name} hex={surface.hex} active={active} onClick={onClick} />;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={surface.name}
      title={surface.name}
      onClick={onClick}
      className={`size-9 rounded-full border bg-[repeating-linear-gradient(45deg,#fff,#fff_3px,#ddd_3px,#ddd_5px)] transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa ${
        active ? "scale-110 border-cocoa ring-2 ring-taupe ring-offset-2 ring-offset-cream" : "border-black/15"
      }`}
    />
  );
}
