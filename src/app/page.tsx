import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { NotePin } from "@/components/demo/Demo";
import { DemoPhotoBadge } from "@/components/InDevelopment";
import { advantages, categories, facades } from "@/lib/catalog";
import { priceHint } from "@/lib/priceHints";

const services = [
  { title: "Покраска фасадов", text: "Эмаль в любой цвет RAL, NCS или по вашему образцу. Матовая или глянцевая." },
  { title: "Фасады в плёнке ПВХ", text: "Однотонные и с рисунком дерева. Подбор плёнки под проект." },
  { title: "Производство фасадов", text: "МДФ толщиной 10–40 мм, высота до 2750 мм, ширина до 2050 мм." },
  { title: "Радиусные фасады", text: "Наружные и внутренние радиусные фасады для кухонь нестандартной формы." },
  { title: "Фрезеровка фасадов", text: "Рамки, волны, рейки и другие профили. Фрезеровка по вашему рисунку." },
];

const steps = [
  { n: "1", title: "Выберите фасад", text: "Посмотрите профиль в каталоге, примерьте цвет и покрытие." },
  { n: "2", title: "Укажите размеры", text: "Высота, ширина, толщина, радиус торца, ручка, фрезеровка." },
  { n: "3", title: "Согласуйте цвет", text: "Цвет по каталогу RAL, NCS, Wood Color, Color System или подбор." },
  { n: "4", title: "Получите фасады", text: "Изготовим и бесплатно доставим по городу." },
];

const facts = [
  { value: "4 года", label: "гарантии на фасады" },
  { value: "2750 мм", label: "максимальная высота" },
  { value: "10–40 мм", label: "толщина МДФ" },
];

const featured = facades.filter((f) => f.profile && f.profile !== "flat").slice(0, 4);

const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-cocoa transition-colors hover:bg-sand";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.2em] text-taupe";
const h2 = "text-3xl font-semibold leading-tight tracking-tight text-cocoa sm:text-4xl lg:text-[2.75rem]";

