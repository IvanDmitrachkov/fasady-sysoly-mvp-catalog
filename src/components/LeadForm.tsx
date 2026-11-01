"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "w-full rounded-2xl border border-cocoa/15 bg-cream px-4 py-3 text-base outline-none transition-colors placeholder:text-cocoa/35 focus:border-taupe focus:bg-paper";

export function LeadForm({ facade = "", comment = "" }: { facade?: string; comment?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    try {
      const res = await fetch("/api/lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-[1.5rem] bg-sand p-8">
        <p className="text-2xl font-semibold">Заявка отправлена</p>
        <p className="mt-2 text-cocoa/65">Мы свяжемся с вами в ближайшее рабочее время.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Имя
          <input name="name" required autoComplete="name" className={field} placeholder="Как к вам обращаться" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Телефон
          <input name="phone" type="tel" required autoComplete="tel" className={field} placeholder="+7" />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Что нужно
        <input name="facade" defaultValue={facade} className={field} placeholder="Например: Степ, RAL 7040, 24 фасада" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Комментарий
        <textarea
          name="comment"
          rows={comment ? 6 : 3}
          defaultValue={comment}
          className={field}
          placeholder="Размеры, радиус торца, цвет, матовый или глянцевый"
        />
      </label>
      {/* ловушка для ботов */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-taupe px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-cocoa disabled:opacity-60"
        >
          {status === "sending" ? "Отправляем…" : "Отправить заявку"}
        </button>
        {status === "error" && (
          <span role="alert" className="text-sm text-red-700">
            Не получилось отправить. Позвоните нам или попробуйте ещё раз.
          </span>
        )}
      </div>
    </form>
  );
}
