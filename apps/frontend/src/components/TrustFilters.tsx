import { useCallback } from "react";

interface TrustFiltersProps {
  value: number;
  onChange: (value: number) => void;
}

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
      <div className="flex justify-between text-xs text-gray-400">
        <span>0 (Any)</span>
        <span>10 (Highest)</span>
      </div>
    </div>
  );
}
