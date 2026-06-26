"use client";

import { Montserrat } from "next/font/google";
import "./globals.css";
import ErrorPage from "@/components/errors/ErrorPage";
import Button from "@/components/shared/Button";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: Props) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-body)]">
        <ErrorPage
          illustration="/images/errors/error-500.svg"
          illustrationWidth={261}
          illustrationHeight={225}
          title="Error 500: Error del Server"
          description="Ocurrió un error inesperado. Nuestro equipo ya fue notificado y está trabajando para solucionarlo. Por favor, intentá nuevamente más tarde."
          showLogo
        >
          <Button onClick={reset} size="xs">
            Volver a Cargar Página
          </Button>
        </ErrorPage>
      </body>
    </html>
  );
}
