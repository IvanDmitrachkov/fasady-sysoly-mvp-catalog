"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

export function MobileMenu({ items, phone, phoneHref }: { items: Item[]; phone: string; phoneHref: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-sand"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Мобильное меню"
          className="absolute inset-x-3 top-full mx-auto mt-1 max-w-7xl rounded-[1.75rem] border border-cocoa/10 bg-cream p-3 shadow-[0_16px_40px_-16px_rgba(47,38,31,0.35)] sm:inset-x-5"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-base font-medium text-cocoa/80 transition-colors hover:bg-sand hover:text-cocoa"
            >
              {item.label}
            </Link>
          ))}
          <a href={phoneHref} className="mt-1 block rounded-2xl px-4 py-3 text-base font-semibold">
            {phone}
          </a>
        </nav>
      )}
    </div>
  );
}
