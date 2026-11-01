"use client";

import dynamic from "next/dynamic";

const KitchenConstructor = dynamic(() => import("./KitchenConstructor"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center rounded-[1.75rem] bg-sand text-sm text-cocoa/60">Загружаем конструктор…</div>
  ),
});

export function ConstructorClient() {
  return <KitchenConstructor />;
}
