import { useMemo } from "react";
import { useSuggestions } from "@/hooks";
import { AutocompleteInput } from "./AutocompleteInput";

interface CompanyFiltersProps {
  included: string[];
  excluded: string[];
  onIncludeChange: (companies: string[]) => void;
  onExcludeChange: (companies: string[]) => void;
  resultSuggestions?: string[];
}

export function CompanyFilters({ included, excluded, onIncludeChange, onExcludeChange, resultSuggestions }: CompanyFiltersProps) {
  const { data: suggestions } = useSuggestions();
  
  const companySuggestions = useMemo(() => {
    // Use result-specific suggestions when available
    if (resultSuggestions && resultSuggestions.length > 0) {
      return resultSuggestions;
    }
    // Fall back to global suggestions
    return suggestions?.companies ?? [];
  }, [resultSuggestions, suggestions]);

  return (
    <div className="space-y-4">
      <AutocompleteInput
        id="include-companies"
        label="Include Companies"
        placeholder="Company name"
        suggestions={companySuggestions}
        selectedItems={included}
        excludeItems={excluded}
        onAdd={(company) => onIncludeChange([...included, company])}
        onRemove={(company) => onIncludeChange(included.filter((c) => c !== company))}
        onClear={() => onIncludeChange([])}
        renderTag={(company, onRemove) => (
          <span
            key={company}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
          >
            {company}
            <button
              type="button"
              onClick={() => onRemove(company)}
              className="text-indigo-600 hover:text-indigo-900"
              aria-label={`Remove ${company}`}
            >
              &times;
            </button>
          </span>
        )}
      />

      <AutocompleteInput
        id="exclude-companies"
        label="Exclude Companies"
        placeholder="Company name"
        suggestions={companySuggestions}
        selectedItems={excluded}
        excludeItems={included}
        onAdd={(company) => onExcludeChange([...excluded, company])}
        onRemove={(company) => onExcludeChange(excluded.filter((c) => c !== company))}
        onClear={() => onExcludeChange([])}
        renderTag={(company, onRemove) => (
          <span
            key={company}
            className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
          >
            {company}
            <button
              type="button"
              onClick={() => onRemove(company)}
              className="text-red-600 hover:text-red-900"
              aria-label={`Remove ${company}`}
            >
              &times;
            </button>
          </span>
        )}
      />
    </div>
  );
}
