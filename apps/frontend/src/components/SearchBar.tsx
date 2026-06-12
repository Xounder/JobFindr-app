import { useState, useCallback, useRef, useEffect, useMemo, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useSuggestions } from "@/hooks";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  isDirty?: boolean;
}

const MAX_SUGGESTIONS = 8;
const TITLES_PER_CATEGORY = 2;

export function SearchBar({
  initialQuery = "",
  onSearch,
  placeholder = "Search jobs by title, company, or keyword…",
  isDirty = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions } = useSuggestions();

  const hasValue = value.trim().length > 0;

  const filteredSuggestions = useMemo(() => {
    if (!suggestions || !hasValue) return { skills: [] as string[], companies: [] as string[], titles: [] as string[] };
    const lower = value.toLowerCase();
    const skills = suggestions.skills
          .filter((s) => s.toLowerCase().includes(lower))
          .slice(0, MAX_SUGGESTIONS);
    const skillsCount = skills.length;
    const remainingAfterSkills = Math.max(0, MAX_SUGGESTIONS - skillsCount);
    const companies = suggestions.companies
          .filter((c) => c.toLowerCase().includes(lower))
          .slice(0, Math.min(TITLES_PER_CATEGORY, remainingAfterSkills));
    const companiesCount = companies.length;
    const remainingAfterCompanies = Math.max(0, remainingAfterSkills - companiesCount);
    const titles = suggestions.titles
          ?.filter((t) => t.toLowerCase().includes(lower))
          .slice(0, Math.min(TITLES_PER_CATEGORY, remainingAfterCompanies)) ?? [];
    return { skills, companies, titles };
  }, [suggestions, value, hasValue]);

  const allSuggestions = useMemo(() => {
    const items: { type: "skill" | "company" | "title"; label: string }[] = [];
    for (const skill of filteredSuggestions.skills) {
      items.push({ type: "skill", label: skill });
    }
    for (const company of filteredSuggestions.companies) {
      items.push({ type: "company", label: company });
    }
    for (const title of filteredSuggestions.titles) {
      items.push({ type: "title", label: title });
    }
    return items;
  }, [filteredSuggestions]);

  const showDropdown = showSuggestions && hasValue && allSuggestions.length > 0;

  const triggerSearch = useCallback(
    (q: string) => {
      setValue(q);
      onSearch(q.trim());
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    },
    [onSearch],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      triggerSearch(value);
    },
    [value, triggerSearch],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < allSuggestions.length) {
          triggerSearch(allSuggestions[highlightedIndex]!.label);
        } else {
          triggerSearch(value);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : allSuggestions.length - 1,
        );
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    },
    [highlightedIndex, allSuggestions, triggerSearch, value],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setHighlightedIndex(-1);
  }, []);

  const handleClear = useCallback(() => {
    setValue("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Delay to allow click on suggestion to register
    setTimeout(() => {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 200);
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut: "/" focuses the search input
  useEffect(() => {
    function handleGlobalKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center gap-2">
      <div ref={wrapperRef} className="relative flex-1">
        {/* Search icon */}
        <svg
          className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
            hasValue ? "text-indigo-500" : "text-gray-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full rounded-lg border py-2.5 pl-10 pr-20 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
            hasValue
              ? "border-indigo-400 ring-1 ring-indigo-400 focus:border-indigo-500 focus:ring-indigo-500"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
          aria-label="Search jobs"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
        {/* Keyboard shortcut hint */}
        {!hasValue && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            /
          </kbd>
        )}

        {/* Clear button */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Suggestions dropdown */}
        {showDropdown && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute z-50 mt-1 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {allSuggestions.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={`${item.type}-${item.label}`}
                  role="option"
                  aria-selected={isHighlighted}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    triggerSearch(item.label);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                    isHighlighted ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.type === "skill" ? (
                    <svg className="h-3.5 w-3.5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ) : item.type === "company" ? (
                    <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {item.type === "skill" ? "Skill" : item.type === "company" ? "Company" : "Title"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="submit"
        className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isDirty
            ? "animate-pulse bg-amber-500 ring-2 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] hover:bg-amber-600"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        Search
      </button>
    </form>
  );
}
