"use client";

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function LastUpdated() {
  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleString("es-AR", FORMAT_OPTIONS)}
    </span>
  );
}
