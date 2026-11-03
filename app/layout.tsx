import type { ReactNode } from "react";

export const metadata = {
  title: "Cuadra",
  description:
    "Foro ciudadano de seguridad y convivencia por zona — Santa Cruz, Bolivia",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
