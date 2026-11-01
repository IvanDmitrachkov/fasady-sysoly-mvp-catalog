import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FacadeConfigurator from "@/components/viewer/FacadeConfigurator";
import { LeadForm } from "@/components/LeadForm";
import { NotePin } from "@/components/demo/Demo";
import { categoryById, facadeBySlug, facades, limits } from "@/lib/catalog";
import { priceHint } from "@/lib/priceHints";

export function generateStaticParams() {
  return facades.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const facade = facadeBySlug(slug);
  if (!facade) return {};
  return { title: facade.name, description: facade.blurb };
}

export default async function FacadePage({ params }: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const facade = facadeBySlug(slug);
  if (!facade) notFound();

  const category = categoryById(facade.category);
  // У фасадов без 3D первое фото уже стоит на месте вьюера
  const gallery = facade.profile ? facade.photos : facade.photos.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-3 py-10 sm:px-5 sm:py-14">
      <nav aria-label="Навигация" className="text-sm text-cocoa/55">
        <Link href="/catalog" className="hover:text-cocoa">Каталог</Link>
        <span className="mx-2">/</span>
        <span>{category.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative">
          {facade.profile && <NotePin id="facade3d" className="right-3 top-3" />}
          {facade.profile ? (
            <FacadeConfigurator
              profile={facade.profile}
              widthRange={[100, limits.width[1]]}
              heightRange={[100, limits.height[1]]}
              thicknessRange={limits.thickness}
            />
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand">
              <Image
                src={facade.photos[0]}
                alt={`Фасад «${facade.name}»`}
                fill
                priority
                sizes="(min-width:1024px) 55vw, 100vw"
                className={facade.category === "radius" ? "object-contain p-8" : "object-cover"}
              />
            </div>
          )}
        </div>

        <div className="relative lg:pt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taupe">{category.name}</p>
          <h1 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-tight tracking-tight text-cocoa">
            {facade.name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-cocoa/70">{facade.blurb}</p>

          <dl className="mt-10 divide-y divide-cocoa/10 rounded-[1.5rem] bg-sand px-6 text-sm">
            <Row label="Толщина" value={`${limits.thickness[0]}–${limits.thickness[1]} мм`} />
            <Row label="Высота" value={`${limits.height[0]}–${limits.height[1]} мм`} />
            <Row label="Ширина" value={`${limits.width[0]}–${limits.width[1]} мм`} />
            <Row label="Цвет" value="RAL, NCS, Wood Color, Color System или подбор" />
            <Row label="Покрытие" value="Матовое или глянцевое" />
            {priceHint(facade) && <Row label="Цена" value={`${priceHint(facade)}. Точный расчёт в калькуляторе`} />}
          </dl>

          {facade.swatch && facade.category !== "radius" && (
            <div className="mt-8 flex items-center gap-4">
              <Image
                src={facade.swatch}
                alt={`Схема фасада «${facade.name}»`}
                width={160}
                height={96}
                className="h-24 w-40 rounded-2xl border border-cocoa/10 bg-paper object-contain p-1"
              />
              <p className="max-w-[16rem] text-sm text-cocoa/55">Схема из каталога производителя</p>
            </div>
          )}

          <Link
            href="#order"
            className="mt-10 inline-block rounded-full bg-taupe px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-cocoa"
          >
            Заказать «{facade.name}»
          </Link>
        </div>
      </div>

      {gallery.length > 0 && (
        <section className="mt-20" aria-label="Фасад в интерьере">
          <h2 className="text-2xl font-semibold tracking-tight text-cocoa">В интерьере</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {gallery.map((src) => (
              <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sand">
                <Image
                  src={src}
                  alt={`Фасад «${facade.name}» в интерьере`}
                  fill
                  sizes="(min-width:640px) 50vw, 100vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="order" className="mt-24 grid gap-10 rounded-[2rem] bg-sand p-6 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-cocoa">Заказать фасады</h2>
          <p className="mt-4 max-w-sm text-cocoa/70">
            Укажите размеры, цвет и покрытие. Если чего-то не знаете, оставьте поле пустым, уточним при звонке.
          </p>
        </div>
        <LeadForm facade={facade.name} />
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-4 py-3">
      <dt className="text-cocoa/50">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
