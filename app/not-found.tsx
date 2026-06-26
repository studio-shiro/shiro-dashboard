import ErrorPage from "@/components/errors/ErrorPage";
import Button from "@/components/shared/Button";

export default function NotFound() {
  return (
    <ErrorPage
      illustration="/images/errors/error-404.svg"
      illustrationWidth={248}
      illustrationHeight={94}
      title="Error 404"
      description={<>Lo sentimos, la página que estás<br />buscando no fue encontrada.</>}
      showLogo
    >
      <Button href="/" size="xs">
        Volver al Dashboard
      </Button>
    </ErrorPage>
  );
}
