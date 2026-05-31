import { useCallback } from "react";

const SENIORITY_LEVELS = [
  { value: "", label: "Any" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
];

interface SenioritySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SenioritySelector({ value, onChange }: SenioritySelectorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div>
      <label htmlFor="seniority" className="block text-sm font-medium text-gray-700">
        Seniority
      </label>
      <select
        id="seniority"
        value={value}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {SENIORITY_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
    </div>
  );
}
