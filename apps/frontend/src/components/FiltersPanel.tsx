import { SenioritySelector } from "./SenioritySelector";
import { CompanyFilters } from "./CompanyFilters";
import { SkillsTagsInput } from "./SkillsTagsInput";
import { TrustFilters } from "./TrustFilters";
import type { FiltersState } from "@/types";

interface FiltersPanelProps {
  filters: FiltersState;
  onSeniorityChange: (value: string) => void;
  onIncludeChange: (companies: string[]) => void;
  onExcludeChange: (companies: string[]) => void;
  onSkillsChange: (skills: string[]) => void;
  onTrustMinChange: (value: number) => void;
  onReset: () => void;
}

export function FiltersPanel({
  filters,
  onSeniorityChange,
  onIncludeChange,
  onExcludeChange,
  onSkillsChange,
  onTrustMinChange,
  onReset,
}: FiltersPanelProps) {
  const hasActiveFilters =
    filters.seniority !== "" ||
    filters.companies.length > 0 ||
    filters.excludeCompanies.length > 0 ||
    filters.skills.length > 0 ||
    filters.trustMin > 0;

  return (
    <aside className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Reset all
          </button>
        )}
      </div>

      <SenioritySelector value={filters.seniority} onChange={onSeniorityChange} />

      <SkillsTagsInput skills={filters.skills} onChange={onSkillsChange} />

      <CompanyFilters
        included={filters.companies}
        excluded={filters.excludeCompanies}
        onIncludeChange={onIncludeChange}
        onExcludeChange={onExcludeChange}
      />

      <TrustFilters value={filters.trustMin} onChange={onTrustMinChange} />
    </aside>
  );
}
