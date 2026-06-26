"use client";

import { useEffect, useState } from "react";
import ErrorPage from "@/components/errors/ErrorPage";
import Button from "@/components/shared/Button";

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <ErrorPage
        illustration="/images/errors/error-offline.svg"
        illustrationWidth={371}
        illustrationHeight={134}
        title="Sin Conexión a Internet"
        description="Parece que no tenés conexión. Verificá tu acceso a Internet e intentá nuevamente."
        showLogo
      >
        <Button onClick={() => window.location.reload()} size="xs">
          Volver a Cargar Página
        </Button>
      </ErrorPage>
    </div>
  );
}
