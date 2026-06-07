import { SenioritySelector } from "./SenioritySelector";
import { RemoteModeFilter } from "./RemoteModeFilter";
import { CountryFilter } from "./CountryFilter";
import { CompanyFilters } from "./CompanyFilters";
import { SkillsTagsInput } from "./SkillsTagsInput";
import { TrustFilters } from "./TrustFilters";
import { useSearchStore } from "@/store/searchStore";
import { useSkillsModal } from "@/contexts/SkillsModalContext";
import type { FiltersState } from "@/types";

const SENIORITY_DISPLAY: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
  principal: "Principal",
};

interface FiltersPanelProps {
  filters: FiltersState;
  onSeniorityChange: (value: string) => void;
  onRemoteModeChange: (value: string[]) => void;
  onCountriesChange: (countries: string[]) => void;
  onIncludeChange: (companies: string[]) => void;
  onExcludeChange: (companies: string[]) => void;
  onSkillsChange: (skills: string[]) => void;
  onTrustMinChange: (value: number) => void;
  onReset: () => void;
  resultCompanies?: string[];
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
  onReset,
  resultCompanies,
}: FiltersPanelProps) {
  const { userSeniority } = useSearchStore();
  const { openSkillsModal } = useSkillsModal();
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

      {/* Simplified Your Skills indicator (managed in header modal) */}
      <div
        className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 cursor-pointer hover:bg-indigo-50 transition-colors"
        onClick={openSkillsModal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openSkillsModal();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-indigo-900">Your Skills</h3>
        </div>
        {filters.userSkills.length > 0 ? (
          <div className="mt-2">
            <p className="text-xs text-indigo-700">
              {filters.userSkills.length} skill{filters.userSkills.length !== 1 ? "s" : ""} set
              {filters.userSeniority && (
                <span className="ml-1 font-semibold text-indigo-700">
                  &middot; {SENIORITY_DISPLAY[filters.userSeniority] ?? filters.userSeniority}
                </span>
              )}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {filters.userSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-gray-500">No skills set. Add them in the header.</p>
        )}
      </div>

      <SenioritySelector value={filters.seniority} onChange={onSeniorityChange} />
      {userSeniority && userSeniority !== filters.seniority && (
        <button
          type="button"
          onClick={() => onSeniorityChange(userSeniority)}
          className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded"
          title="Click to use your seniority for filtering"
        >
          Use your Seniority: {SENIORITY_DISPLAY[userSeniority] ?? userSeniority}
        </button>
      )}

      <RemoteModeFilter value={filters.remoteMode} onChange={onRemoteModeChange} />

      <CountryFilter value={filters.countries} onChange={onCountriesChange} />

      <SkillsTagsInput skills={filters.skills} onChange={onSkillsChange} />

      <CompanyFilters
        included={filters.companies}
        excluded={filters.excludeCompanies}
        onIncludeChange={onIncludeChange}
        onExcludeChange={onExcludeChange}
        resultSuggestions={resultCompanies}
      />

      <TrustFilters value={filters.trustMin} onChange={onTrustMinChange} />
    </aside>
  );
}
