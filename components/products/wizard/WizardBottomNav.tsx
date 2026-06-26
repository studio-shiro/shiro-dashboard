import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";

interface WizardBottomNavProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  onNextAttempt?: () => void;
}

export function WizardBottomNav({
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled = false,
  backDisabled = false,
  onNextAttempt,
}: WizardBottomNavProps) {
  return (
    <div className="flex h-[84px] items-center justify-between rounded-lg border-t border-border-200 bg-white px-5 py-3 shadow-md">
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
      <div onClick={() => { if (nextDisabled) onNextAttempt?.(); }}>
        <Button
          variant="primary"
          size="xs"
          onClick={onNext}
          disabled={nextDisabled}
          className={nextDisabled ? "pointer-events-none min-w-[158px]" : "min-w-[158px]"}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
