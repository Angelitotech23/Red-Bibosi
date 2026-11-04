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
  title: "Red Bibosi",
  description:
    "Foro ciudadano de denuncias vecinales anónimas — Santa Cruz de la Sierra, Bolivia",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-BO" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
