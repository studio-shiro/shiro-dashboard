import { useState, useEffect } from "react";

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function useLastUpdated(): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(new Date().toLocaleString("es-AR", FORMAT_OPTIONS));
  }, []);

  return value;
}
