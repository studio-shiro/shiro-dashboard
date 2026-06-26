"use client";

import ErrorPage from "@/components/errors/ErrorPage";
import Button from "@/components/shared/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset }: Props) {
  return (
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
  );
}
