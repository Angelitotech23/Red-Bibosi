import { redirect } from "next/navigation";

/** Entrada raíz: redirige al segmento web (Agente C). */
export default function RootPage() {
  redirect("/inicio");
}
