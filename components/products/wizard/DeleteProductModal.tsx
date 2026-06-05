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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl bg-white p-7 shadow-xl">
        <div className="flex flex-col gap-2">
          <p className="heading-lg text-text-500">¿Eliminar Producto?</p>
          <p className="body-md-regular text-text-400">
            Estás por eliminar{" "}
            <span className="body-md-semibold">{productName}</span> de la lista.
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="tertiary" size="xs" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            size="xs"
            onClick={onConfirm}
            className="flex-1 bg-danger-300 text-white hover:bg-red-700"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
