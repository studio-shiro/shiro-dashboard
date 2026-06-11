import { cn } from "@/lib/utils";

type StepState = "empty" | "current" | "complete";

interface WizardProgressBarProps {
  steps: StepState[];
}

export function WizardProgressBar({ steps }: WizardProgressBarProps) {
  return (
    <div className="flex gap-2.5">
      {steps.map((state, i) => (
        <div
          key={i}
          className={cn(
            "relative h-2 flex-1 overflow-hidden rounded-full",
            state === "empty" && "bg-background-200",
            state === "current" && "bg-accent-disabled",
            state === "complete" && "bg-accent-selected",
          )}
        >
          {state === "current" && (
            <div className="absolute inset-y-0 left-0 w-[27px] rounded-full bg-accent-selected" />
          )}
        </div>
      ))}
    </div>
  );
}
