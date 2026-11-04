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
  title: "Cuadra — Red Bibosi",
  description:
    "Foro ciudadano de denuncias vecinales en Santa Cruz de la Sierra, Bolivia",
};

const THEME_INIT = `(function(){try{var t=localStorage.getItem('cuadra-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es-BO"
      className={`${fraunces.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
      </body>
    </html>
  );
}
