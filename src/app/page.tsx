import { SetupChecklist } from "@/components/setup-checklist";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
        <section className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-800">
            Plataforma comunitaria
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">
            Denuncias anónimas para Santa Cruz de la Sierra
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-900/80">
            Red Bibosi da voz a los vecinos sin exponer su identidad. Esta base
            ya conecta Next.js con Supabase de forma segura: las claves secretas
            viven solo en el servidor y en el panel de Vercel.
          </p>
        </section>
        <SetupChecklist />
      </main>
    </div>
  );
}
