import { useState, useCallback, useMemo } from "react";

const COUNTRIES = [
  { value: "usa", label: "United States", timezone: "EST/PST" },
  { value: "brazil", label: "Brazil", timezone: "BRT/BRST" },
  { value: "united-kingdom", label: "United Kingdom", timezone: "GMT/BST" },
  { value: "canada", label: "Canada", timezone: "EST/PST" },
  { value: "germany", label: "Germany", timezone: "CET/CEST" },
  { value: "france", label: "France", timezone: "CET/CEST" },
  { value: "australia", label: "Australia", timezone: "AEST/AEDT" },
  { value: "india", label: "India", timezone: "IST" },
  { value: "portugal", label: "Portugal", timezone: "WET/WEST" },
  { value: "spain", label: "Spain", timezone: "CET/CEST" },
  { value: "mexico", label: "Mexico", timezone: "CST/CDT" },
  { value: "argentina", label: "Argentina", timezone: "ART" },
  { value: "netherlands", label: "Netherlands", timezone: "CET/CEST" },
  { value: "japan", label: "Japan", timezone: "JST" },
  { value: "sweden", label: "Sweden", timezone: "CET/CEST" },
] as const;

interface CountryFilterProps {
  value: string[];
  onChange: (countries: string[]) => void;
}

export function CountryFilter({ value, onChange }: CountryFilterProps) {
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(
    () =>
      COUNTRIES.filter(
        (country) =>
          country.label.toLowerCase().includes(search.toLowerCase()) ||
          country.value.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const handleToggle = useCallback(
    (countryValue: string) => {
      if (value.includes(countryValue)) {
        onChange(value.filter((c) => c !== countryValue));
      } else {
        onChange([...value, countryValue]);
      }
    },
    [value, onChange],
  );

  const allFilteredSelected = useMemo(
    () =>
      filteredCountries.length > 0 &&
      filteredCountries.every((c) => value.includes(c.value)),
    [filteredCountries, value],
  );

  const handleSelectAll = useCallback(() => {
    const currentFilteredValues: string[] = filteredCountries.map((c) => c.value);
    if (allFilteredSelected) {
      onChange(value.filter((c) => !currentFilteredValues.includes(c)));
    } else {
      const newSelection = [...value];
      for (const country of currentFilteredValues) {
        if (!newSelection.includes(country)) {
          newSelection.push(country);
        }
      }
      onChange(newSelection);
    }
  }, [filteredCountries, value, allFilteredSelected, onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Countries</label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search countries..."
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {filteredCountries.length > 0 && (
        <button
          type="button"
          onClick={handleSelectAll}
          className="mt-1 text-xs text-indigo-600 hover:text-indigo-800"
        >
          {allFilteredSelected ? "Clear all" : "Select all"}
        </button>
      )}
      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
        {filteredCountries.map((country) => (
          <label
            key={country.value}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={value.includes(country.value)}
              onChange={() => handleToggle(country.value)}
              className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
            />
            <span>{country.label}</span>
            <span className="text-xs text-gray-400">({country.timezone})</span>
          </label>
        ))}
        {filteredCountries.length === 0 && (
          <p className="text-sm text-gray-400">No countries match your search.</p>
        )}
      </div>
      {value.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length} selected
        </p>
      )}
    </div>
  );
}
