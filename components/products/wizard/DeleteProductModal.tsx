import { TrashIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";

interface DeleteProductModalProps {
  productName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteProductModal({
  productName,
  onConfirm,
  onClose,
}: DeleteProductModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(56, 58, 61, 0.4)" }}
    >
      <div className="flex w-full max-w-lg flex-col items-center gap-5 rounded-xl bg-white p-9 shadow-2xl">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-50">
          <TrashIcon className="size-7 text-danger-300" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="heading-lg text-text-500">¿Eliminar Producto?</p>
          <p className="body-md-regular max-w-sm text-text-400">
            Esta acción eliminará{" "}
            <span className="body-md-semibold">{productName}</span> de la carga
            actual y no podrá deshacerse.
          </p>
        </div>

        <div className="flex w-full gap-3">
          <Button variant="tertiary" size="xs" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            size="xs"
            onClick={onConfirm}
            className="flex-1 bg-danger-300 text-white hover:bg-red-700"
          >
            Eliminar producto
          </Button>
        </div>
      </div>
    </div>
  );
}
