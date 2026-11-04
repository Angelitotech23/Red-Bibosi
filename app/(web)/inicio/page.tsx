import { Suspense } from "react";
import Link from "next/link";
import { CommunityFeed } from "@/components/CommunityFeed";
import { FeedSkeleton } from "@/components/FeedSkeleton";

export default function InicioPage() {
  return (
    <div className="page-narrow">
      <section className="hero-block" aria-labelledby="brand-hero">
        <p className="brand-kicker">Santa Cruz de la Sierra</p>
        <h1 id="brand-hero">Red Bibosi</h1>
        <p>
          Denuncias vecinales anónimas: lee rápido, filtra por barrio y actúa
          con seguridad.
        </p>
        <div className="hero-actions">
          <a className="btn btn-secondary" href="#feed-title">
            Ver denuncias
          </a>
          <Link className="btn btn-ghost" href="/mapa">
            Mapa
          </Link>
        </div>
      </section>

      <section aria-labelledby="feed-title">
        <div className="section-head">
          <h2 id="feed-title">Feed ciudadano</h2>
        </div>
        <Suspense fallback={<FeedSkeleton />}>
          <CommunityFeed />
        </Suspense>
      </section>
    </div>
  );
}
