import type { ReactNode } from "react";
import { Fraunces, Outfit } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Cuadra",
  description:
    "Foro ciudadano de seguridad y convivencia por zona — Santa Cruz, Bolivia",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-BO" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