export default function Home() {
  return (
    <div className="pb-6">
      {/* HERO */}
      <section className="relative px-3 pt-3 sm:px-5">
        <div className="relative mx-auto flex min-h-[500px] max-w-7xl items-end overflow-hidden rounded-[2rem] bg-cocoa text-white lg:h-[500px]">
          <Image
            src="/scenes/corner-1/base.jpg"
            alt="Современная кухня с бежевыми безручковыми фасадами и фасадами под дерево"
            fill
            priority
            sizes="(min-width:1280px) 1240px, 100vw"
            className="object-cover object-[50%_42%]"
          />
          <DemoPhotoBadge className="right-4 top-4" />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/35 to-cocoa/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-cocoa/55 via-transparent to-transparent" />

          <div className="relative grid w-full gap-8 p-6 sm:p-10 lg:grid-cols-[1.6fr_1fr] lg:items-end lg:p-12">
            <div>
              <p className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
                Производство МДФ-фасадов · Сыктывкар
              </p>
              <h1 className="text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[1.02] tracking-tight">
                Фасады для кухни,
                <br />
                которую <span className="text-sand/80">хочется показывать</span>
              </h1>
            </div>
            <div className="lg:justify-self-end lg:pb-2 lg:text-[0.95rem]">
              <p className="max-w-sm text-sm leading-relaxed text-white/85">
                МДФ-фасады на заказ: покраска в любой цвет, фрезеровка, радиусные и в плёнке. Бесплатная доставка по городу.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#order" className={btnPrimary}>
                  Рассчитать заказ
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/15"
                >
                  Смотреть каталог
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT BENTO */}
      <section className="relative mx-auto mt-5 grid max-w-7xl gap-5 px-3 sm:px-5 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="flex flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-[#c4a888] to-[#8f7254] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Фабрика в цифрах</p>
          <dl className="mt-10 space-y-6">
            {facts.map((f) => (
              <div key={f.value} className="border-t border-white/25 pt-4">
                <dt className="text-4xl font-semibold tracking-tight sm:text-5xl">{f.value}</dt>
                <dd className="mt-1 text-sm text-white/80">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid overflow-hidden rounded-[1.75rem] bg-sand md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-10">
            <h2 className={h2}>
              Кто <span className="text-taupe">мы</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-cocoa/70">
              «Фасады Сысолы» — фабрика мебельных фасадов в Сыктывкаре. Мы делаем фасады для кухонь и мебели из МДФ:
              гладкие, с фрезеровкой, с интегрированной ручкой и радиусные.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-cocoa/70">
              Работаем напрямую с дизайнерами, мебельщиками и частными заказчиками, поэтому вы не переплачиваете
              посредникам.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {advantages.map((a) => (
                <li key={a} className="rounded-full bg-cream px-4 py-2 text-xs font-semibold text-cocoa">
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-64">
            <Image
              src="/pdf/p11-3.jpg"
              alt="Кухня с фрезерованными фасадами «Премьер»"
              fill
              sizes="(min-width:768px) 30vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative mx-auto mt-24 max-w-7xl px-3 sm:px-5">
        <p className={eyebrow}>Услуги</p>
        <h2 className={`${h2} mt-3 max-w-2xl`}>
          Всё для фасадов — <span className="text-taupe">в одном месте</span>
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => (
            <li
              key={s.title}
              className={`flex min-h-52 flex-col justify-between rounded-[1.75rem] p-7 ${
                i === 0 ? "bg-cocoa text-white lg:col-span-3" : i === 1 ? "bg-sand lg:col-span-3" : "bg-sand lg:col-span-2"
              } ${i === 4 ? "bg-gradient-to-br from-[#c4a888] to-[#8f7254] text-white" : ""}`}
            >
              <span className={`text-sm font-semibold tabular-nums ${i === 0 || i === 4 ? "text-white/60" : "text-taupe"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mt-8 text-xl font-semibold">{s.title}</h3>
                <p className={`mt-2 max-w-sm text-sm leading-relaxed ${i === 0 || i === 4 ? "text-white/75" : "text-cocoa/65"}`}>
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CATALOG PREVIEW */}
      <section className="relative mx-auto mt-24 max-w-7xl px-3 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={eyebrow}>Каталог</p>
            <h2 className={`${h2} mt-3`}>
              Популярные <span className="text-taupe">фрезеровки</span>
            </h2>
          </div>
          <Link href="/catalog" className="rounded-full border border-cocoa/20 px-6 py-3 text-sm font-semibold text-cocoa transition-colors hover:bg-cocoa hover:text-white">
            Весь каталог →
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((f) => (
            <li key={f.slug}>
              <Link href={`/catalog/${f.slug}`} className="group block rounded-[1.75rem] bg-sand p-3 transition-shadow hover:shadow-[0_20px_40px_-20px_rgba(47,38,31,0.4)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-cream">
                  <Image
                    src={f.photos[0]}
                    alt={`Фасад «${f.name}» в интерьере`}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold text-cocoa backdrop-blur">
                    3D-просмотр
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 pb-2 pt-4">
                  <h3 className="text-lg font-semibold text-cocoa">{f.name}</h3>
                  <span className="text-taupe transition-transform group-hover:translate-x-1">→</span>
                </div>
                {priceHint(f) && <p className="px-3 pb-3 text-sm font-semibold text-taupe">{priceHint(f)}</p>}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/catalog#${c.id}`}
                className="block rounded-full border border-cocoa/15 px-5 py-2.5 text-sm font-medium text-cocoa transition-colors hover:bg-cocoa hover:text-white"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* KITCHEN TRY-ON */}
      <section className="relative mx-auto mt-24 max-w-7xl px-3 sm:px-5">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-cocoa text-white lg:grid-cols-[1fr_1fr]">
          <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand/70">Примерочная</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Примерьте цвет <span className="text-sand/70">на целой кухне</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/70">
              Выберите цвет фасадов, столешницу и фартук — и сразу увидите, как будет выглядеть кухня. Без выезда замерщика
              и образцов.
            </p>
            <Link href="/kitchen" className={`${btnPrimary} mt-8 self-start`}>
              Примерить кухню
            </Link>
          </div>
          <div className="relative min-h-80 lg:min-h-[480px]">
            <Image
              src="/scenes/straight-1/base.jpg"
              alt="Прямая кухня с серыми фасадами"
              fill
              sizes="(min-width:1024px) 600px, 100vw"
              className="object-cover object-[50%_35%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cocoa via-cocoa/20 to-transparent max-lg:bg-gradient-to-b" />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="relative mx-auto mt-24 max-w-7xl px-3 sm:px-5">
        <p className={eyebrow}>Почему мы</p>
        <h2 className={`${h2} mt-3 max-w-2xl`}>
          Почему выбирают <span className="text-taupe">нас</span>
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[1.75rem] bg-sand p-8">
            <h3 className="text-xl font-semibold">Прямые цены</h3>
            <p className="mt-3 text-sm leading-relaxed text-cocoa/65">
              Производим сами, без посредников и переплат. Постоянным клиентам скидка 20%.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-sand p-8">
            <h3 className="text-xl font-semibold">Гарантия 4 года</h3>
            <p className="mt-3 text-sm leading-relaxed text-cocoa/65">
              Уверены в качестве МДФ и покрытия, поэтому даём долгую гарантию на фасады.
            </p>
          </div>
          <div className="row-span-2 flex flex-col justify-between rounded-[1.75rem] bg-gradient-to-b from-[#6a5440] to-cocoa p-8 text-white lg:row-span-2">
            <div>
              <h3 className="text-xl font-semibold">Любой цвет и фактура</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                RAL, NCS, Wood Color, Color System или подбор по вашему образцу. Матовая и глянцевая эмаль, плёнка ПВХ.
              </p>
            </div>
            <p className="mt-16 text-sm font-semibold text-sand">Бесплатная доставка по городу</p>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[1.75rem] lg:col-span-2">
            <Image
              src="/pdf/p12-1.jpg"
              alt="Кухня с рейчатыми фасадами"
              fill
              sizes="(min-width:1024px) 60vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <h3 className="text-xl font-semibold">Фрезеровка под ваш проект</h3>
              <p className="mt-2 max-w-md text-sm text-white/80">Рамки, волны, рейки и фрезеровка по вашему рисунку.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO ORDER */}
      <section id="how" className="relative mx-auto mt-24 max-w-7xl px-3 sm:px-5">
        <p className={eyebrow}>Как заказать</p>
        <h2 className={`${h2} mt-3`}>
          Четыре шага <span className="text-taupe">до фасадов</span>
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-[1.75rem] border border-cocoa/10 bg-white/60 p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-taupe text-sm font-semibold text-white">
                {s.n}
              </span>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa/65">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ORDER */}
      <section id="order" className="relative mx-auto mt-24 max-w-7xl px-3 sm:px-5">
        <NotePin id="lead" className="right-8 top-4" />
        <div className="grid gap-10 rounded-[2rem] bg-sand p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:p-14">
          <div>
            <p className={eyebrow}>Заявка</p>
            <h2 className={`${h2} mt-3`}>
              Рассчитаем ваш <span className="text-taupe">заказ</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-cocoa/70">
              Расскажите, что вам нужно. Размеры, цвет, фрезеровку и покрытие уточним по телефону.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-paper p-6 sm:p-10">
            <LeadForm />
          </div>
        </div>
      </section>
    </div>
  );
}
