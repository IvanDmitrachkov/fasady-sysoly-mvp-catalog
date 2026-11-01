import Link from "next/link";
import { contacts } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer id="contacts" className="px-3 pb-3 pt-12 sm:px-5">
      <div className="mx-auto grid max-w-7xl gap-12 rounded-[2rem] bg-cocoa p-8 text-white sm:p-12 md:grid-cols-[1.4fr_1fr_1fr] lg:p-14">
        <div>
          <div className="text-3xl font-semibold leading-tight tracking-tight">
            Фасады
            <br />
            Сысолы
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Фабрика по производству мебельных фасадов. Покраска, фрезеровка, радиусные фасады и фасады в плёнке.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-sand/60">Связаться</h2>
          <ul className="space-y-2 text-sm">
            <li><a href={contacts.phoneHref} className="hover:underline">{contacts.phone}</a></li>
            <li>
              <a href={contacts.messengersHref} className="hover:underline">{contacts.messengers}</a>
              <span className="text-white/45"> · WhatsApp, Viber</span>
            </li>
            <li><a href={`mailto:${contacts.email}`} className="hover:underline">{contacts.email}</a></li>
            <li className="text-white/70">{contacts.address}</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-sand/60">Разделы</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:underline">Каталог фасадов</Link></li>
            <li><Link href="/#services" className="hover:underline">Услуги</Link></li>
            <li><Link href="/#how" className="hover:underline">Как заказать</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-7xl px-2 text-center text-xs text-cocoa/55">
        Демо-версия: картинки, тексты и цвета временные. <Link href="/offer#review" className="underline underline-offset-2 hover:no-underline">Что готово и что будет улучшено</Link>
      </p>
    </footer>
  );
}
