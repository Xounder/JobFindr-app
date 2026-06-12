import { memo, useCallback } from "react";

interface SortToggleProps {
  value: "trust" | "match";
  onChange: (value: "trust" | "match") => void;
}

const OPTIONS = [
  {
    value: "trust",
    label: "Trust Score",
    tooltip: "Sort by provider trust score (highest first)",
  },
  {
    value: "match",
    label: "Match %",
    tooltip: "Sort by skill match percentage (highest first)",
  },
] as const;

function SortToggleComponent({ value, onChange }: SortToggleProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = OPTIONS.findIndex((opt) => opt.value === value);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % OPTIONS.length;
        onChange(OPTIONS[nextIndex]!.value);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
        onChange(OPTIONS[prevIndex]!.value);
      }
    },
    [value, onChange],
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Sort by:</span>
      <div
        role="radiogroup"
        aria-label="Sort order"
        className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm"
        onKeyDown={handleKeyDown}
      >
        {OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              title={option.tooltip}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SortToggle = memo(SortToggleComponent);
