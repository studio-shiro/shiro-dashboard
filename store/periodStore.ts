import { create } from "zustand";
import type { PeriodType, PeriodState } from "@/types/dashboard";

function getDefaultPeriodValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface PeriodStore extends PeriodState {
  setPeriod: (type: PeriodType, value: string) => void;
}

export const usePeriodStore = create<PeriodStore>((set) => ({
  periodType: "month",
  periodValue: getDefaultPeriodValue(),
  setPeriod: (type, value) => set({ periodType: type, periodValue: value }),
}));
