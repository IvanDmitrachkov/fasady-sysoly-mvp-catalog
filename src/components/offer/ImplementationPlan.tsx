import { additionalQuestions, deferredIdeas, implementationStages, implementationSummary } from "@/lib/implementation-plan";

export default function ImplementationPlan() {
  return (
    <div className="mt-10">
      <ol className="grid gap-6">
        {implementationStages.map((stage) => (
          <li key={stage.id} className="rounded-[1.5rem] bg-sand p-5 sm:p-7">
            <div className="flex flex-wrap items-start gap-3">
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
                <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-cocoa/80">
                  {stage.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-taupe" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm text-cocoa">
                  <span className="font-semibold">Результат:</span> {stage.result}
                </p>
              </div>
            </div>
          </li>
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

      <section className="mt-14" aria-labelledby="questions-title">
        <h2 id="questions-title" className="text-2xl font-semibold tracking-tight text-cocoa sm:text-3xl">
          Дополнительные <span className="text-taupe">вопросы</span>
        </h2>

        <ul className="mt-6 grid gap-4">
          {additionalQuestions.map((q) => (
            <li key={q.id} className="rounded-[1.5rem] bg-sand p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-cocoa">{q.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa/75">{q.description}</p>
              <ul className="mt-4 grid gap-2 text-sm text-cocoa/80">
                {q.options.map((option) => (
                  <li key={option} className="flex gap-2">
                    <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-taupe" />
                    {option}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 max-w-3xl rounded-[1.5rem] bg-cocoa p-5 text-sm leading-relaxed text-white sm:p-6 sm:text-base">
        <span className="font-semibold">Общий подход:</span> {implementationSummary}
      </p>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-cocoa/65" role="note">
        Текущий сайт — демо-прототип: часть функций (калькулятор, конструктор, примерочная) уже показана для обсуждения,
        но в обязательный план внедрения они не входят.
      </p>
    </div>
  );
}
