import Image from "next/image";
import Link from "next/link";
import { contacts } from "@/lib/catalog";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/constructor", label: "Конструктор" },
  { href: "/kitchen", label: "Примерить" },
  { href: "/#services", label: "Услуги" },
  { href: "/#how", label: "Как заказать" },
  { href: "/#contacts", label: "Контакты" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-cream px-3 pb-2 pt-3 sm:px-5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 rounded-full border border-cocoa/10 bg-cream/85 pl-5 pr-2 shadow-[0_8px_30px_-12px_rgba(47,38,31,0.25)] backdrop-blur-md sm:pl-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Фасады Сысолы — на главную">
          <Image src="/logo.jpg" alt="" width={36} height={38} priority className="h-8 w-auto" />
          <span className="text-lg font-semibold leading-none tracking-tight">
            Фасады
            <br />
            Сысолы
          </span>
        </Link>

        <nav aria-label="Основное меню" className="hidden items-center gap-5 whitespace-nowrap lg:flex xl:gap-8">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-cocoa/70 transition-colors hover:text-cocoa">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a href={contacts.phoneHref} className="hidden whitespace-nowrap text-sm font-semibold xl:block">
            {contacts.phone}
          </a>
          <Link
            href="/#order"
            className="rounded-full bg-taupe px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cocoa"
          >
            Заявка
          </Link>
        </div>
      </div>
    </header>
  );
}
