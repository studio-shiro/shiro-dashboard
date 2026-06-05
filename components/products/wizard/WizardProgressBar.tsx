import { cn } from "@/lib/utils";

type StepState = "empty" | "current" | "complete";

interface WizardProgressBarProps {
  steps: [StepState, StepState, StepState];
}

export function WizardProgressBar({ steps }: WizardProgressBarProps) {
  return (
    <div className="flex gap-2.5">
      {steps.map((state, i) => (
        <div
          key={i}
          className="relative h-2 flex-1 overflow-hidden rounded-full bg-background-200"
        >
          {state !== "empty" && (
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full bg-accent",
                state === "complete" ? "w-full" : "w-[27px]",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
