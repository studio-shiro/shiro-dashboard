import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";

interface WizardBottomNavProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
}

export function WizardBottomNav({
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled = false,
  backDisabled = false,
}: WizardBottomNavProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border-t border-border-200 bg-white px-5 py-3 shadow-sm">
      <Button
        variant="tertiary"
        size="xs"
        onClick={onBack}
        disabled={backDisabled}
        icon={ArrowLeftIcon}
        className="min-w-[108px]"
      >
        Volver
      </Button>
      <Button
        variant="primary"
        size="xs"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
