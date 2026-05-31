import { SenioritySelector } from "./SenioritySelector";
import { RemoteModeFilter } from "./RemoteModeFilter";
import { CountryFilter } from "./CountryFilter";
import { CompanyFilters } from "./CompanyFilters";
import { SkillsTagsInput } from "./SkillsTagsInput";
import { TrustFilters } from "./TrustFilters";
import { UserSkillsInput } from "./UserSkillsInput";
import type { FiltersState } from "@/types";

interface FiltersPanelProps {
  filters: FiltersState;
  onSeniorityChange: (value: string) => void;
  onRemoteModeChange: (value: string[]) => void;
  onCountriesChange: (countries: string[]) => void;
  onIncludeChange: (companies: string[]) => void;
  onExcludeChange: (companies: string[]) => void;
  onSkillsChange: (skills: string[]) => void;
  onTrustMinChange: (value: number) => void;
  onUserSkillsChange: (skills: string[]) => void;
  onUserSeniorityChange: (seniority: string) => void;
  onMoveToRequired: () => void;
  onReset: () => void;
}

export function FiltersPanel({
  filters,
  onSeniorityChange,
  onRemoteModeChange,
  onCountriesChange,
  onIncludeChange,
  onExcludeChange,
  onSkillsChange,
  onTrustMinChange,
  onUserSkillsChange,
  onUserSeniorityChange,
  onMoveToRequired,
  onReset,
}: FiltersPanelProps) {
  const hasActiveFilters =
    filters.seniority !== "" ||
    filters.remoteMode.length > 0 ||
    filters.countries.length > 0 ||
    filters.companies.length > 0 ||
    filters.excludeCompanies.length > 0 ||
    filters.skills.length > 0 ||
    filters.trustMin > 0 ||
    filters.userSkills.length > 0 ||
    filters.userSeniority !== "";

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

      <UserSkillsInput
        userSkills={filters.userSkills}
        userSeniority={filters.userSeniority}
        onUserSkillsChange={onUserSkillsChange}
        onUserSeniorityChange={onUserSeniorityChange}
        onMoveToRequired={onMoveToRequired}
      />

      <SenioritySelector value={filters.seniority} onChange={onSeniorityChange} />

      <RemoteModeFilter value={filters.remoteMode} onChange={onRemoteModeChange} />

      <CountryFilter value={filters.countries} onChange={onCountriesChange} />

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
