const steps = [
  {
    title: "Variables locales",
    body: "Ejecuta ./scripts/init.sh y completa .env.local. Ese archivo está ignorado por Git.",
  },
  {
    title: "GitHub",
    body: "Sube el código a main. Verifica con git status que .env.local no aparece.",
  },
  {
    title: "Vercel",
    body: "Vincula el proyecto con vercel link y carga las variables en el panel, nunca en el repositorio.",
  },
];

export function SetupChecklist() {
  return (
    <section
      aria-labelledby="setup-heading"
      className="grid gap-4 sm:grid-cols-3"
    >
      <h2 id="setup-heading" className="sr-only">
        Pasos de configuración segura
      </h2>
      {steps.map((step, index) => (
        <article
          key={step.title}
          className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            0{index + 1}
          </p>
          <h3 className="mt-3 text-base font-semibold text-emerald-950">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-emerald-900/75">
            {step.body}
          </p>
        </article>
      ))}
    </section>
  );
}
