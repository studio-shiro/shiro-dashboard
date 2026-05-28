import type { PeriodType } from "@/types/dashboard";

export interface PeriodOption {
  value: string;
  label: string;
}

export function getPeriodOptions(periodType: PeriodType): PeriodOption[] {
  const now = new Date();

  switch (periodType) {
    case "month": {
      const options: PeriodOption[] = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d
          .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
          .replace(/^\w/, (c) => c.toUpperCase());
        options.push({ value, label });
      }
      return options;
    }

    case "today": {
      const options: PeriodOption[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const value = d.toISOString().slice(0, 10);
        let label: string;
        if (i === 0) {
          label = "Hoy";
        } else if (i === 1) {
          label = "Ayer";
        } else {
          label = d
            .toLocaleDateString("es-AR", { day: "numeric", month: "long" })
            .replace(/^\w/, (c) => c.toUpperCase());
        }
        options.push({ value, label });
      }
      return options;
    }

    case "year": {
      const options: PeriodOption[] = [];
      for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i;
        options.push({ value: String(year), label: String(year) });
      }
      return options;
    }

    case "custom":
      return [];
  }
}

export function getDefaultPeriodValues(
  periodType: PeriodType,
  periodValue?: string,
): [string, string] {
  const now = new Date();

  switch (periodType) {
    case "month": {
      const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previous = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
      return [current, previous];
    }

    case "today": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return [
        now.toISOString().slice(0, 10),
        yesterday.toISOString().slice(0, 10),
      ];
    }

    case "year": {
      return [String(now.getFullYear()), String(now.getFullYear() - 1)];
    }

    case "custom": {
      const value = periodValue ?? `${now.toISOString().slice(0, 10)}_${now.toISOString().slice(0, 10)}`;
      const [fromStr, toStr] = value.split("_");
      const from = new Date(`${fromStr}T00:00:00.000Z`);
      const to = new Date(`${toStr}T00:00:00.000Z`);
      const durationMs = to.getTime() - from.getTime() + 86_400_000;
      const prevTo = new Date(from.getTime() - 1);
      const prevFrom = new Date(from.getTime() - durationMs);
      return [
        value,
        `${prevFrom.toISOString().slice(0, 10)}_${prevTo.toISOString().slice(0, 10)}`,
      ];
    }
  }
}
