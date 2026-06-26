import ErrorPage from "@/components/errors/ErrorPage";

export default function MaintenancePage() {
  return (
    <ErrorPage
      illustration="/images/errors/error-maintenance.svg"
      illustrationWidth={288}
      illustrationHeight={268}
      title="Sitio en Mantenimiento"
      description="Estamos realizando tareas de mantenimiento para mejorar tu experiencia. Volvé a intentarlo en unos minutos."
      showLogo
    />
  );
}
