import { useCallback } from "react";

const REMOTE_MODES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
] as const;

interface RemoteModeFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function RemoteModeFilter({ value, onChange }: RemoteModeFilterProps) {
  const handleToggle = useCallback(
    (mode: string) => {
      if (value.includes(mode)) {
        onChange(value.filter((m) => m !== mode));
      } else {
        onChange([...value, mode]);
      }
    },
    [value, onChange],
  );

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-gray-700">
        Remote Mode
      </legend>
      <div className="mt-2 space-y-2">
        {REMOTE_MODES.map((mode) => (
          <label
            key={mode.value}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={value.includes(mode.value)}
              onChange={() => handleToggle(mode.value)}
              className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
            />
            {mode.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
