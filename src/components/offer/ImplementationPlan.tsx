import {
  deferredIdeas,
  formatImplementationPrice,
  implementationPriceAsteriskNote,
  implementationPriceDisclaimer,
  implementationStages,
  implementationStagesTotalRub,
  implementationSummary,
  implementationTotalWithKitchenImagesRub,
  showImplementationPricesOnSite,
  type ImplementationStage,
  type StageMaterialAddon,
} from "@/lib/implementation-plan";

type PriceVisual = "onDark" | "onLight" | "largeDark";

function HiddenPrice({ visual }: { visual: PriceVisual }) {
  const bar =
    visual === "largeDark"
      ? "h-10 w-36 sm:w-40"
      : visual === "onDark"
        ? "h-7 w-28"
        : "h-8 w-32 bg-cocoa/15";

  return (
    <span className="inline-block select-none" aria-hidden>
      <span className={`block rounded-full blur-lg ${visual === "onLight" ? bar : `bg-white/35 ${bar}`}`} />
    </span>
  );
}

function PriceLine({
  amountRub,
  prefix = "",
  className = "",
  visual = "onLight",
}: {
  amountRub: number;
  prefix?: string;
  className?: string;
  visual?: PriceVisual;
}) {
  if (!showImplementationPricesOnSite) {
    return <HiddenPrice visual={visual} />;
  }
  return <span className={`tabular-nums ${className}`}>{formatImplementationPrice(amountRub, prefix)}</span>;
}

function MaterialAddon({ addon }: { addon: StageMaterialAddon }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-cocoa/12">
      <div className="bg-cream/80 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cocoa/55">Материалы для сайта</p>
        <h3 className="mt-1 text-base font-semibold text-cocoa">{addon.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-cocoa/75">{addon.description}</p>
      </div>
      <div className="grid gap-px bg-cocoa/10 sm:grid-cols-2">
        <div className="bg-white/60 px-4 py-4 sm:px-5">
          <p className="text-sm font-medium text-cocoa">{addon.serviceLabel}</p>
          <div className="mt-3">
            <PriceLine amountRub={addon.priceRub} prefix="+ " visual="onLight" />
          </div>
          <p className="mt-2 text-xs text-cocoa/55">Дополнительная услуга к этапу 1</p>
        </div>
        <div className="flex items-center bg-sand/50 px-4 py-4 sm:px-5">
          <p className="text-sm leading-relaxed text-cocoa/80">
            <span className="font-semibold text-cocoa">Или:</span> {addon.alternative}
          </p>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage }: { stage: ImplementationStage }) {
  const maxWithImages =
    stage.number === 1 && stage.materialAddon ? stage.priceRub + stage.materialAddon.priceRub : null;

  return (
    <li className="rounded-[1.5rem] bg-sand p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-cocoa text-base font-semibold text-white"
            aria-hidden
          >
            {stage.number}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-cocoa sm:text-2xl">
              Этап {stage.number}. {stage.title}
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
          {showImplementationPricesOnSite ? (
            <>
              <span className="rounded-full bg-cocoa px-4 py-2 text-sm font-semibold tabular-nums text-white">
                {formatImplementationPrice(stage.priceRub)}
              </span>
              {maxWithImages !== null && (
                <span className="text-xs tabular-nums text-cocoa/60">
                  {formatImplementationPrice(maxWithImages)} с&nbsp;картинками
                </span>
              )}
            </>
          ) : (
            <span className="rounded-full bg-cocoa px-3 py-2">
              <HiddenPrice visual="onDark" />
            </span>
          )}
        </div>
      </div>

      {stage.priceNote && (
        <p className="mt-4 rounded-2xl border border-cocoa/10 bg-cream/70 px-4 py-3 text-sm text-cocoa/80">
          {stage.priceNote}
        </p>
      )}

      <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-cocoa/80">
        {stage.items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-taupe" />
            {item}
          </li>
        ))}
      </ul>

      {stage.materialAddon && <MaterialAddon addon={stage.materialAddon} />}

      <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm text-cocoa">
        <span className="font-semibold">Результат:</span> {stage.result}
      </p>
    </li>
  );
}

export default function ImplementationPlan() {
  return (
    <div className="mt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-[1.5rem] bg-cocoa px-5 py-5 text-white sm:px-7 sm:py-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Ориентир по этапам 1–3</p>
          <div className="mt-2 text-2xl font-semibold sm:text-3xl">
            <PriceLine amountRub={implementationStagesTotalRub} visual="largeDark" />
          </div>
          <p className="mt-2 text-sm text-white/65">Без конструктора и подбора кухни</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/65">С подбором картинок на этапе 1</p>
          <div className="mt-2 flex justify-end text-xl font-semibold">
            <PriceLine amountRub={implementationTotalWithKitchenImagesRub} visual="largeDark" />
          </div>
        </div>
      </div>

      <ol className="grid gap-6">
        {implementationStages.map((stage) => (
          <StageCard key={stage.id} stage={stage} />
        ))}
      </ol>

      <section className="mt-14" aria-labelledby="deferred-title">
        <h2 id="deferred-title" className="text-2xl font-semibold tracking-tight text-cocoa sm:text-3xl">
          Дополнительные идеи <span className="text-taupe">(пока под вопросом)</span>
        </h2>

        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {deferredIdeas.map((idea) => (
            <li key={idea.id} className="rounded-[1.5rem] border border-cocoa/10 bg-cream p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-cocoa">{idea.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa/75">{idea.description}</p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-cocoa/55">
                Почему пока не берём в работу
              </p>
              <ul className="mt-2 grid gap-1.5 text-sm text-cocoa/80">
                {idea.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2">
                    <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-amber-500" />
                    {reason}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-cocoa">
                <span className="font-semibold">Предложение:</span> {idea.proposal}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 max-w-3xl rounded-[1.5rem] bg-cocoa p-5 text-sm leading-relaxed text-white sm:p-6 sm:text-base">
        <span className="font-semibold">Общий подход:</span> {implementationSummary}
      </p>

      {showImplementationPricesOnSite && (
        <div className="mt-4 max-w-3xl space-y-2 text-sm leading-relaxed text-cocoa/60" role="note">
          <p>{implementationPriceAsteriskNote}</p>
          <p>{implementationPriceDisclaimer}</p>
        </div>
      )}

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-cocoa/65" role="note">
        Текущий сайт — демо-прототип: часть функций (калькулятор, конструктор, примерочная) уже показана для обсуждения,
        но в обязательный план внедрения они не входят.
      </p>
    </div>
  );
}
