import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";

interface CancelWizardModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelWizardModal({
  onConfirm,
  onClose,
}: CancelWizardModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative flex w-full max-w-[500px] flex-col gap-5 rounded-xl bg-white p-9 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-text-400 transition-colors hover:text-text-500"
        >
          <XMarkIcon className="size-6" />
        </button>
        <div className="flex flex-col gap-2">
          <p className="heading-lg text-text-500">
            ¿Cancelar la carga de productos?
          </p>
          <p className="body-md-regular text-text-400">
            Todavía no terminaste la carga. Si salís ahora, perderás todos los
            productos ingresados.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="tertiary"
            size="xs"
            onClick={onConfirm}
            className="flex-1"
          >
            Sí, cancelar
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={onClose}
            className="flex-1"
          >
            Continuar Cargando
          </Button>
        </div>
      </div>
    </div>
  );
}
