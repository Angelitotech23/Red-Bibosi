import { Suspense } from "react";
import { CommunityFeed } from "@/components/CommunityFeed";
import { LoadingState } from "@/components/LoadingState";

export default function InicioPage() {
  return (
    <Suspense fallback={<LoadingState label="Cargando denuncias…" variant="feed" />}>
      <CommunityFeed />
    </Suspense>
  );
}
