import { useCallback } from "react";
import { trustLabel } from "@/utils";

interface TrustFiltersProps {
  value: number;
  onChange: (value: number) => void;
}

const TICK_MARKS = [
  { value: 0 },
  { value: 2 },
  { value: 4 },
  { value: 6 },
  { value: 8 },
  { value: 10 },
];

export function TrustFilters({ value, onChange }: TrustFiltersProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div>
      <label htmlFor="trust-min" className="block text-sm font-medium text-gray-700">
        Minimum Trust Score: {value}
        <span className="ml-1 text-indigo-600">({trustLabel(value)})</span>
      </label>
      <input
        id="trust-min"
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={handleChange}
        className="mt-1 w-full accent-indigo-600"
      />
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        {TICK_MARKS.map((tick) => (
          <span key={tick.value} className="flex flex-col items-center">
            <span>{tick.value}</span>
            <span className="hidden sm:inline">{trustLabel(tick.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
