import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  lastUpdated?: ReactNode;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  lastUpdated,
  action,
}: SectionHeaderProps) {
  const hasSubtext = description || lastUpdated;

  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-body text-2xl font-bold leading-none text-text-500">
        {title}
      </h2>
      {(hasSubtext || action) && (
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {description && (
              <p className="body-md-regular text-text-400">{description}</p>
            )}
            {lastUpdated && (
              <p className="body-sm-regular text-text-400">{lastUpdated}</p>
            )}
          </div>
          {action}
        </div>
      )}
    </div>
  );
}
