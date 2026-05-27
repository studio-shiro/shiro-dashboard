import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  lastUpdated?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  lastUpdated,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-body text-2xl font-bold leading-none text-text-500">
        {title}
      </h2>
      {(description || lastUpdated) && (
        <div className="flex flex-col">
          {description && (
            <p className="body-md-regular text-text-400">{description}</p>
          )}
          {lastUpdated && (
            <p className="body-sm-regular text-text-400">{lastUpdated}</p>
          )}
        </div>
      )}
    </div>
  );
}
