import { XCircleIcon } from "@heroicons/react/24/solid";
import Button from "@/components/shared/Button";

interface ScanErrorModalProps {
  onRetry: () => void;
}

export function ScanErrorModal({ onRetry }: ScanErrorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl bg-white px-9 pb-7 pt-9 shadow-xl">
        <div className="flex flex-col items-center gap-2.5">
          <XCircleIcon className="size-7 text-danger-300" />
          <p className="heading-xl text-center text-text-500">
            Ups! ocurrió un error
          </p>
          <p className="body-lg-regular text-center text-text-400">
            Reintentá el escaneo. Si el problema persiste, ingresá el código
            manualmente o volvé a intentarlo más tarde.
          </p>
        </div>
        <Button variant="primary" size="xs" onClick={onRetry} className="w-full">
          Reintentar
        </Button>
      </div>
    </div>
  );
}
